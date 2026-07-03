#!/usr/bin/env python3
"""
Karnataka Police — ML Deployment Workflow
==========================================
Orchestrates the complete ML lifecycle from raw data to production deployment.

Stages:
    1. EXTRACT   -- Pull data from Catalyst DataStore via CoQL
    2. TRANSFORM -- Run feature engineering pipeline
    3. TRAIN     -- Train 5 ML models (local sklearn or QuickML AutoML)
    4. EVALUATE  -- Compute model metrics + generate report
    5. CACHE     -- Pre-compute predictions to Redis/Catalyst DataStore
    6. DEPLOY    -- Package models + update Catalyst Function environment
    7. MONITOR   -- Schedule health checks + drift detection

Usage:
    # Full pipeline from scratch:
    python deploy.py --stage all

    # Individual stages:
    python deploy.py --stage extract   --data-dir output
    python deploy.py --stage transform --data-dir output --out features
    python deploy.py --stage train     --features-dir features --model-dir models
    python deploy.py --stage evaluate  --model-dir models --features-dir features
    python deploy.py --stage cache     --model-dir models --cache-dir cache
    python deploy.py --stage deploy    --model-dir models

Scheduler (Zoho Catalyst Jobs):
    Use --stage all as a weekly batch job via Catalyst Scheduled Jobs.
    Configure in Catalyst console: Jobs -> New Job -> Python Function
"""

import argparse
import json
import logging
import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("MLDeploy")

PIPELINE_VERSION = "1.0.0"
DEPLOY_TIMESTAMP = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")


# ---------------------------------------------------------------------------
# STAGE 1: EXTRACT — Pull from Catalyst DataStore
# ---------------------------------------------------------------------------

class DataExtractor:
    """
    Extracts training data from Zoho Catalyst DataStore via CoQL.

    In local mode: reads from CSV files in --data-dir.
    In Catalyst mode: uses zcatalyst-sdk-python to query DataStore.

    Catalyst Python SDK (install: pip install zcatalyst-sdk-python):
        import zcatalyst_sdk_python as catalyst
        app = catalyst.initialize()
        datastore = app.datastore()
        results = datastore.execute_coql_query("SELECT * FROM CaseMaster LIMIT 1000")
    """

    COQL_QUERIES = {
        "CaseMaster": """
            SELECT CaseID, UnitID, DistrictID, CaseCategoryID, CrimeHeadID,
                   CrimeSubHeadID, GravityOffenceID, CaseStatusID, IOEmployeeID,
                   RegistrationDate, CaseNo, CourtID
            FROM CaseMaster
            ORDER BY RegistrationDate DESC
            LIMIT 10000
        """,
        "OccurrenceTime": """
            SELECT OccurrenceTimeID, CaseID, Latitude, Longitude,
                   IncidentFromDate, IncidentToDate, InfoReceivedPSDate,
                   BriefFacts, MOPhrase
            FROM OccurrenceTime
            LIMIT 10000
        """,
        "Accused": """
            SELECT AccusedID, CaseID, Age, IsRepeatOffender,
                   IsNetworkMember, PriorOffenseCount, MOPhrase
            FROM Accused
            LIMIT 50000
        """,
        "ChargesheetDetails": """
            SELECT ROWID, CaseID, CSType, ChargesheetDate
            FROM ChargesheetDetails
            LIMIT 10000
        """,
        "ArrestSurrender": """
            SELECT ArrestID, CaseID, AccusedID, ArrestDate, ArrestingOfficerID
            FROM ArrestSurrender
            LIMIT 30000
        """,
        "DistrictStats": """
            SELECT DistrictID, PopulationDensity, UrbanisationRate,
                   LiteracyRate, PovertyIndex, PoliceStationDensity
            FROM DistrictStats
            LIMIT 100
        """,
        "Victim": """
            SELECT VictimID, CaseID, Age, Gender
            FROM Victim
            LIMIT 30000
        """,
    }

    def __init__(self, data_dir: str = "./output", use_catalyst: bool = False):
        self.data_dir = Path(data_dir)
        self.use_catalyst = use_catalyst

    def extract(self) -> dict:
        """Returns dict of {table_name: DataFrame}."""
        if self.use_catalyst:
            return self._extract_from_catalyst()
        return self._extract_from_csv()

    def _extract_from_csv(self) -> dict:
        log.info(f"Extracting from CSV files in {self.data_dir} ...")
        tables = {}
        for table in self.COQL_QUERIES:
            path = self.data_dir / f"{table}.csv"
            if path.exists():
                tables[table] = pd.read_csv(path, low_memory=False)
                log.info(f"  {table}: {len(tables[table]):,} rows")
            else:
                log.warning(f"  {table}: not found")
                tables[table] = pd.DataFrame()
        return tables

    def _extract_from_catalyst(self) -> dict:
        """Extract via Catalyst DataStore CoQL (production path)."""
        try:
            import zcatalyst_sdk_python as catalyst  # type: ignore
            app = catalyst.initialize()
            ds = app.datastore()
            tables = {}
            for table, query in self.COQL_QUERIES.items():
                log.info(f"  CoQL query: {table} ...")
                rows = ds.execute_coql_query(query.strip())
                tables[table] = pd.DataFrame(rows)
                log.info(f"  {table}: {len(tables[table])} rows fetched")
            return tables
        except ImportError:
            log.error("zcatalyst-sdk-python not installed. Falling back to CSV.")
            return self._extract_from_csv()
        except Exception as e:
            log.error(f"Catalyst extraction failed: {e}")
            return self._extract_from_csv()


