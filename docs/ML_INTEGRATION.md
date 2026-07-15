# ML Integration Architecture

## Overview

The Crime Intelligence Platform uses a **pre-computed prediction architecture** where ML models run in batch mode daily, and the API serves cached predictions. This approach ensures:

- ✅ **Production reliability** - No real-time ML inference failures
- ✅ **Fast API responses** - Serve cached results from DataStore
- ✅ **Works within Catalyst constraints** - Serverless-friendly architecture
- ✅ **Real ML predictions** - Not heuristics, actual trained models

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Daily at 2 AM                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Catalyst Cron Job Trigger         │
         │  functions/ml-batch-update/        │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Execute Python ML Script          │
         │  ml/export_predictions.py          │
         │                                    │
         │  • Train 5 ML models               │
         │  • Generate predictions            │
         │  • Export to JSON                  │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  predictions_YYYY-MM-DD.json       │
         │  {                                 │
         │    case_outcomes: [...],           │
         │    anomalies: [...],               │
         │    district_forecasts: [...],      │
         │    district_risk_scores: [...],    │
         │    hotspots: [...]                 │
         │  }                                 │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Import to Catalyst DataStore      │
         │  (Batch operations, 100 rows/chunk)│
         │                                    │
         │  Tables:                           │
         │  • PredictedCaseOutcomes           │
         │  • DetectedAnomalies               │
         │  • DistrictForecasts               │
         │  • DistrictRiskScores              │
         │  • PredictedHotspots               │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Predictions API                   │
         │  GET /predictions?type=...         │
         │                                    │
         │  Queries cached predictions from   │
         │  DataStore with role-based filters │
         └────────────────────────────────────┘
```

## Components

### 1. ML Models (Python)

Located in: `ml/models.py`

**Five production models:**
1. **HotspotPredictor** - XGBoost spatial classification for crime hotspots
2. **DistrictRiskScorer** - Gradient Boosting for district-level risk assessment
3. **TrendForecaster** - Prophet time-series for 12-week crime forecasts
4. **AnomalyDetector** - Isolation Forest for spike/anomaly detection
5. **CaseOutcomePredictor** - Random Forest for chargesheet probability

Each model includes:
- Feature importance extraction
- SHAP explainability (via ExplainabilityWrapper)
- JSON-serializable output for API consumption

### 2. Prediction Export Script

**File:** `ml/export_predictions.py`

**Purpose:** Train all models and generate predictions for ingestion

**Execution:**
```bash
cd ml
source venv/Scripts/activate  # or venv/bin/activate on Linux/Mac
python export_predictions.py --output-dir ./predictions
```

**Output:** `predictions_YYYY-MM-DD.json` containing:
- Case outcome predictions (chargesheet probability, confidence)
- Anomaly detections (score, type, location)
- District forecasts (12-week ahead predictions)
- District risk scores (HIGH/MEDIUM/LOW classifications)
- Predicted hotspots (lat/lon coordinates, severity)

**Training Data:** Currently uses generated sample data. In production, this would:
1. Query Catalyst DataStore for historical FIR data
2. Extract features via FeaturePipeline
3. Train models on real cases
4. Generate predictions for active cases

### 3. Batch Update Cron Job

**File:** `functions/ml-batch-update/index.js`

**Schedule:** Daily at 2:00 AM (Cron: `0 2 * * *`)

**Process:**
1. Execute Python ML script via child_process.spawn()
2. Read generated predictions JSON
3. Import predictions to DataStore in batches (100 rows/chunk)
4. Log execution summary with import counts
5. Handle errors gracefully (partial success on failures)

**Monitoring:**
- Logs execution status to Catalyst logs
- Returns detailed results object with import counts
- Tracks errors per prediction type

### 4. Predictions API

**File:** `functions/predictions/index.js`

**Endpoints:**
- `GET /predictions?type=caseOutcome` - Case outcome predictions
- `GET /predictions?type=anomaly` - Anomaly detections
- `GET /predictions?type=trend` - District forecasts
- `GET /predictions?type=all` - All prediction types (default)

**Role-Based Access:**
- **SCRB_ADMIN** - See all districts
- **DISTRICT_OFFICER** - See only their district
- **INVESTIGATION_OFFICER** - See only their unit

**Query Parameters:**
- `type` - Prediction type (caseOutcome, anomaly, trend, all)
- `limit` - Max results (default: 50, max: 500)
- `districtId` - Filter by district (optional)
- `unitId` - Filter by unit (optional)

**Current State:** Uses heuristics for predictions
**Target State:** Query cached predictions from DataStore tables

## DataStore Schema (Proposed)

### PredictedCaseOutcomes
```
- caseId (string, primary key)
- caseNo (string)
- predictedOutcome (string: DETECTED/UNDETECTED/FALSE)
- chargesheetProbability (number: 0-100)
- confidence (number: 0-100)
- accusedCount (number)
- hasArrest (boolean)
- updatedAt (datetime)
```

### DetectedAnomalies
```
- caseId (string, primary key)
- caseNo (string)
- anomalyScore (number: 0-100)
- isAnomaly (boolean)
- anomalyType (string: spatial/temporal/behavioral)
- districtId (number)
- updatedAt (datetime)
```

### DistrictForecasts
```
- districtId (number, primary key)
- districtName (string)
- currentAvg (number)
- forecast (JSON: array of {ds, yhat, yhat_lower, yhat_upper})
- trendDirection (string: INCREASING/DECREASING/STABLE)
- peakWeek (string: date)
- updatedAt (datetime)
```

### DistrictRiskScores
```
- districtId (number, primary key)
- riskScore (number: 0-100)
- riskLevel (string: HIGH/MEDIUM/LOW)
- totalCases (number)
- heinousCases (number)
- updatedAt (datetime)
```

### PredictedHotspots
```
- hotspotId (auto-increment, primary key)
- latitude (number)
- longitude (number)
- caseCount (number)
- severity (string: HIGH/MEDIUM/LOW)
- radius (number: meters)
- updatedAt (datetime)
```

## Deployment Steps

### 1. Set Up Catalyst Cron Job
```bash
# In Catalyst Console:
1. Navigate to Functions > Cron
2. Create new Cron Job:
   - Name: "ML Batch Update"
   - Schedule: "0 2 * * *" (2 AM daily)
   - Function: ml-batch-update
   - Enabled: true
