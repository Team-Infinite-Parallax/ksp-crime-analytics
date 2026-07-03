#!/usr/bin/env python3
"""
Karnataka Police — AI Prediction Models
=========================================
Five production-grade ML models:

  1. HotspotPredictor       -- XGBoost spatial classification
  2. DistrictRiskScorer     -- Gradient Boosting risk regression
  3. TrendForecaster        -- Prophet time-series model
  4. AnomalyDetector        -- Isolation Forest outlier detection
  5. CaseOutcomePredictor   -- Random Forest chargesheet outcome

Each model includes:
  - fit(X, y) / predict(X) interface
  - Feature importance extraction
  - SHAP explainability (ExplainabilityWrapper)
  - JSON-serialisable result format for Catalyst API responses

Usage:
    from ml.models import HotspotPredictor, DistrictRiskScorer
    from ml.feature_engineering import FeaturePipeline

    pipeline = FeaturePipeline(data_dir="./output")
    X_h, X_d, X_t, X_a = pipeline.run_all()

    hp = HotspotPredictor()
    hp.fit(X_h.drop("target_is_hotspot", axis=1), X_h["target_is_hotspot"])
    predictions = hp.predict(X_h.drop("target_is_hotspot", axis=1))
"""

import json
import logging
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
log = logging.getLogger("KSPModels")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


# ---------------------------------------------------------------------------
# SHARED UTILITIES
# ---------------------------------------------------------------------------

def _safe_import(module: str, pkg: str | None = None):
    """Import optional ML dependency gracefully."""
    try:
        import importlib
        return importlib.import_module(module)
    except ImportError:
        log.warning(f"Optional dependency missing: {pkg or module}. Install with: pip install {pkg or module}")
        return None


class ExplainabilityWrapper:
    """
    SHAP-based explainability layer wrapping any sklearn-compatible model.

    Provides:
        - feature_importance()   -- model-native importance (Gini / gain)
        - shap_values(X)         -- SHAP explanation matrix
        - top_features(X, n)     -- top-N contributing features for each sample
        - to_json(X, case_ids)   -- Catalyst-API-ready explanation dict
    """

    def __init__(self, model, feature_names: list[str]):
        self.model = model
        self.feature_names = feature_names
        self._explainer = None

    def _build_explainer(self, X_train: pd.DataFrame):
        shap = _safe_import("shap")
        if shap is None:
            return
        try:
            self._explainer = shap.TreeExplainer(self.model)
        except Exception:
            try:
                self._explainer = shap.Explainer(self.model, X_train)
            except Exception as e:
                log.warning(f"SHAP explainer creation failed: {e}")

    def feature_importance(self) -> pd.Series:
        """Returns feature importances as a sorted Series."""
        if hasattr(self.model, "feature_importances_"):
            return pd.Series(
                self.model.feature_importances_,
                index=self.feature_names
            ).sort_values(ascending=False)
        return pd.Series(dtype=float)

    def shap_values(self, X: pd.DataFrame) -> np.ndarray | None:
        if self._explainer is None:
            return None
        try:
            vals = self._explainer.shap_values(X)
            return vals[1] if isinstance(vals, list) else vals
        except Exception:
            return None

    def top_features(self, X: pd.DataFrame, n: int = 5) -> list[list[dict]]:
        """
        Returns top-N SHAP features per row.
        Format: [[{feature, value, shap_contribution}, ...], ...]
        """
        sv = self.shap_values(X)
        if sv is None:
            # Fall back to global importance
            imp = self.feature_importance()
            top = imp.head(n).index.tolist()
            return [[{"feature": f, "value": None, "shap": None} for f in top]] * len(X)

        results = []
        for i in range(len(X)):
            row_shap = sv[i]
            top_idx  = np.argsort(np.abs(row_shap))[::-1][:n]
            results.append([{
                "feature":    self.feature_names[j],
                "value":      float(X.iloc[i, j]) if j < len(X.columns) else None,
                "shap":       float(row_shap[j]),
            } for j in top_idx])
        return results

    def to_json(self, X: pd.DataFrame, ids: list | None = None) -> list[dict]:
        """
        Produces Catalyst API-compatible explanation records.
        """
        imp   = self.feature_importance()
        tops  = self.top_features(X)
        ids   = ids if ids is not None else list(range(len(X)))
        return [
            {
                "id":              ids[i],
                "top_features":    tops[i],
                "global_importance": imp.head(10).to_dict(),
            }
            for i in range(len(X))
        ]