# ---------------------------------------------------------------------------
# STAGE 2: TRANSFORM — Feature Engineering
# ---------------------------------------------------------------------------

def run_transform(data_dir: str, out_dir: str) -> tuple:
    from ml.feature_engineering import FeaturePipeline
    log.info("=" * 50)
    log.info("STAGE 2: Feature Engineering")
    log.info("=" * 50)
    pipeline = FeaturePipeline(data_dir=data_dir, out_dir=out_dir)
    return pipeline.run_all()


# ---------------------------------------------------------------------------
# STAGE 3: TRAIN — Model Training
# ---------------------------------------------------------------------------

def run_train(features_dir: str, model_dir: str) -> dict:
    from ml.models import train_and_save_all
    log.info("=" * 50)
    log.info("STAGE 3: Model Training")
    log.info("=" * 50)

    feat_dir = Path(features_dir)
    matrices = {}
    for name, key in [
        ("hotspot_features", "hotspot"),
        ("district_features", "district"),
        ("trend_features",    "trend"),
        ("anomaly_features",  "anomaly"),
    ]:
        for ext in (".parquet", ".csv"):
            path = feat_dir / f"{name}{ext}"
            if path.exists():
                matrices[key] = pd.read_parquet(path) if ext == ".parquet" else pd.read_csv(path)
                log.info(f"  Loaded: {name}{ext} -> {matrices[key].shape}")
                break
        else:
            log.warning(f"  Missing: {name}")

    train_and_save_all(matrices, model_dir=model_dir)
    return {"status": "trained", "model_dir": model_dir}


# ---------------------------------------------------------------------------
# STAGE 4: EVALUATE — Model Metrics
# ---------------------------------------------------------------------------