```

### 2. Create DataStore Tables
```sql
-- Run in Catalyst DataStore console
CREATE TABLE PredictedCaseOutcomes (...);
CREATE TABLE DetectedAnomalies (...);
CREATE TABLE DistrictForecasts (...);
CREATE TABLE DistrictRiskScores (...);
CREATE TABLE PredictedHotspots (...);
```

### 3. Test ML Script Locally
```bash
cd ml
source venv/Scripts/activate
python export_predictions.py --output-dir ./predictions
# Verify: predictions/predictions_YYYY-MM-DD.json created
```

### 4. Manual Test Run
```bash
# Trigger Cron job manually from Catalyst Console
# Check logs for successful execution
# Verify DataStore tables populated
```

### 5. Update Predictions API
- Modify `/functions/predictions/index.js`
- Replace heuristic computations with DataStore queries
- Deploy updated function

## Benefits Over Real-Time Inference

### ✅ Reliability
- No ML model loading delays
- No prediction timeout failures
- Consistent response times

### ✅ Performance
- API responses <100ms (DataStore query)
- No CPU-intensive ML computation on request path
- Scales with serverless architecture

### ✅ Cost Efficiency
- Models train once daily, not per request
- Cheaper DataStore queries vs. compute-heavy predictions
- Predictable resource usage

### ✅ Maintainability
- Clear separation: ML (batch) vs. API (serve)
- Easy to update models without API downtime
- Simpler debugging (check batch logs, then API logs)

## Monitoring & Maintenance

### Daily Checks
- Verify Cron job execution (Catalyst logs)
- Check prediction counts imported
- Monitor API response times

### Weekly Review
- Review prediction accuracy vs. actual outcomes
- Check for model drift indicators
- Update training data if needed

### Monthly Maintenance
- Retrain models with latest data
- Update model versions
- Review and tune hyperparameters

## Next Steps (Phase 2.2)

1. **Update Predictions API** - Replace heuristics with DataStore queries
2. **Create DataStore Tables** - Set up schema in Catalyst Console
3. **Train Models on Real Data** - Replace sample data with actual FIRs
4. **Deploy Cron Job** - Schedule daily batch updates
5. **Monitor & Iterate** - Track performance and accuracy

---

**Status:** Phase 2.1 Complete - ML Inference Bridge Created  
**Next:** Phase 2.2 - Train & Deploy Models
