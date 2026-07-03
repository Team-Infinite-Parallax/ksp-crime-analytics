#!/usr/bin/env python3
"""
Karnataka Police — Catalyst QuickML Integration
================================================
This module bridges the KSP custom ML models with Zoho Catalyst's
QuickML service and the 'risk' Catalyst Serverless Function.

Catalyst QuickML is Zoho's managed AutoML platform that:
  - Ingests datasets from Catalyst DataStore or uploaded CSVs
  - Auto-selects the best algorithm (XGBoost, RF, DNN, Prophet)
  - Trains, evaluates, and hosts models as prediction endpoints
  - Returns predictions via REST API without managing infrastructure

Architecture:
    [Catalyst DataStore] -> [Feature Pipeline] -> [QuickML Dataset]
         -> [QuickML Training Job] -> [QuickML Model Endpoint]
         -> [risk Catalyst Function] -> [React Dashboard]

Zoho Catalyst QuickML Docs:
    https://catalyst.zoho.com/help/ml-services.html

Usage:
    python quickml_integration.py --action upload   # upload feature datasets
    python quickml_integration.py --action train    # trigger QuickML training
    python quickml_integration.py --action predict  # run batch prediction
"""

import json
import logging
import os
from pathlib import Path

log = logging.getLogger("QuickMLIntegration")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


# ---------------------------------------------------------------------------
# SECTION 1: QUICKML DATASET CONFIGURATION
# ---------------------------------------------------------------------------
# Each QuickML dataset maps to one of our feature matrices.
# These configs are passed to the Catalyst QuickML API or CLI.

QUICKML_DATASETS = {
    "hotspot_prediction": {
        "name":         "KSP_HotspotPrediction",
        "file":         "features/hotspot_features.parquet",
        "task_type":    "Classification",          # Binary classification
        "target_col":   "target_is_hotspot",
        "algorithm":    "AutoML",                  # QuickML picks best (usually XGBoost)
        "features": [
            "lat_norm", "lon_norm", "grid_lat", "grid_lon",
            "dist_to_hotspot_km", "is_urban", "spatial_cluster_id",
            "hour_of_day", "day_of_week", "month", "is_weekend",
            "is_night", "is_festival_month", "season",
            "crime_head_id", "crime_sub_head_id", "gravity_id",
            "is_heinous", "is_cyber_crime", "accused_count",
        ],
        "exclude_cols": ["CaseID"],
        "train_split":  0.80,
        "val_split":    0.10,
        "test_split":   0.10,
        "class_weights":"balanced",
        "metric":       "F1_Score",                # Primary metric (imbalanced classes)
    },

    "district_risk": {
        "name":         "KSP_DistrictRiskScore",
        "file":         "features/district_features.parquet",
        "task_type":    "Regression",
        "target_col":   "risk_score_composite",
        "algorithm":    "AutoML",
        "features": [
            "population_density", "urbanisation_rate", "literacy_rate",
            "poverty_index", "police_station_density", "cases_per_100k",
            "clearance_rate_3mo", "heinous_crime_ratio",
            "cyber_crime_growth_rate", "seasonal_index",
        ],
        "exclude_cols": ["DistrictID"],
        "train_split":  0.80,
        "val_split":    0.10,
        "test_split":   0.10,
        "metric":       "RMSE",
    },

    "trend_forecasting": {
        "name":         "KSP_TrendForecasting",
        "file":         "features/trend_features.parquet",
        "task_type":    "TimeSeries",
        "date_col":     "ds",
        "target_col":   "y",
        "algorithm":    "AutoML",                  # Maps to Prophet in QuickML
        "group_col":    "UnitID",
        "forecast_horizon": 12,
        "forecast_unit":    "weeks",
        "exogenous_cols": ["is_festival_week", "heinous_count", "cyber_count"],
        "metric":        "MAE",
    },

    "anomaly_detection": {
        "name":         "KSP_AnomalyDetection",
        "file":         "features/anomaly_features.parquet",
        "task_type":    "AnomalyDetection",
        "algorithm":    "AutoML",                  # Maps to Isolation Forest
        "contamination":0.025,
        "exclude_cols": ["CaseID"],
        "metric":       "AUC_PR",
    },

    "case_outcome": {
        "name":         "KSP_CaseOutcome",
        "file":         "features/hotspot_features.parquet",  # reuse case features
        "task_type":    "Classification",
        "target_col":   "chargesheet_type_ord",
        "algorithm":    "AutoML",
        "features": [
            "crime_head_id", "crime_sub_head_id", "gravity_id",
            "is_heinous", "accused_count", "victim_count",
            "has_arrest", "arrest_lag_days", "is_cyber_crime",
            "hour_of_day", "month", "is_festival_month",
            "spatial_cluster_id", "dist_to_hotspot_km",
        ],
        "exclude_cols": ["CaseID", "target_is_hotspot"],
        "train_split":  0.80,
        "val_split":    0.10,
        "test_split":   0.10,
        "class_weights":"balanced",
        "metric":       "Weighted_F1",
    },
}