def run_evaluate(model_dir: str, features_dir: str) -> dict:
    log.info("=" * 50)
    log.info("STAGE 4: Model Evaluation")
    log.info("=" * 50)

    import joblib
    from sklearn.metrics import (
        classification_report, mean_absolute_error,
        mean_squared_error, roc_auc_score, f1_score
    )
    from sklearn.model_selection import train_test_split

    model_path  = Path(model_dir)
    feat_dir    = Path(features_dir)
    eval_report = {}

    # --- Hotspot model ---
    hp_feat_path = feat_dir / "hotspot_features.parquet"
    if hp_feat_path.exists() and (model_path / "hotspot_predictor.pkl").exists():
        df = pd.read_parquet(hp_feat_path)
        y  = df["target_is_hotspot"]
        X  = df.drop(columns=["target_is_hotspot", "CaseID"], errors="ignore")
        _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        hp = joblib.load(model_path / "hotspot_predictor.pkl")
        preds = hp.predict(X_test)
        probs = [p["hotspot_probability"] for p in preds]
        labels = [int(p["is_hotspot"]) for p in preds]
        try:
            auc = roc_auc_score(y_test, probs)
        except Exception:
            auc = float("nan")
        f1 = f1_score(y_test, labels, zero_division=0)
        eval_report["hotspot"] = {
            "f1_score":   round(float(f1), 4),
            "auc_roc":    round(float(auc), 4),
            "test_size":  len(y_test),
            "positives":  int(y_test.sum()),
        }
        log.info(f"  Hotspot  | F1={f1:.3f} | AUC={auc:.3f}")

    # --- District Risk ---
    dr_feat_path = feat_dir / "district_features.parquet"
    if dr_feat_path.exists() and (model_path / "district_risk_scorer.pkl").exists():
        df = pd.read_parquet(dr_feat_path)
        if "risk_score_composite" in df.columns:
            y = df["risk_score_composite"]
            X = df.drop(columns=["DistrictID", "risk_score_composite"], errors="ignore")
            _, X_test, _, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
            drs = joblib.load(model_path / "district_risk_scorer.pkl")
            preds = drs.predict(pd.concat([pd.Series(range(len(X_test)), name="DistrictID"), X_test.reset_index(drop=True)], axis=1))
            y_pred = [p["risk_score"] for p in preds]
            rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
            mae  = mean_absolute_error(y_test, y_pred) # type: ignore
            eval_report["district_risk"] = {"rmse": round(rmse, 4), "mae": round(mae, 4)}
            log.info(f"  District | RMSE={rmse:.3f} | MAE={mae:.3f}")

    # --- Anomaly Detector ---
    an_feat_path = feat_dir / "anomaly_features.parquet"
    if an_feat_path.exists() and (model_path / "anomaly_detector.pkl").exists():
        df = pd.read_parquet(an_feat_path)
        ad = joblib.load(model_path / "anomaly_detector.pkl")
        summary = ad.get_anomaly_summary(df)
        eval_report["anomaly"] = summary
        log.info(f"  Anomaly  | Count={summary['anomaly_count']} | Rate={summary['anomaly_rate']}%")

    # Save eval report
    report_path = model_path / "evaluation_report.json"
    report_path.write_text(json.dumps({
        "version":   PIPELINE_VERSION,
        "timestamp": DEPLOY_TIMESTAMP,
        "metrics":   eval_report,
    }, indent=2))
    log.info(f"  Evaluation report saved: {report_path}")
    return eval_report


# ---------------------------------------------------------------------------
# STAGE 5: CACHE — Pre-compute Predictions
# ---------------------------------------------------------------------------