# ---------------------------------------------------------------------------
# MODEL 1: CRIME HOTSPOT PREDICTOR
# ---------------------------------------------------------------------------

class HotspotPredictor:
    """
    Binary classifier identifying crime hotspot locations.

    Algorithm:     XGBoost (gradient boosted trees)
    Target:        is_hotspot (1 = cluster within 2km of known hotspot)
    Key features:  lat, lon, dist_to_hotspot_km, hour_of_day, is_night,
                   crime_sub_head_id, spatial_cluster_id

    Zoho Catalyst QuickML Mapping:
        Dataset:   hotspot_features.parquet
        Task type: Binary Classification
        Target:    target_is_hotspot
        Algorithm: AutoML (maps to XGBoost internally)

    Output schema (per prediction):
        {
          "case_id": str,
          "is_hotspot": bool,
          "hotspot_probability": float,
          "risk_level": "HIGH" | "MEDIUM" | "LOW",
          "grid": {"lat": float, "lon": float},
          "explanation": [...]
        }
    """

    RISK_THRESHOLDS = {"HIGH": 0.75, "MEDIUM": 0.45}

    def __init__(self, n_estimators: int = 200, max_depth: int = 6):
        self.n_estimators = n_estimators
        self.max_depth    = max_depth
        self._model       = None
        self._explainer   = None
        self._feature_names: list[str] = []

    def _build_model(self):
        xgb = _safe_import("xgboost")
        if xgb:
            return xgb.XGBClassifier(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                scale_pos_weight=10,  # handles class imbalance
                use_label_encoder=False,
                eval_metric="logloss",
                random_state=42,
            )
        # Fallback to sklearn GradientBoostingClassifier
        from sklearn.ensemble import GradientBoostingClassifier
        return GradientBoostingClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            random_state=42,
        )

    def fit(self, X: pd.DataFrame, y: pd.Series, X_val=None, y_val=None):
        from sklearn.preprocessing import StandardScaler
        self._feature_names = list(X.columns)
        self._scaler = StandardScaler()
        X_scaled = pd.DataFrame(
            self._scaler.fit_transform(X.fillna(0)),
            columns=self._feature_names
        )
        self._model = self._build_model()
        if X_val is not None and type(self._model).__name__ == "XGBClassifier":
            fit_kwargs = {
                "eval_set": [(
                    pd.DataFrame(self._scaler.transform(X_val.fillna(0)), columns=self._feature_names),
                    y_val
                )],
                "early_stopping_rounds": 20,
                "verbose": False,
            }
            self._model.fit(X_scaled, y, **fit_kwargs)  # type: ignore
        else:
            self._model.fit(X_scaled, y)

        self._explainer = ExplainabilityWrapper(self._model, self._feature_names)
        self._explainer._build_explainer(X_scaled)
        log.info("HotspotPredictor trained.")
        return self

    def predict(self, X: pd.DataFrame, case_ids: list | None = None) -> list[dict]:
        if self._scaler is None or self._model is None:
            raise ValueError("Model is not fitted. Call fit() first.")
        X_scaled = pd.DataFrame(
            self._scaler.transform(X.fillna(0)),
            columns=self._feature_names
        )
        probs = self._model.predict_proba(X_scaled)[:, 1]
        preds = (probs >= self.RISK_THRESHOLDS["MEDIUM"]).astype(int)

        results = []
        for i in range(len(X)):
            p = float(probs[i])
            level = ("HIGH" if p >= self.RISK_THRESHOLDS["HIGH"]
                     else "MEDIUM" if p >= self.RISK_THRESHOLDS["MEDIUM"]
                     else "LOW")
            results.append({
                "case_id":             str(case_ids[i]) if case_ids else str(i),
                "is_hotspot":          bool(preds[i]),
                "hotspot_probability": round(p, 4),
                "risk_level":          level,
                "grid": {
                    "lat": round(float(X.iloc[i].get("grid_lat", 0)), 2),
                    "lon": round(float(X.iloc[i].get("grid_lon", 0)), 2),
                },
            })
        return results

    def get_hotspot_grid(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregates predictions into a geographical risk grid for heatmap rendering.
        Returns a DataFrame with columns: grid_lat, grid_lon, crime_count, avg_risk.
        """
        preds = self.predict(X)
        df = X[["grid_lat", "grid_lon"]].copy()
        df["hotspot_probability"] = [p["hotspot_probability"] for p in preds]
        grid = df.groupby(["grid_lat", "grid_lon"]).agg(
            crime_count=("hotspot_probability", "count"),
            avg_risk   =("hotspot_probability", "mean"),
        ).reset_index()
        return grid.sort_values("avg_risk", ascending=False)

    def explain(self, X: pd.DataFrame, case_ids: list | None = None) -> list[dict]:
        if self._scaler is None or self._explainer is None:
            raise ValueError("Model is not fitted. Call fit() first.")
        X_scaled = pd.DataFrame(
            self._scaler.transform(X.fillna(0)),
            columns=self._feature_names
        )
        return self._explainer.to_json(X_scaled, ids=case_ids)


# ---------------------------------------------------------------------------
# MODEL 2: DISTRICT RISK SCORER
# ---------------------------------------------------------------------------

class DistrictRiskScorer:
    """
    Regression model producing a 0-100 risk score per district per month.

    Algorithm:     Gradient Boosting Regressor
    Target:        risk_score_composite (from DistrictRiskFeatureTransformer)
    Key features:  cases_per_100k, heinous_crime_ratio, clearance_rate_3mo,
                   cyber_crime_growth_rate, poverty_index, seasonal_index

    Zoho Catalyst QuickML Mapping:
        Dataset:   district_features.parquet
        Task type: Regression
        Target:    risk_score_composite
        Algorithm: AutoML (GBM/XGBoost)

    Output schema:
        {
          "district_id": int,
          "district_name": str,
          "risk_score": float (0-100),
          "risk_tier": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
          "top_drivers": [...]
        }
    """

    TIER_THRESHOLDS = {"CRITICAL": 80, "HIGH": 60, "MODERATE": 40}

    def __init__(self):
        self._model     = None
        self._explainer = None
        self._scaler    = None
        self._feature_names: list[str] = []
        self._district_names: dict = {}

    def _build_model(self):
        try:
            from sklearn.ensemble import GradientBoostingRegressor
            return GradientBoostingRegressor(
                n_estimators=150, max_depth=4,
                learning_rate=0.05, subsample=0.9,
                random_state=42,
            )
        except Exception:
            from sklearn.linear_model import Ridge
            return Ridge()

    def fit(self, X: pd.DataFrame, y: pd.Series,
            district_names: dict | None = None):
        from sklearn.preprocessing import StandardScaler
        self._district_names = district_names or {}
        feat_cols = [c for c in X.columns if c != "DistrictID"]
        self._feature_names = feat_cols
        self._scaler = StandardScaler()
        X_scaled = self._scaler.fit_transform(X[feat_cols].fillna(0))
        self._model = self._build_model()
        self._model.fit(X_scaled, y)
        self._explainer = ExplainabilityWrapper(self._model, feat_cols)
        self._explainer._build_explainer(
            pd.DataFrame(X_scaled, columns=feat_cols)
        )
        log.info("DistrictRiskScorer trained.")
        return self

    def predict(self, X: pd.DataFrame) -> list[dict]:
        if self._scaler is None or self._model is None or self._explainer is None:
            raise ValueError("Model is not fitted. Call fit() first.")
        feat_cols = self._feature_names
        X_scaled = self._scaler.transform(X[feat_cols].fillna(0))
        raw_scores = self._model.predict(X_scaled)
        # Normalise to 0-100
        scores = np.clip((raw_scores - raw_scores.min()) /
                         (raw_scores.ptp() + 1e-9) * 100, 0, 100)

        explanations = self._explainer.to_json(
            pd.DataFrame(X_scaled, columns=feat_cols),
            ids=X.get("DistrictID", pd.Series(range(len(X)))).tolist()
        )

        results = []
        for i, row in X.iterrows():
            idx = list(X.index).index(i)
            score = float(scores[idx])
            tier = (
                "CRITICAL" if score >= self.TIER_THRESHOLDS["CRITICAL"]
                else "HIGH"     if score >= self.TIER_THRESHOLDS["HIGH"]
                else "MODERATE" if score >= self.TIER_THRESHOLDS["MODERATE"]
                else "LOW"
            )
            results.append({
                "district_id":   int(row.get("DistrictID", -1)),
                "district_name": self._district_names.get(
                    int(row.get("DistrictID", -1)), "Unknown"
                ),
                "risk_score":    round(score, 2),
                "risk_tier":     tier,
                "top_drivers":   explanations[idx]["top_features"],
            })
        return results


# ---------------------------------------------------------------------------
# MODEL 3: TREND FORECASTER
# ---------------------------------------------------------------------------

class TrendForecaster:
    """
    Weekly crime volume forecaster using Meta Prophet.

    Algorithm:     Prophet (with custom seasonalities + regressors)
    Target:        y = weekly case count per police station
    Regressors:    is_festival_week, heinous_count_lag1, cyber_count_lag1

    Zoho Catalyst QuickML Mapping:
        Dataset:    trend_features.parquet
        Task type:  Time Series Forecasting
        Date col:   ds
        Target:     y
        Algorithm:  AutoML (maps to Prophet internally)
        Horizon:    12 weeks (configurable)

    Output schema:
        {
          "unit_id": int,
          "forecast": [
            {"ds": "2026-07-07", "yhat": 42, "yhat_lower": 35, "yhat_upper": 51},
            ...
          ],
          "trend_direction": "INCREASING" | "STABLE" | "DECREASING",
          "peak_week": "2026-10-12",
          "seasonal_pattern": {...}
        }
    """

    def __init__(self, forecast_weeks: int = 12):
        self.forecast_weeks = forecast_weeks
        self._models: dict = {}

    def fit(self, df: pd.DataFrame, unit_ids: list | None = None):
        """
        Fits one Prophet model per UnitID (or globally if unit_ids is None).
        """
        prophet = _safe_import("prophet", "prophet")
        if prophet is None:
            log.error("Prophet not installed. Run: pip install prophet")
            return self

        units = unit_ids or (
            df["UnitID"].unique().tolist() if "UnitID" in df.columns else [None]
        )

        for uid in units:
            if uid is not None and "UnitID" in df.columns:
                unit_df = df[df["UnitID"] == uid].copy()
            else:
                unit_df = df.copy()

            if len(unit_df) < 10:
                continue

            unit_df = pd.DataFrame(unit_df).sort_values(by="ds").reset_index(drop=True)
            m = prophet.Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                seasonality_mode="multiplicative",
                changepoint_prior_scale=0.1,
            )
            # Add festival week regressor
            if "is_festival_week" in unit_df.columns:
                m.add_regressor("is_festival_week")

            m.fit(unit_df[["ds", "y"] + (
                ["is_festival_week"] if "is_festival_week" in unit_df.columns else []
            )])
            self._models[uid] = m

        log.info(f"TrendForecaster: {len(self._models)} unit models trained.")
        return self

    def predict(self, unit_id=None) -> dict:
        model = self._models.get(unit_id) or (
            list(self._models.values())[0] if self._models else None
        )
        if model is None:
            return {"error": "Model not trained"}

        future = model.make_future_dataframe(
            periods=self.forecast_weeks, freq="W"
        )
        if "is_festival_week" in model.extra_regressors:
            future["is_festival_week"] = future["ds"].dt.month.isin([10, 11, 3]).astype(int)

        forecast = model.predict(future)
        recent = forecast.tail(self.forecast_weeks)

        # Trend direction
        slope = np.polyfit(range(len(recent)), recent["yhat"].values, 1)[0]
        direction = "INCREASING" if slope > 0.5 else "DECREASING" if slope < -0.5 else "STABLE"

        return {
            "unit_id":          unit_id,
            "forecast": [
                {
                    "ds":         row["ds"].strftime("%Y-%m-%d"),
                    "yhat":       max(0, round(row["yhat"])),
                    "yhat_lower": max(0, round(row["yhat_lower"])),
                    "yhat_upper": max(0, round(row["yhat_upper"])),
                }
                for _, row in recent.iterrows()
            ],
            "trend_direction": direction,
            "peak_week":       recent.loc[recent["yhat"].idxmax(), "ds"].strftime("%Y-%m-%d"),
            "seasonal_pattern": {
                "yearly_amplitude": float(forecast["yearly"].std()),
                "weekly_amplitude": float(forecast["weekly"].std()),
            },
        }

    def predict_all(self) -> list[dict]:
        return [self.predict(uid) for uid in self._models]


# ---------------------------------------------------------------------------
# MODEL 4: ANOMALY DETECTOR
# ---------------------------------------------------------------------------

class AnomalyDetector:
    """
    Isolation Forest anomaly detection for unusual case patterns.

    Algorithm:     Isolation Forest + LOF ensemble
    Detects:
        - White-collar crimes at 03:00 AM in rural areas
        - Unusual act+section combinations (IT Act + NDPS)
        - Sudden spike in crime volume at a quiet station
        - Spatial anomalies (crimes far from any known cluster)

    Zoho Catalyst QuickML Mapping:
        Dataset:   anomaly_features.parquet
        Task type: Anomaly Detection
        Algorithm: AutoML (Isolation Forest)
        Threshold: contamination = 0.025 (2.5% expected anomalies)

    Output schema:
        {
          "case_id": str,
          "anomaly_score": float,       // higher = more anomalous
          "is_anomaly": bool,
          "anomaly_type": str,
          "explanation": [...]
        }
    """

    ANOMALY_TYPES = {
        "spatial":    "Crime in unusual location",
        "temporal":   "Crime at unusual time for this type",
        "behavioral": "Unusual MO / section combination",
        "volume":     "Sudden spike in crime volume",
    }

    def __init__(self, contamination: float = 0.025):
        self.contamination = contamination
        self._model    = None
        self._lof      = None
        self._scaler   = None
        self._feature_names: list[str] = []

    def fit(self, X: pd.DataFrame):
        from sklearn.ensemble import IsolationForest
        from sklearn.preprocessing import RobustScaler

        feat_cols = [c for c in X.columns if c != "CaseID"]
        self._feature_names = feat_cols
        self._scaler = RobustScaler()
        X_scaled = self._scaler.fit_transform(X[feat_cols].fillna(0))

        self._model = IsolationForest(
            n_estimators=200,
            contamination=self.contamination,
            max_features=0.7,
            random_state=42,
            n_jobs=-1,
        )
        self._model.fit(X_scaled)

        # Optional LOF for local density anomalies
        try:
            from sklearn.neighbors import LocalOutlierFactor
            self._lof = LocalOutlierFactor(
                n_neighbors=20, contamination=self.contamination, novelty=True
            )
            self._lof.fit(X_scaled)
        except Exception:
            self._lof = None

        log.info("AnomalyDetector trained.")
        return self

    def predict(self, X: pd.DataFrame) -> list[dict]:
        if self._scaler is None or self._model is None:
            raise ValueError("Model is not fitted. Call fit() first.")
        feat_cols = self._feature_names
        X_scaled = self._scaler.transform(X[feat_cols].fillna(0))

        iso_scores = self._model.decision_function(X_scaled)   # more negative = more anomalous
        iso_labels = self._model.predict(X_scaled)             # -1 = anomaly

        if self._lof:
            lof_scores = self._lof.decision_function(X_scaled)
            combined_score = (iso_scores + lof_scores) / 2
        else:
            combined_score = iso_scores

        # Normalise anomaly score 0-100 (100 = most anomalous)
        min_s, max_s = combined_score.min(), combined_score.max()
        norm_score = 100 * (1 - (combined_score - min_s) / (max_s - min_s + 1e-9))

        case_ids = X.get("CaseID", pd.Series(range(len(X)))).values

        results = []
        for i in range(len(X)):
            score = float(norm_score[i])
            is_anomaly = iso_labels[i] == -1

            # Classify anomaly type by feature dominance
            atype = self._classify_anomaly_type(X.iloc[i])

            results.append({
                "case_id":      str(case_ids[i]),
                "anomaly_score":round(score, 2),
                "is_anomaly":   is_anomaly,
                "anomaly_type": atype if is_anomaly else None,
                "anomaly_label":self.ANOMALY_TYPES.get(atype, "Unknown") if is_anomaly else None,
            })
        return results

    def _classify_anomaly_type(self, row: pd.Series) -> str:
        """Heuristic anomaly type classification from feature values."""
        hour  = row.get("hour_of_day", 12)
        dist  = row.get("dist_to_hotspot_km", 0)
        cyber = row.get("is_cyber_crime", 0)
        mo_wd = row.get("mo_word_count", 0)

        if dist > 50 and not cyber:
            return "spatial"
        if hour in range(0, 5) and not row.get("is_night", 0):
            return "temporal"
        if mo_wd > 150 or row.get("mo_flag_bank_impersonation", 0):
            return "behavioral"
        return "volume"

    def get_anomaly_summary(self, X: pd.DataFrame) -> dict:
        """Returns a district/station level summary of anomalies."""
        preds = self.predict(X)
        anomalies = [p for p in preds if p["is_anomaly"]]
        type_counts = {}
        for a in anomalies:
            t = a["anomaly_type"] or "unknown"
            type_counts[t] = type_counts.get(t, 0) + 1

        return {
            "total_cases":     len(preds),
            "anomaly_count":   len(anomalies),
            "anomaly_rate":    round(len(anomalies) / max(len(preds), 1) * 100, 2),
            "by_type":         type_counts,
            "top_anomalies":   sorted(anomalies, key=lambda x: x["anomaly_score"], reverse=True)[:10],
        }


# ---------------------------------------------------------------------------
# MODEL 5: CASE OUTCOME PREDICTOR
# ---------------------------------------------------------------------------

class CaseOutcomePredictor:
    """
    Multi-class classifier predicting case resolution type.

    Algorithm:     Random Forest Classifier
    Target:        chargesheet_type_ord (2=A/detected, 1=B/undetected, 0=C/false)
    Key features:  crime_head_id, is_heinous, accused_count, has_arrest,
                   arrest_lag_days, io_experience_years, district features

    Zoho Catalyst QuickML Mapping:
        Dataset:   hotspot_features.parquet (case features subset)
        Task type: Multi-class Classification
        Target:    chargesheet_type_ord
        Algorithm: AutoML (Random Forest / XGBoost)

    Output schema:
        {
          "case_id": str,
          "predicted_outcome": "DETECTED" | "UNDETECTED" | "FALSE",
          "outcome_probabilities": {"DETECTED": 0.72, "UNDETECTED": 0.18, "FALSE": 0.10},
          "confidence": float,
          "explanation": [...]
        }
    """

    LABEL_MAP = {2: "DETECTED", 1: "UNDETECTED", 0: "FALSE"}

    def __init__(self):
        self._model     = None
        self._explainer = None
        self._scaler    = None
        self._feature_names: list[str] = []

    def fit(self, X: pd.DataFrame, y: pd.Series):
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import StandardScaler

        feat_cols = [c for c in X.columns
                     if c not in ("CaseID", "target_is_hotspot", "chargesheet_type_ord")]
        self._feature_names = feat_cols
        self._scaler = StandardScaler()
        X_scaled = self._scaler.fit_transform(X[feat_cols].fillna(0))

        self._model = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )
        self._model.fit(X_scaled, y)
        self._explainer = ExplainabilityWrapper(
            self._model,
            feat_cols
        )
        self._explainer._build_explainer(
            pd.DataFrame(X_scaled, columns=feat_cols)
        )
        log.info("CaseOutcomePredictor trained.")
        return self

    def predict(self, X: pd.DataFrame, case_ids: list | None = None) -> list[dict]:
        if self._scaler is None or self._model is None:
            raise ValueError("Model is not fitted. Call fit() first.")
        feat_cols = self._feature_names
        X_scaled = self._scaler.transform(X[feat_cols].fillna(0))
        proba    = self._model.predict_proba(X_scaled)
        classes  = self._model.classes_

        results = []
        for i in range(len(X)):
            prob_dict = {
                self.LABEL_MAP.get(int(c), str(c)): round(float(p), 4)
                for c, p in zip(classes, proba[i])
            }
            best_class = classes[np.argmax(proba[i])]
            confidence = float(np.max(proba[i]))
            results.append({
                "case_id":               str(case_ids[i]) if case_ids else str(i),
                "predicted_outcome":     self.LABEL_MAP.get(int(best_class), "UNKNOWN"),
                "outcome_probabilities": prob_dict,
                "confidence":            round(confidence, 4),
            })
        return results

    def explain(self, X: pd.DataFrame, case_ids: list | None = None) -> list[dict]:
        if self._scaler is None or self._explainer is None:
            raise ValueError("Model is not fitted. Call fit() first.")
        X_scaled = pd.DataFrame(
            self._scaler.transform(X[self._feature_names].fillna(0)),
            columns=self._feature_names
        )
        return self._explainer.to_json(X_scaled, ids=case_ids)


# ---------------------------------------------------------------------------
# COMBINED INFERENCE ENTRYPOINT (Catalyst Function Handler)
# ---------------------------------------------------------------------------

def run_inference(feature_matrices: dict, model_dir: str = "./models") -> dict:
    """
    Loads pre-trained models and runs all five inference pipelines.

    In Catalyst, this is called from the 'risk' serverless function.
    Models are persisted via joblib and loaded at cold-start.

    Returns a combined JSON-serialisable response.
    """
    import joblib
    model_path = Path(model_dir)

    results = {}
    try:
        # Load models
        hp  = joblib.load(model_path / "hotspot_predictor.pkl")
        drs = joblib.load(model_path / "district_risk_scorer.pkl")
        tf  = joblib.load(model_path / "trend_forecaster.pkl")
        ad  = joblib.load(model_path / "anomaly_detector.pkl")
        cop = joblib.load(model_path / "case_outcome_predictor.pkl")

        X_h = feature_matrices.get("hotspot")
        X_d = feature_matrices.get("district")
        X_t = feature_matrices.get("trend")
        X_a = feature_matrices.get("anomaly")

        if X_h is not None and not X_h.empty:
            feat = X_h.drop(columns=["target_is_hotspot", "CaseID"], errors="ignore")
            results["hotspots"]        = hp.predict(feat)[:50]  # top 50 for API
            results["hotspot_grid"]    = hp.get_hotspot_grid(feat).to_dict(orient="records")
            results["case_outcomes"]   = cop.predict(feat)[:50]

        if X_d is not None and not X_d.empty:
            feat_d = X_d.drop(columns=["DistrictID"], errors="ignore")
            y_dummy = pd.Series([0] * len(X_d))
            results["district_risks"] = drs.predict(X_d)

        if X_t is not None and not X_t.empty:
            results["trend_forecast"] = tf.predict_all()[:5]  # top 5 stations

        if X_a is not None and not X_a.empty:
            results["anomaly_summary"] = ad.get_anomaly_summary(X_a)

    except FileNotFoundError as e:
        results["error"] = f"Model file not found: {e}"

    return results


def train_and_save_all(feature_matrices: dict, model_dir: str = "./models"):
    """
    Trains all five models and saves them with joblib.

    Call this once after feature engineering to produce model artifacts
    that can be deployed to Zoho Catalyst as ML model assets.
    """
    import joblib
    model_path = Path(model_dir)
    model_path.mkdir(parents=True, exist_ok=True)

    X_h = feature_matrices.get("hotspot")
    X_d = feature_matrices.get("district")
    X_t = feature_matrices.get("trend")
    X_a = feature_matrices.get("anomaly")

    if X_h is not None and not X_h.empty:
        feat = X_h.drop(columns=["target_is_hotspot", "CaseID"], errors="ignore")
        target_h = X_h["target_is_hotspot"] if "target_is_hotspot" in X_h.columns else pd.Series([0]*len(X_h))

        hp = HotspotPredictor()
        hp.fit(feat, target_h)
        joblib.dump(hp, model_path / "hotspot_predictor.pkl")
        log.info("Saved: hotspot_predictor.pkl")

        cop = CaseOutcomePredictor()
        target_cs = X_h.get("chargesheet_type_ord", pd.Series([0]*len(X_h)))
        cop.fit(feat, target_cs)
        joblib.dump(cop, model_path / "case_outcome_predictor.pkl")
        log.info("Saved: case_outcome_predictor.pkl")

    if X_d is not None and not X_d.empty:
        risk_col = "risk_score_composite"
        feat_d = X_d.drop(columns=["DistrictID"], errors="ignore")
        y_d = feat_d.pop(risk_col) if risk_col in feat_d.columns else pd.Series([0]*len(X_d))
        drs = DistrictRiskScorer()
        drs.fit(pd.concat([X_d[["DistrictID"]], feat_d], axis=1), y_d)
        joblib.dump(drs, model_path / "district_risk_scorer.pkl")
        log.info("Saved: district_risk_scorer.pkl")

    if X_t is not None and not X_t.empty:
        tf = TrendForecaster()
        tf.fit(X_t)
        joblib.dump(tf, model_path / "trend_forecaster.pkl")
        log.info("Saved: trend_forecaster.pkl")

    if X_a is not None and not X_a.empty:
        ad = AnomalyDetector()
        ad.fit(X_a)
        joblib.dump(ad, model_path / "anomaly_detector.pkl")
        log.info("Saved: anomaly_detector.pkl")

    log.info("All models trained and saved to: " + str(model_path))


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="KSP AI Models — Train & Save")
    parser.add_argument("--features-dir", default="features",
                        help="Directory with feature .parquet files")
    parser.add_argument("--model-dir",    default="models",
                        help="Directory to save trained models")
    args = parser.parse_args()

    feat_dir = Path(args.features_dir)
    matrices = {}
    for name, key in [
        ("hotspot_features", "hotspot"),
        ("district_features", "district"),
        ("trend_features",    "trend"),
        ("anomaly_features",  "anomaly"),
    ]:
        parquet = feat_dir / f"{name}.parquet"
        csv_path = feat_dir / f"{name}.csv"
        if parquet.exists():
            matrices[key] = pd.read_parquet(parquet)
        elif csv_path.exists():
            matrices[key] = pd.read_csv(csv_path)
        else:
            log.warning(f"Feature file not found: {name}")

    train_and_save_all(matrices, model_dir=args.model_dir)
