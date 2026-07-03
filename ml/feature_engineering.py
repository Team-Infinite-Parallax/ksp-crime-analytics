#!/usr/bin/env python3
"""
Karnataka Police — Feature Engineering Pipeline
================================================
Transforms raw Catalyst DataStore tables (CaseMaster, OccurrenceTime,
Accused, DistrictStats, etc.) into model-ready feature matrices for:

  1. Crime Hotspot Prediction   -> spatial + temporal features
  2. District Risk Score        -> aggregate socio-environmental features
  3. Trend Forecasting          -> time-series exogenous regressors
  4. Anomaly Detection          -> anomaly score features
  5. Case Outcome Prediction    -> case lifecycle features

Usage (local, with exported CSVs):
    python feature_engineering.py --data-dir ../data-generator/output --out features/

Catalyst ML Function (QuickML Dataset Prep):
    from ml.feature_engineering import FeaturePipeline
    pipeline = FeaturePipeline(data_dir="./output")
    X_hotspot, X_district, X_trend, X_anomaly = pipeline.run_all()
"""

import argparse
import logging
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

warnings.filterwarnings("ignore")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("FeaturePipeline")


# ---------------------------------------------------------------------------
# 1. RAW DATA LOADER
# ---------------------------------------------------------------------------
class CatalystDataLoader:
    """
    Loads the 28 DataStore table CSVs exported from Zoho Catalyst.

    In production, replace file reads with:
        app = catalyst.initializeApp(req)
        rows = app.datastore().table("CaseMaster").getPagedRows(...)
    """

    REQUIRED_TABLES = [
        "CaseMaster", "OccurrenceTime", "District", "Unit",
        "Accused", "Victim", "ComplainantDetails", "ActSectionAssociation",
        "ChargesheetDetails", "ArrestSurrender", "DistrictStats",
        "CrimeHead", "CrimeSubHead", "GravityOffence", "Employee",
    ]

    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.tables: dict = {}

    def load(self) -> dict:
        log.info(f"Loading tables from {self.data_dir} ...")
        for tbl in self.REQUIRED_TABLES:
            path = self.data_dir / f"{tbl}.csv"
            if path.exists():
                self.tables[tbl] = pd.read_csv(path, low_memory=False)
                log.info(f"  ok {tbl}: {len(self.tables[tbl]):,} rows")
            else:
                log.warning(f"  missing {tbl}: using empty DataFrame")
                self.tables[tbl] = pd.DataFrame()
        return self.tables


# ---------------------------------------------------------------------------
# 2. INDIVIDUAL TRANSFORMERS
# ---------------------------------------------------------------------------

class SpatialFeatureTransformer(BaseEstimator, TransformerMixin):
    """
    Derives spatial features from OccurrenceTime lat/lon coordinates.

    Features:
        lat_norm, lon_norm          -- normalised GPS
        grid_lat, grid_lon          -- 0.01-degree grid (~1.1 km)
        dist_to_hotspot_km          -- Haversine distance to Bengaluru hotspot
        is_urban                    -- within 30 km of hotspot
        spatial_cluster_id          -- DBSCAN cluster label
    """

    HOTSPOT = (12.975, 77.625)
    R_EARTH = 6371.0

    def __init__(self, eps_km: float = 2.0, min_samples: int = 5):
        self.eps_km = eps_km
        self.min_samples = min_samples

    @staticmethod
    def haversine(lat1, lon1, lat2, lon2):
        r = SpatialFeatureTransformer.R_EARTH
        phi1, phi2 = np.radians(lat1), np.radians(lat2)
        dphi = np.radians(lat2 - lat1)
        dlam = np.radians(lon2 - lon1)
        a = np.sin(dphi / 2)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlam / 2)**2
        return 2 * r * np.arcsin(np.sqrt(a))

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()
        lat = pd.to_numeric(df.get("Latitude", pd.Series(0.0, index=df.index)), errors="coerce").fillna(0.0)  # type: ignore
        lon = pd.to_numeric(df.get("Longitude", pd.Series(0.0, index=df.index)), errors="coerce").fillna(0.0)  # type: ignore

        out = pd.DataFrame({
            "lat_norm":            lat,
            "lon_norm":            lon,
            "grid_lat":            (lat / 0.01).round() * 0.01,
            "grid_lon":            (lon / 0.01).round() * 0.01,
            "dist_to_hotspot_km":  self.haversine(lat, lon, self.HOTSPOT[0], self.HOTSPOT[1]),
            "is_urban":            (self.haversine(lat, lon, self.HOTSPOT[0], self.HOTSPOT[1]) < 30).astype(int),
        })

        try:
            from sklearn.cluster import DBSCAN
            coords = np.asarray(np.deg2rad(np.column_stack([lat.to_numpy(), lon.to_numpy()])), dtype=np.float64)
            eps_rad = self.eps_km / self.R_EARTH
            out["spatial_cluster_id"] = DBSCAN(
                eps=eps_rad, min_samples=self.min_samples, metric="haversine"
            ).fit_predict(coords)  # type: ignore
        except Exception:
            out["spatial_cluster_id"] = -1

        log.info("  [SpatialFeatures] 7 features")
        return out