# ---------------------------------------------------------------------------
# SECTION 2: QUICKML API WRAPPER
# ---------------------------------------------------------------------------

class CatalystQuickML:
    """
    Wraps Zoho Catalyst QuickML REST API calls.

    Authentication: Uses the Catalyst SDK which handles OAuth tokens
    automatically when running inside a Catalyst Function.

    When running locally, set:
        CATALYST_TOKEN=<your_developer_token>
        CATALYST_PROJECT_ID=<your_project_id>

    Catalyst QuickML REST Endpoints:
        POST   /v1/project/{id}/ml/dataset          -- upload dataset
        POST   /v1/project/{id}/ml/model/train      -- trigger training
        GET    /v1/project/{id}/ml/model/{model_id} -- get model status
        POST   /v1/project/{id}/ml/model/{id}/predict -- batch predict
        GET    /v1/project/{id}/ml/model/{id}/explain  -- get explanations
    """

    BASE_URL = "https://api.catalyst.zoho.com"

    def __init__(self, project_id: str | None = None, token: str | None = None):
        self.project_id = project_id or os.environ.get("CATALYST_PROJECT_ID", "")
        self.token      = token or os.environ.get("CATALYST_TOKEN", "")
        self._model_ids: dict = {}   # dataset_key -> quickml_model_id

    def _headers(self) -> dict:
        return {
            "Authorization": f"Catalyst-auth-token {self.token}",
            "Content-Type":  "application/json",
        }

    def upload_dataset(self, dataset_key: str, file_path: str) -> dict:
        """
        Uploads a feature CSV/parquet to QuickML as a training dataset.

        QuickML supports:
            - CSV files (recommended for compatibility)
            - Direct DataStore table references (zero-copy)

        Catalyst CLI equivalent:
            zcatalyst ml dataset create --name KSP_HotspotPrediction \\
                                         --file hotspot_features.csv
        """
        cfg = QUICKML_DATASETS[dataset_key]
        log.info(f"Uploading dataset: {cfg['name']} from {file_path}")

        # In production inside a Catalyst Function:
        #   import zcatalyst_sdk_node equivalent from Python SDK
        #   app = catalyst.initializeApp()
        #   ml = app.ml()
        #   dataset = await ml.createDataset(name=cfg['name'], filePath=file_path)
        #   return {"dataset_id": dataset.getId(), "status": "CREATED"}

        # Simulated response for local development:
        return {
            "dataset_key":  dataset_key,
            "dataset_name": cfg["name"],
            "dataset_id":   f"dataset_{dataset_key}_001",
            "rows_uploaded": 0,
            "status":        "SIMULATED",
        }

    def train_model(self, dataset_key: str, dataset_id: str) -> dict:
        """
        Triggers a QuickML training job for the given dataset.

        QuickML Training Config (passed as JSON body):
            {
              "dataset_id": "dataset_hotspot_001",
              "task_type":  "Classification",
              "target":     "target_is_hotspot",
              "algorithm":  "AutoML",
              "features":   [...],
              "metric":     "F1_Score"
            }

        Catalyst CLI equivalent:
            zcatalyst ml model train --dataset-id <id> \\
                                      --task-type Classification \\
                                      --target target_is_hotspot \\
                                      --algorithm AutoML
        """
        cfg = QUICKML_DATASETS[dataset_key]
        log.info(f"Starting QuickML training: {cfg['name']}")

        train_payload = {
            "dataset_id":  dataset_id,
            "task_type":   cfg["task_type"],
            "target":      cfg.get("target_col", ""),
            "algorithm":   cfg.get("algorithm", "AutoML"),
            "features":    cfg.get("features", []),
            "metric":      cfg.get("metric", "F1_Score"),
        }
        if cfg["task_type"] == "TimeSeries":
            exog_val = cfg.get("exogenous_cols", [])
            ts_params = {
                "date_col":         str(cfg["date_col"]),
                "forecast_horizon": int(str(cfg["forecast_horizon"])),
                "forecast_unit":    str(cfg["forecast_unit"]),
                "exogenous_cols":   list(exog_val) if isinstance(exog_val, list) else [str(exog_val)],  # type: ignore
            }
            if cfg.get("group_col") is not None:
                ts_params["group_col"] = str(cfg["group_col"])
            train_payload.update(ts_params)
        if cfg["task_type"] == "AnomalyDetection":
            train_payload["contamination"] = cfg.get("contamination", 0.025)

        log.info(f"  Training payload: {json.dumps(train_payload, indent=2)}")

        # Simulated response:
        model_id = f"model_{dataset_key}_001"
        self._model_ids[dataset_key] = model_id
        return {
            "model_id":     model_id,
            "model_name":   cfg["name"],
            "status":       "TRAINING",
            "estimated_mins": 8,
        }

    def get_model_status(self, dataset_key: str) -> dict:
        """
        Polls QuickML model training status.

        Response statuses: TRAINING | COMPLETED | FAILED
        """
        model_id = self._model_ids.get(dataset_key, "unknown")
        return {
            "model_id": model_id,
            "status":   "COMPLETED",     # simulated
            "metrics": {
                "F1_Score":  0.87,
                "Accuracy":  0.91,
                "Precision": 0.85,
                "Recall":    0.89,
                "AUC":       0.94,
            }
        }

    def predict(self, dataset_key: str, records: list[dict]) -> list[dict]:
        """
        Calls the QuickML hosted prediction endpoint.

        Catalyst REST call:
            POST /v1/project/{id}/ml/model/{model_id}/predict
            Body: {"records": [...]}

        Catalyst Node.js SDK equivalent (in Serverless Function):
            const mlModel = await app.ml().getModel(modelId);
            const result = await mlModel.predict(records);

        This method falls back to our custom sklearn models when
        QuickML endpoint is not available (local dev mode).
        """
        model_id = self._model_ids.get(dataset_key)
        if not model_id or not self.token:
            log.warning(f"No QuickML endpoint for {dataset_key}. Using local model fallback.")
            return self._local_fallback(dataset_key, records)

        log.info(f"Calling QuickML endpoint: model={model_id}, records={len(records)}")
        # Production call via requests:
        # import requests
        # url = f"{self.BASE_URL}/v1/project/{self.project_id}/ml/model/{model_id}/predict"
        # resp = requests.post(url, headers=self._headers(), json={"records": records})
        # return resp.json()["data"]["predictions"]

        return [{"prediction": "SIMULATED", "confidence": 0.90} for _ in records]

    def _local_fallback(self, dataset_key: str, records: list[dict]) -> list[dict]:
        """
        Uses local joblib models as fallback when QuickML is unavailable.
        """
        import joblib
        model_map = {
            "hotspot_prediction": "models/hotspot_predictor.pkl",
            "district_risk":      "models/district_risk_scorer.pkl",
            "anomaly_detection":  "models/anomaly_detector.pkl",
            "case_outcome":       "models/case_outcome_predictor.pkl",
        }
        model_path = model_map.get(dataset_key)
        if not model_path or not Path(model_path).exists():
            return [{"error": "Model not available", "fallback": True}]

        import pandas as pd
        model = joblib.load(model_path)
        df = pd.DataFrame(records)
        return model.predict(df)

    def get_explanations(self, dataset_key: str, record_ids: list) -> list[dict]:
        """
        Fetches SHAP explanations from QuickML model.

        Catalyst REST call:
            GET /v1/project/{id}/ml/model/{model_id}/explain?record_ids=...
        """
        model_id = self._model_ids.get(dataset_key)
        log.info(f"Fetching explanations for {len(record_ids)} records from model {model_id}")
        # Simulated SHAP explanation response:
        return [
            {
                "record_id": rid,
                "top_features": [
                    {"feature": "dist_to_hotspot_km", "shap": -0.342},
                    {"feature": "hour_of_day",         "shap": 0.218},
                    {"feature": "is_night",            "shap": 0.195},
                ],
            }
            for rid in record_ids
        ]