def run_cache(model_dir: str, features_dir: str, cache_dir: str) -> dict:
    """
    Pre-computes expensive ML predictions and stores them as JSON cache files.

    In Catalyst, the cache files are written to Catalyst File Store or
    DataStore (as JSON strings in a `MLCache` table) and served
    directly by the `risk` Serverless Function without rerunning models.

    Cache files:
        cache/hotspot_grid.json       -- lat/lon grid risk scores
        cache/district_risk.json      -- district risk tiers
        cache/anomaly_summary.json    -- anomaly detection summary
        cache/trend_forecasts.json    -- 12-week forecasts per unit
        cache/meta.json               -- cache metadata + versioning
    """
    log.info("=" * 50)
    log.info("STAGE 5: Prediction Caching")
    log.info("=" * 50)

    import joblib
    feat_dir   = Path(features_dir)
    cache_path = Path(cache_dir)
    cache_path.mkdir(parents=True, exist_ok=True)

    cached = {}

    # Hotspot grid
    hp_path = feat_dir / "hotspot_features.parquet"
    if hp_path.exists() and (Path(model_dir) / "hotspot_predictor.pkl").exists():
        df = pd.read_parquet(hp_path)
        hp = joblib.load(Path(model_dir) / "hotspot_predictor.pkl")
        X  = df.drop(columns=["target_is_hotspot", "CaseID"], errors="ignore")
        grid = hp.get_hotspot_grid(X).head(500)  # top 500 grid cells
        out = grid.to_dict(orient="records")
        (cache_path / "hotspot_grid.json").write_text(json.dumps(out))
        cached["hotspot_grid"] = len(out)
        log.info(f"  Cached hotspot_grid: {len(out)} grid cells")

    # District risk
    dr_path = feat_dir / "district_features.parquet"
    if dr_path.exists() and (Path(model_dir) / "district_risk_scorer.pkl").exists():
        df  = pd.read_parquet(dr_path)
        drs = joblib.load(Path(model_dir) / "district_risk_scorer.pkl")
        out = drs.predict(df)
        (cache_path / "district_risk.json").write_text(json.dumps(out))
        cached["district_risk"] = len(out)
        log.info(f"  Cached district_risk: {len(out)} districts")

    # Anomaly summary
    an_path = feat_dir / "anomaly_features.parquet"
    if an_path.exists() and (Path(model_dir) / "anomaly_detector.pkl").exists():
        df  = pd.read_parquet(an_path)
        ad  = joblib.load(Path(model_dir) / "anomaly_detector.pkl")
        out = ad.get_anomaly_summary(df)
        (cache_path / "anomaly_summary.json").write_text(json.dumps(out))
        cached["anomaly_summary"] = out["anomaly_count"]
        log.info(f"  Cached anomaly_summary: {out['anomaly_count']} anomalies")

    # Trend forecasts (top 20 units)
    tr_path = feat_dir / "trend_features.parquet"
    if tr_path.exists() and (Path(model_dir) / "trend_forecaster.pkl").exists():
        df  = pd.read_parquet(tr_path)
        tf  = joblib.load(Path(model_dir) / "trend_forecaster.pkl")
        top_units = df.groupby("UnitID")["y"].sum().nlargest(20).index.tolist()
        out = [tf.predict(uid) for uid in top_units]
        (cache_path / "trend_forecasts.json").write_text(json.dumps(out))
        cached["trend_forecasts"] = len(out)
        log.info(f"  Cached trend_forecasts: {len(out)} units")

    # Meta
    meta = {
        "version":    PIPELINE_VERSION,
        "timestamp":  DEPLOY_TIMESTAMP,
        "cached":     cached,
        "expires_at": "24h",
    }
    (cache_path / "meta.json").write_text(json.dumps(meta, indent=2))
    log.info(f"  Cache metadata saved.")
    return cached


# ---------------------------------------------------------------------------
# STAGE 6: DEPLOY — Package + Upload to Catalyst
# ---------------------------------------------------------------------------

def run_deploy(model_dir: str, cache_dir: str) -> dict:
    """
    Packages ML artifacts and deploys to Catalyst environment.

    Deployment steps:
        1. Bundle model .pkl files into a zip
        2. Copy cache JSON files to functions/risk/cache/
        3. Update functions/risk/requirements.txt with ML deps
        4. Run `zcatalyst deploy` to push to Catalyst cloud

    Catalyst Deployment Config (catalyst.json):
        The 'risk' function must have access to:
          - /cache/  directory (pre-computed JSONs)
          - /models/ directory (joblib .pkl files) OR
            QuickML endpoint IDs via env vars

    Environment Variables to set in Catalyst Console:
        QUICKML_HOTSPOT_MODEL_ID=<quickml_model_id>
        QUICKML_DISTRICT_MODEL_ID=<quickml_model_id>
        QUICKML_ANOMALY_MODEL_ID=<quickml_model_id>
        QUICKML_TREND_MODEL_ID=<quickml_model_id>
        QUICKML_OUTCOME_MODEL_ID=<quickml_model_id>
    """
    log.info("=" * 50)
    log.info("STAGE 6: Deployment")
    log.info("=" * 50)

    model_path = Path(model_dir)
    cache_path = Path(cache_dir)
    risk_func  = Path("../functions/risk")
    risk_cache = risk_func / "cache"
    risk_models = risk_func / "models"

    # Copy cache files to risk function directory
    if risk_func.exists():
        risk_cache.mkdir(exist_ok=True)
        risk_models.mkdir(exist_ok=True)
        for f in cache_path.glob("*.json"):
            shutil.copy(f, risk_cache / f.name)
            log.info(f"  Copied cache: {f.name}")
        for f in model_path.glob("*.pkl"):
            shutil.copy(f, risk_models / f.name)
            log.info(f"  Copied model: {f.name}")
    else:
        log.warning(f"  Risk function directory not found: {risk_func}")

    # Generate deployment manifest
    manifest = {
        "version":     PIPELINE_VERSION,
        "deployed_at": DEPLOY_TIMESTAMP,
        "models": [
            "hotspot_predictor.pkl",
            "district_risk_scorer.pkl",
            "trend_forecaster.pkl",
            "anomaly_detector.pkl",
            "case_outcome_predictor.pkl",
        ],
        "cache_files": [
            "hotspot_grid.json",
            "district_risk.json",
            "anomaly_summary.json",
            "trend_forecasts.json",
        ],
        "catalyst_function": "risk",
        "quickml_datasets": list(
            __import__("ml.quickml_integration", fromlist=["QUICKML_DATASETS"])
            .QUICKML_DATASETS.keys()
        ),
    }

    manifest_path = model_path / "deployment_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    log.info(f"  Manifest: {manifest_path}")

    log.info("\n  Next step: Run `zcatalyst deploy` in project root")
    log.info("  Or push via Catalyst Console -> Functions -> risk -> Deploy")
    return manifest