class TemporalFeatureTransformer(BaseEstimator, TransformerMixin):
    """
    Derives rich temporal features from incident date/time columns.

    Features:
        hour_of_day, day_of_week, month, quarter, year
        is_weekend, is_night (22:00-05:00), is_festival_month
        season  (1=Winter, 2=Summer, 3=Monsoon, 4=Post-Monsoon)
        days_since_epoch
        registration_lag_days
        incident_duration_hours
    """

    FESTIVAL_MONTHS = {10, 11, 3}
    SEASON_MAP = {12: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 2,
                  6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4}

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        p = lambda col: pd.to_datetime(X[col] if col in X.columns else pd.Series(pd.NaT, index=X.index), errors="coerce")
        incident  = p("IncidentFromDate")
        info_recv = p("InfoReceivedPSDate")
        reg_date  = p("RegistrationDate")
        incident_to = p("IncidentToDate")

        hour  = incident.dt.hour.fillna(12)  # type: ignore
        dow   = incident.dt.dayofweek.fillna(0)  # type: ignore
        month = incident.dt.month.fillna(1)  # type: ignore
        year  = incident.dt.year.fillna(2024)  # type: ignore

        out = pd.DataFrame({
            "hour_of_day":             hour.astype(int),
            "day_of_week":             dow.astype(int),
            "month":                   month.astype(int),
            "quarter":                 ((month - 1) // 3 + 1).astype(int),
            "year":                    year.astype(int),
            "is_weekend":              (dow >= 5).astype(int),
            "is_night":                ((hour >= 22) | (hour <= 5)).astype(int),
            "is_festival_month":       month.isin(self.FESTIVAL_MONTHS).astype(int),
            "season":                  month.map(self.SEASON_MAP).fillna(1).astype(int),
            "days_since_epoch":        (incident - pd.Timestamp("2023-01-01")).dt.days.fillna(0).astype(int),  # type: ignore
            "registration_lag_days":   (reg_date - info_recv).dt.days.clip(0, 30).fillna(0).astype(int),  # type: ignore
            "incident_duration_hours": (
                (incident_to - incident).dt.total_seconds().div(3600)  # type: ignore
                .clip(0, 720).fillna(0)
            ),
        })
        log.info("  [TemporalFeatures] 12 features")
        return out


class CaseFeatureTransformer(BaseEstimator, TransformerMixin):
    """
    Extracts categorical and operational features from CaseMaster.

    Features:
        crime_head_id, crime_sub_head_id, gravity_id
        case_category_id, case_status_id
        is_heinous, is_cyber_crime, is_property_crime
        accused_count, victim_count
        has_arrest, has_chargesheet
        chargesheet_type_ord  (A=2, B=1, C=0)
        arrest_lag_days
    """

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        def si(col, default=0):
            val = X[col] if col in X.columns else pd.Series(default, index=X.index)
            return pd.to_numeric(val, errors="coerce").fillna(default).astype(int)  # type: ignore

        cs_map = {"A": 2, "B": 1, "C": 0}
        cs_ord = X.get("CSType", pd.Series([-1] * len(X))).map(cs_map).fillna(-1).astype(int)  # type: ignore

        out = pd.DataFrame({
            "crime_head_id":       si("CrimeHeadID"),
            "crime_sub_head_id":   si("CrimeSubHeadID"),
            "gravity_id":          si("GravityOffenceID"),
            "case_category_id":    si("CaseCategoryID"),
            "case_status_id":      si("CaseStatusID"),
            "is_heinous":          (si("GravityOffenceID") == 1).astype(int),
            "is_cyber_crime":      (si("CrimeHeadID") == 5).astype(int),
            "is_property_crime":   (si("CrimeHeadID") == 2).astype(int),
            "accused_count":       si("accused_count", 1),
            "victim_count":        si("victim_count", 1),
            "has_arrest":          si("has_arrest"),
            "has_chargesheet":     si("has_chargesheet"),
            "chargesheet_type_ord":cs_ord,
            "arrest_lag_days":     pd.Series(pd.to_numeric(
                X.get("arrest_lag_days", pd.Series(-1, index=X.index)), errors="coerce"
            )).fillna(-1).astype(int),  # type: ignore
        })
        log.info("  [CaseFeatures] 14 features")
        return out


class AccusedFeatureTransformer(BaseEstimator, TransformerMixin):
    """
    Aggregates accused-level features per case.

    Features:
        repeat_offender_count, network_member_count
        avg_accused_age, is_gang_case, avg_prior_offenses
    """

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        def sf(col, default=0):
            val = X[col] if col in X.columns else pd.Series(default, index=X.index)
            return pd.to_numeric(val, errors="coerce").fillna(default)  # type: ignore

        out = pd.DataFrame({
            "repeat_offender_count": sf("RepeatOffenderCount"),
            "network_member_count":  sf("NetworkMemberCount"),
            "avg_accused_age":       sf("AvgAccusedAge", 30),
            "is_gang_case":          (sf("NetworkMemberCount") >= 3).astype(int),
            "avg_prior_offenses":    sf("AvgPriorOffenses"),
        })
        log.info("  [AccusedFeatures] 5 features")
        return out


class DistrictRiskFeatureTransformer(BaseEstimator, TransformerMixin):
    """
    Builds district-level socio-economic risk features.

    Features:
        population_density, urbanisation_rate, literacy_rate, poverty_index
        police_station_density, cases_per_100k, clearance_rate_3mo
        heinous_crime_ratio, cyber_crime_growth_rate, seasonal_index
        risk_score_composite  (weighted combination)
    """

    WEIGHTS = {
        "cases_per_100k":          0.30,
        "heinous_crime_ratio":     0.25,
        "clearance_rate_3mo":     -0.20,
        "cyber_crime_growth_rate": 0.15,
        "poverty_index":           0.10,
    }

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        def sf(col, default=0.0):
            val = X[col] if col in X.columns else pd.Series(default, index=X.index)
            return pd.to_numeric(val, errors="coerce").fillna(default)  # type: ignore

        out = pd.DataFrame({
            "population_density":      sf("PopulationDensity"),
            "urbanisation_rate":       sf("UrbanisationRate"),
            "literacy_rate":           sf("LiteracyRate"),
            "poverty_index":           sf("PovertyIndex"),
            "police_station_density":  sf("PoliceStationDensity"),
            "cases_per_100k":          sf("CasesPer100k"),
            "clearance_rate_3mo":      sf("ClearanceRate3Mo"),
            "heinous_crime_ratio":     sf("HeinousCrimeRatio"),
            "cyber_crime_growth_rate": sf("CyberCrimeGrowthRate"),
            "seasonal_index":          sf("SeasonalIndex"),
        })

        score_cols = [c for c in self.WEIGHTS if c in out.columns]
        if score_cols:
            scaler = MinMaxScaler()
            normed = pd.DataFrame(
                scaler.fit_transform(out[score_cols].values),
                columns=score_cols
            )
            out["risk_score_composite"] = sum(
                normed[col] * w for col, w in self.WEIGHTS.items() if col in normed.columns
            )
        else:
            out["risk_score_composite"] = 0.0

        log.info("  [DistrictRiskFeatures] 11 features")
        return out


class MOTextFeatureTransformer(BaseEstimator, TransformerMixin):
    """
    Extracts NLP features from BriefFacts and MOPhrase columns.

    Base features (always):
        5 MO keyword flags (window_entry, bank_impersonation, etc.)
        mo_text_length, mo_word_count

    Optional (when sklearn available):
        mo_svd_0 .. mo_svd_{n_components-1}  (TF-IDF + TruncatedSVD)
    """

    MO_KEYWORDS = {
        "mo_flag_window_entry":       ["window", "balcony", "grill"],
        "mo_flag_bank_impersonation": ["bank", "official", "kyc"],
        "mo_flag_chain_snatching":    ["chain", "snatch", "neck"],
        "mo_flag_cyber_upi":          ["upi", "otp", "phishing", "link"],
        "mo_flag_night_crime":        ["night", "midnight", "dark"],
    }

    def __init__(self, n_components: int = 10):
        self.n_components = n_components
        self._tfidf = None
        self._svd = None

    def _get_text(self, X: pd.DataFrame) -> pd.Series:
        brief = X.get("BriefFacts", pd.Series([""] * len(X))).fillna("")  # type: ignore
        mo    = X.get("MOPhrase",   pd.Series([""] * len(X))).fillna("")  # type: ignore
        return (brief.astype(str) + " " + mo.astype(str)).str.lower()

    def fit(self, X, y=None):
        try:
            from sklearn.decomposition import TruncatedSVD
            from sklearn.feature_extraction.text import TfidfVectorizer
            self._tfidf = TfidfVectorizer(max_features=200, stop_words="english")
            self._svd = TruncatedSVD(n_components=self.n_components, random_state=42)
            mat = self._tfidf.fit_transform(self._get_text(X))
            self._svd.fit(mat)
        except Exception as e:
            log.warning(f"TF-IDF fit failed: {e}")
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        texts = self._get_text(X)
        out = pd.DataFrame(index=X.index)

        for flag, kws in self.MO_KEYWORDS.items():
            out[flag] = texts.str.contains("|".join(kws), regex=True, na=False).astype(int)

        out["mo_text_length"] = texts.str.len().fillna(0).astype(int)  # type: ignore
        out["mo_word_count"]  = texts.str.split().str.len().fillna(0).astype(int)  # type: ignore

        if self._tfidf and self._svd:
            try:
                mat = self._tfidf.transform(texts)
                svd = self._svd.transform(mat)
                for i in range(self.n_components):
                    out[f"mo_svd_{i}"] = svd[:, i]
            except Exception:
                pass

        log.info(f"  [MOTextFeatures] {len(out.columns)} features")
        return out


# ---------------------------------------------------------------------------
# 3. MASTER FEATURE PIPELINE
# ---------------------------------------------------------------------------

class FeaturePipeline:
    """
    Orchestrates loading, joining, and all transformers to produce
    four model-specific feature matrices.

    Output:
        X_hotspot  -- row = case, spatial + temporal + case features
        X_district -- row = (district, month) risk features
        X_trend    -- row = (unit, week) for Prophet / ARIMA
        X_anomaly  -- row = case, full wide matrix for Isolation Forest
    """

    def __init__(self, data_dir: str = "./output", out_dir: str = "./features"):
        self.data_dir = data_dir
        self.out_dir = Path(out_dir)
        self.out_dir.mkdir(parents=True, exist_ok=True)
        self.loader = CatalystDataLoader(data_dir)
        self.tables: dict = {}
        self.master: pd.DataFrame = pd.DataFrame()

    def _load_and_join(self):
        self.tables = self.loader.load()
        cm  = self.tables.get("CaseMaster", pd.DataFrame())
        ot  = self.tables.get("OccurrenceTime", pd.DataFrame())
        acc = self.tables.get("Accused", pd.DataFrame())
        cs  = self.tables.get("ChargesheetDetails", pd.DataFrame())
        arr = self.tables.get("ArrestSurrender", pd.DataFrame())
        vic = self.tables.get("Victim", pd.DataFrame())

        log.info("Joining CaseMaster <- OccurrenceTime ...")
        self.master = cm.merge(ot, on="CaseID", how="left", suffixes=("", "_ot")) \
            if not cm.empty and not ot.empty else cm.copy()

        # Accused aggregates
        if not acc.empty and "CaseID" in acc.columns:
            for col, default in [("IsRepeatOffender", 0), ("IsNetworkMember", 0), ("Age", 30), ("PriorOffenseCount", 0)]:
                if col not in acc.columns:
                    acc[col] = default
            agg = acc.groupby("CaseID").agg(
                accused_count       =("AccusedID", "count"),
                RepeatOffenderCount =("IsRepeatOffender", "sum"),
                NetworkMemberCount  =("IsNetworkMember", "sum"),
                AvgAccusedAge       =("Age", "mean"),
                AvgPriorOffenses    =("PriorOffenseCount", "mean"),
            ).reset_index()
            self.master = self.master.merge(agg, on="CaseID", how="left")

        # Victim count
        if not vic.empty and "CaseID" in vic.columns:
            vagg = vic.groupby("CaseID").size().reset_index(name="victim_count")
            self.master = self.master.merge(vagg, on="CaseID", how="left")

        # Chargesheet outcomes
        if not cs.empty and "CaseID" in cs.columns:
            cs_slim = cs[["CaseID", "CSType"]].drop_duplicates("CaseID").copy()
            cs_slim["has_chargesheet"] = 1
            self.master = self.master.merge(cs_slim, on="CaseID", how="left")
        else:
            self.master["has_chargesheet"] = 0
            self.master["CSType"] = np.nan

        # Arrest flag + lag
        if not arr.empty and "CaseID" in arr.columns:
            aagg = arr.groupby("CaseID").agg(
                has_arrest        =("ArrestID", "count"),
                first_arrest_date =("ArrestDate", "min"),
            ).reset_index()
            aagg["has_arrest"] = (aagg["has_arrest"] > 0).astype(int)
            self.master = self.master.merge(aagg, on="CaseID", how="left")
            reg = pd.to_datetime(self.master["RegistrationDate"] if "RegistrationDate" in self.master.columns else pd.Series(pd.NaT, index=self.master.index), errors="coerce")
            arr_ = pd.to_datetime(self.master["first_arrest_date"] if "first_arrest_date" in self.master.columns else pd.Series(pd.NaT, index=self.master.index), errors="coerce")
            self.master["arrest_lag_days"] = (arr_ - reg).dt.days.clip(0, 365)  # type: ignore
        else:
            self.master["has_arrest"] = 0
            self.master["arrest_lag_days"] = -1

        self.master.fillna({"has_arrest": 0, "has_chargesheet": 0}, inplace=True)  # type: ignore
        log.info(f"Master table shape: {self.master.shape}")

    def build_hotspot_features(self) -> pd.DataFrame:
        log.info("== Building HOTSPOT features ==")
        s = SpatialFeatureTransformer().fit(self.master).transform(self.master)
        t = TemporalFeatureTransformer().fit(self.master).transform(self.master)
        c = CaseFeatureTransformer().fit(self.master).transform(self.master)
        X = pd.concat([s, t, c], axis=1)
        X["target_is_hotspot"] = (
            (s["spatial_cluster_id"] >= 0) & (s["dist_to_hotspot_km"] < 2.0)
        ).astype(int)
        log.info(f"  Hotspot matrix: {X.shape} | positives: {X['target_is_hotspot'].sum()}")
        return X

    def build_district_features(self) -> pd.DataFrame:
        log.info("== Building DISTRICT RISK features ==")
        ds = self.tables.get("DistrictStats", pd.DataFrame())
        cm = self.tables.get("CaseMaster", pd.DataFrame())

        if ds.empty:
            log.warning("  DistrictStats missing — returning minimal aggregates.")
            if cm.empty:
                return pd.DataFrame()
            return cm.groupby("DistrictID").size().reset_index(name="total_cases")

        if not cm.empty and "DistrictID" in cm.columns:
            agg = cm.groupby("DistrictID").agg(
                total_cases       =("CaseID", "count"),
                heinous_cases     =("GravityOffenceID", lambda x: (x == 1).sum()),
                cyber_cases       =("CrimeHeadID",      lambda x: (x == 5).sum()),
            ).reset_index()
            agg["HeinousCrimeRatio"] = agg["heinous_cases"] / agg["total_cases"].clip(1)
            agg["CasesPer100k"]       = 0.0
            agg["CyberCrimeGrowthRate"] = 0.0
            ds = ds.merge(agg, on="DistrictID", how="left")

        risk = DistrictRiskFeatureTransformer().fit(ds).transform(ds)
        result = pd.concat([ds[["DistrictID"]].reset_index(drop=True),
                            risk.reset_index(drop=True)], axis=1)
        log.info(f"  District matrix: {result.shape}")
        return result

    def build_trend_features(self) -> pd.DataFrame:
        log.info("== Building TREND FORECASTING features ==")
        cm = self.tables.get("CaseMaster", pd.DataFrame())
        if cm.empty:
            return pd.DataFrame()

        cm = cm.copy()
        cm["reg_date"]   = pd.to_datetime(cm["RegistrationDate"] if "RegistrationDate" in cm.columns else pd.Series(pd.NaT, index=cm.index), errors="coerce")
        cm["week_start"] = cm["reg_date"] - pd.to_timedelta(cm["reg_date"].dt.dayofweek, unit="d")  # type: ignore

        grp = cm.groupby(["UnitID", "week_start"]).agg(
            y             =("CaseID", "count"),
            heinous_count =("GravityOffenceID", lambda x: (x == 1).sum()),
            cyber_count   =("CrimeHeadID",      lambda x: (x == 5).sum()),
        ).reset_index()
        grp.rename(columns={"week_start": "ds"}, inplace=True)
        grp["is_festival_week"] = grp["ds"].dt.month.isin([10, 11, 3]).astype(int)
        grp["week_of_year"]     = grp["ds"].dt.isocalendar().week.astype(int)
        grp["month"]            = grp["ds"].dt.month  # type: ignore
        grp["year"]             = grp["ds"].dt.year  # type: ignore
        log.info(f"  Trend matrix: {grp.shape}")
        return grp

    def build_anomaly_features(self) -> pd.DataFrame:
        log.info("== Building ANOMALY DETECTION features ==")
        s = SpatialFeatureTransformer().fit(self.master).transform(self.master)
        t = TemporalFeatureTransformer().fit(self.master).transform(self.master)
        c = CaseFeatureTransformer().fit(self.master).transform(self.master)
        a = AccusedFeatureTransformer().fit(self.master).transform(self.master)
        mo_tr = MOTextFeatureTransformer(n_components=10)
        mo_tr.fit(self.master)
        m = mo_tr.transform(self.master)
        X = pd.concat([s, t, c, a, m], axis=1)
        if "CaseID" in self.master.columns:
            X.insert(0, "CaseID", self.master["CaseID"])
        log.info(f"  Anomaly matrix: {X.shape}")
        return X

    def run_all(self):
        self._load_and_join()
        results = {
            "hotspot_features":  self.build_hotspot_features(),
            "district_features": self.build_district_features(),
            "trend_features":    self.build_trend_features(),
            "anomaly_features":  self.build_anomaly_features(),
        }
        for name, df in results.items():
            if df is not None and not df.empty:
                try:
                    df.to_parquet(self.out_dir / f"{name}.parquet", index=False)
                except Exception:
                    df.to_csv(self.out_dir / f"{name}.csv", index=False)
                log.info(f"  Saved: {self.out_dir}/{name}")
        return tuple(results.values())


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KSP Feature Engineering Pipeline")
    parser.add_argument("--data-dir", default="../data-generator/output")
    parser.add_argument("--out",      default="features")
    args = parser.parse_args()

    pipeline = FeaturePipeline(data_dir=args.data_dir, out_dir=args.out)
    X_h, X_d, X_t, X_a = pipeline.run_all()

    print("\n" + "=" * 60)
    print("  Feature Engineering Complete")
    print(f"  Hotspot  : {X_h.shape}")
    print(f"  District : {X_d.shape}")
    print(f"  Trend    : {X_t.shape}")
    print(f"  Anomaly  : {X_a.shape}")
    print("=" * 60)