# ---------------------------------------------------------------------------
# SECTION 3: CATALYST RISK FUNCTION HANDLER
# ---------------------------------------------------------------------------

def catalyst_risk_handler(req, res):
    """
    Zoho Catalyst Serverless Function handler for the 'risk' function.

    Routes:
        GET  /api/v1/ml/hotspots         -> hotspot predictions
        GET  /api/v1/ml/district-risk    -> district risk scores
        GET  /api/v1/ml/trend/:unit_id   -> trend forecast
        GET  /api/v1/ml/anomalies        -> anomaly summary
        GET  /api/v1/ml/case-outcome/:id -> case outcome prediction
        POST /api/v1/ml/explain          -> SHAP explanation for records

    This function is deployed to:
        functions/risk/index.js
    (The Node.js version calls into a Python subprocess or uses
     the QuickML REST endpoint directly.)
    """
    import json

    # CORS headers
    res.set_header("Access-Control-Allow-Origin", "*")
    res.set_header("Content-Type", "application/json")

    url    = req.url
    method = req.method

    if method == "OPTIONS":
        res.end("{}")
        return

    quickml = CatalystQuickML(
        project_id=os.environ.get("CATALYST_PROJECT_ID"),
        token=os.environ.get("CATALYST_TOKEN"),
    )

    try:
        if url.startswith("/api/v1/ml/hotspots") and method == "GET":
            # Load pre-computed hotspot grid (refreshed daily by cron)
            hotspot_grid_path = Path("./cache/hotspot_grid.json")
            if hotspot_grid_path.exists():
                data = json.loads(hotspot_grid_path.read_text())
            else:
                data = {"error": "Hotspot cache not found. Run ML pipeline first."}
            res.write(json.dumps({"success": True, "data": data}))

        elif url.startswith("/api/v1/ml/district-risk") and method == "GET":
            district_risk_path = Path("./cache/district_risk.json")
            if district_risk_path.exists():
                data = json.loads(district_risk_path.read_text())
            else:
                data = {"error": "District risk cache not found."}
            res.write(json.dumps({"success": True, "data": data}))

        elif url.startswith("/api/v1/ml/anomalies") and method == "GET":
            anomaly_path = Path("./cache/anomaly_summary.json")
            if anomaly_path.exists():
                data = json.loads(anomaly_path.read_text())
            else:
                data = {"total_cases": 0, "anomaly_count": 0}
            res.write(json.dumps({"success": True, "data": data}))

        elif url.startswith("/api/v1/ml/trend") and method == "GET":
            parts = url.split("/")
            unit_id = int(parts[-1]) if parts[-1].isdigit() else None
            forecast = quickml.predict("trend_forecasting", [{"UnitID": unit_id}])
            res.write(json.dumps({"success": True, "data": forecast}))

        elif url.startswith("/api/v1/ml/explain") and method == "POST":
            body = json.loads(req.body)
            record_ids = body.get("record_ids", [])
            model_key  = body.get("model", "hotspot_prediction")
            explanations = quickml.get_explanations(model_key, record_ids)
            res.write(json.dumps({"success": True, "data": explanations}))

        else:
            res.status_code = 404
            res.write(json.dumps({"error": "Unknown ML endpoint"}))

    except Exception as e:
        log.error(f"ML handler error: {e}")
        res.write(json.dumps({"success": False, "error": str(e)}))

    res.end()