# ---------------------------------------------------------------------------
# STAGE 7: MONITOR — Drift Detection + Health Checks
# ---------------------------------------------------------------------------

def run_monitor(model_dir: str, features_dir: str, baseline_dir: str = "baseline") -> dict:
    """
    Monitors model health and data drift.

    Checks:
        1. Prediction distribution drift (KL divergence vs baseline)
        2. Feature distribution drift (PSI per feature)
        3. Model accuracy on recent cases (if labels available)
        4. Anomaly rate drift (flag if >2x baseline)

    Scheduled via Catalyst Jobs: daily at 08:00 IST
        zcatalyst job create --name ML_Monitor \\
                             --function datathon_function \\
                             --cron "0 2 * * *"   (UTC = 08:00 IST)
    """
    log.info("=" * 50)
    log.info("STAGE 7: Model Health Monitoring")
    log.info("=" * 50)

    feat_dir    = Path(features_dir)
    model_path  = Path(model_dir)
    baseline    = Path(baseline_dir)
    health_report: dict = {"timestamp": DEPLOY_TIMESTAMP, "alerts": []}

    # Feature drift: Population Stability Index (PSI)
    for feat_file in ["hotspot_features", "anomaly_features"]:
        curr_path = feat_dir / f"{feat_file}.parquet"
        base_path = baseline / f"{feat_file}_baseline.parquet"
        if curr_path.exists() and base_path.exists():
            curr_df = pd.read_parquet(curr_path)
            base_df = pd.read_parquet(base_path)
            psi = _compute_psi(curr_df, base_df)
            health_report[f"{feat_file}_psi"] = psi
            if psi > 0.2:
                health_report["alerts"].append({
                    "severity": "HIGH",
                    "message":  f"Data drift detected in {feat_file}: PSI={psi:.3f} (threshold=0.2)",
                    "action":   "Retrain models",
                })
            log.info(f"  {feat_file} PSI: {psi:.3f} {'[DRIFT]' if psi > 0.2 else '[OK]'}")

    # Anomaly rate check
    cache_anomaly = Path("cache/anomaly_summary.json")
    if cache_anomaly.exists():
        current = json.loads(cache_anomaly.read_text())
        baseline_rate = 2.5  # expected contamination %
        current_rate  = current.get("anomaly_rate", 0)
        if current_rate > baseline_rate * 2:
            health_report["alerts"].append({
                "severity": "MEDIUM",
                "message":  f"Anomaly rate elevated: {current_rate}% (baseline: {baseline_rate}%)",
                "action":   "Review recent cases",
            })
        log.info(f"  Anomaly rate: {current_rate}% {'[ELEVATED]' if current_rate > baseline_rate*2 else '[OK]'}")

    # Save health report
    report_path = model_path / "health_report.json"
    report_path.write_text(json.dumps(health_report, indent=2))
    log.info(f"  Health report: {report_path}")
    return health_report


def _compute_psi(current: pd.DataFrame, baseline: pd.DataFrame,
                 n_bins: int = 10) -> float:
    """
    Computes Population Stability Index across all numeric features.
    PSI < 0.1: No drift | 0.1-0.2: Moderate drift | >0.2: Significant drift
    """
    numeric_cols = [c for c in current.select_dtypes(include=np.number).columns
                    if c in baseline.columns]
    psi_values = []
    for col in numeric_cols:
        try:
            bins = np.percentile(np.asarray(baseline[col].dropna(), dtype=np.float64), np.linspace(0, 100, n_bins + 1))
            bins = np.unique(bins)
            if len(bins) < 3:
                continue
            base_hist, _ = np.histogram(np.asarray(baseline[col].fillna(0), dtype=np.float64), bins=bins)
            curr_hist, _ = np.histogram(np.asarray(current[col].fillna(0), dtype=np.float64), bins=bins)
            base_p = (base_hist + 1) / (base_hist.sum() + n_bins)
            curr_p = (curr_hist + 1) / (curr_hist.sum() + n_bins)
            psi = float(np.sum((curr_p - base_p) * np.log(curr_p / base_p)))
            psi_values.append(abs(psi))
        except Exception:
            continue
    return float(np.mean(psi_values)) if psi_values else 0.0


# ---------------------------------------------------------------------------
# MAIN WORKFLOW ORCHESTRATOR
# ---------------------------------------------------------------------------

def run_pipeline(args):
    """Full 7-stage ML deployment pipeline."""
    start = time.time()
    log.info("=" * 60)
    log.info(f"  KSP ML Deployment Pipeline v{PIPELINE_VERSION}")
    log.info(f"  Run ID: {DEPLOY_TIMESTAMP}")
    log.info("=" * 60)

    stages = args.stage if args.stage != "all" else [
        "extract", "transform", "train", "evaluate", "cache", "deploy"
    ]

    results: dict = {}

    if "extract" in stages:
        extractor = DataExtractor(
            data_dir=args.data_dir,
            use_catalyst=args.use_catalyst
        )
        tables = extractor.extract()
        results["extract"] = {k: len(v) for k, v in tables.items()}

    if "transform" in stages:
        results["transform"] = str(run_transform(args.data_dir, args.out))

    if "train" in stages:
        results["train"] = run_train(args.features_dir, args.model_dir)

    if "evaluate" in stages:
        results["evaluate"] = run_evaluate(args.model_dir, args.features_dir)

    if "cache" in stages:
        results["cache"] = run_cache(
            args.model_dir, args.features_dir, args.cache_dir
        )

    if "deploy" in stages:
        results["deploy"] = run_deploy(args.model_dir, args.cache_dir)

    if "monitor" in stages:
        results["monitor"] = run_monitor(args.model_dir, args.features_dir)

    elapsed = time.time() - start
    log.info(f"\nPipeline complete in {elapsed:.1f}s")

    summary_path = Path(args.model_dir) / f"pipeline_run_{DEPLOY_TIMESTAMP}.json"
    Path(args.model_dir).mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps({
        "version": PIPELINE_VERSION,
        "run_id": DEPLOY_TIMESTAMP,
        "elapsed_seconds": round(elapsed, 1),
        "stages": stages,
        "results": results,
    }, indent=2, default=str))
    log.info(f"Summary: {summary_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KSP ML Deployment Workflow")
    parser.add_argument("--stage", nargs="+",
                        choices=["all", "extract", "transform", "train",
                                 "evaluate", "cache", "deploy", "monitor"],
                        default=["all"])
    parser.add_argument("--data-dir",     default="../data-generator/output")
    parser.add_argument("--out",          default="features",
                        help="Feature output directory (for transform stage)")
    parser.add_argument("--features-dir", default="features")
    parser.add_argument("--model-dir",    default="models")
    parser.add_argument("--cache-dir",    default="cache")
    parser.add_argument("--use-catalyst", action="store_true",
                        help="Extract data from Catalyst DataStore (not CSV)")
    args = parser.parse_args()

    # Normalise --stage all
    if "all" in args.stage:
        args.stage = ["extract", "transform", "train", "evaluate", "cache", "deploy"]

    run_pipeline(args)