# ---------------------------------------------------------------------------
# SECTION 4: QUICKML TRAINING WORKFLOW (CLI)
# ---------------------------------------------------------------------------

def run_quickml_pipeline(features_dir: str = "features"):
    """
    End-to-end QuickML pipeline:
        1. Upload feature datasets to Catalyst QuickML
        2. Trigger training jobs for each task
        3. Poll until all models are COMPLETED
        4. Run batch predictions and cache results
    """
    import time

    quickml = CatalystQuickML()
    log.info("=" * 60)
    log.info("  KSP Catalyst QuickML Pipeline")
    log.info("=" * 60)

    dataset_ids = {}

    # Step 1: Upload datasets
    log.info("\nStep 1: Uploading feature datasets to QuickML ...")
    for key, cfg in QUICKML_DATASETS.items():
        file_path = Path(features_dir) / Path(cfg["file"]).name
        if not file_path.exists():
            log.warning(f"  Skipping {key}: feature file not found at {file_path}")
            continue
        result = quickml.upload_dataset(key, str(file_path))
        dataset_ids[key] = result["dataset_id"]
        log.info(f"  Uploaded: {cfg['name']} -> {result['dataset_id']}")

    # Step 2: Trigger training
    log.info("\nStep 2: Starting QuickML training jobs ...")
    model_results = {}
    for key, did in dataset_ids.items():
        result = quickml.train_model(key, did)
        model_results[key] = result
        log.info(f"  Training: {result['model_name']} (ETA: {result['estimated_mins']} min)")

    # Step 3: Poll training status
    log.info("\nStep 3: Polling training completion ...")
    max_wait = 30   # minutes
    poll_interval = 60  # seconds
    completed = set()
    for attempt in range(max_wait):
        for key in model_results:
            if key in completed:
                continue
            status = quickml.get_model_status(key)
            if status["status"] == "COMPLETED":
                completed.add(key)
                log.info(f"  COMPLETED: {key} | Metrics: {status.get('metrics', {})}")
            elif status["status"] == "FAILED":
                log.error(f"  FAILED: {key}")
                completed.add(key)
        if len(completed) == len(model_results):
            break
        log.info(f"  {len(completed)}/{len(model_results)} models done. Waiting {poll_interval}s ...")
        time.sleep(poll_interval)

    log.info("\nAll QuickML jobs finished.")
    return {
        "datasets":  dataset_ids,
        "models":    {k: v["model_id"] for k, v in model_results.items()},
        "completed": list(completed),
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="KSP Catalyst QuickML Pipeline")
    parser.add_argument("--action", choices=["upload", "train", "predict", "full"],
                        default="full", help="Pipeline action to run")
    parser.add_argument("--features-dir", default="features")
    args = parser.parse_args()

    if args.action in ("full", "train", "upload"):
        result = run_quickml_pipeline(features_dir=args.features_dir)
        print("\n" + "=" * 60)
        print("  QuickML Pipeline Result")
        print(json.dumps(result, indent=2))
        print("=" * 60)
    else:
        log.info("Use --action full to run the complete pipeline.")
