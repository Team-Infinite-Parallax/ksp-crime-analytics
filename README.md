# Karnataka State Police (KSP) - Crime Intelligence Agent
 
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Zoho Catalyst](https://img.shields.io/badge/Zoho-Catalyst-orange.svg)]()
[![React](https://img.shields.io/badge/React-18-blue.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)]()

An AI-powered Crime Intelligence Agent designed for the Karnataka State Police. The platform leverages Zoho Catalyst's serverless ecosystem to process First Information Reports (FIRs) in real-time, generate automated intelligence on crime hotspots, and proactively send alerts to commanding officers, significantly improving response times and law enforcement strategy.

---

## 🏗️ Architecture

The system follows a highly scalable, serverless microservices architecture deployed on Zoho Catalyst:

1. **Frontend**: React-based dashboard featuring interactive maps (React Leaflet) for crime hotspot visualization, anomaly graphs, and comprehensive reporting.
2. **Backend**: Express/Node.js REST API handling FIR submissions and analytical queries.
3. **Data Layer**: Catalyst Cloud Scale Datastore (RDBMS) for structured FIR and intelligence data.
4. **AI & ML**: Catalyst QuickML for forecasting and anomaly detection, supplemented by Python-based feature engineering.
5. **Event-Driven Workflow**: Catalyst Signals and Circuits manage the asynchronous pipeline (FIR Ingestion → Feature Engineering → AI Prediction → Alert Generation).

---

## ✨ Features

- **Real-Time FIR Processing**: Instant ingestion and structuring of textual FIR data.
- **Predictive Policing**: Time-series forecasting to predict future crime volumes by district.
- **Anomaly Detection**: Automated identification of irregular crime spikes in specific jurisdictions.
- **Geospatial Hotspots**: Interactive, animated crime density and hotspot maps.
- **Automated Intelligence Reports**: PDF reports generated from ML insights.
- **Instant Escalations**: Email and SMS alerts sent to jurisdictional officers when severe anomalies are detected.

---

## 🚀 Catalyst Services

This project extensively utilizes the Zoho Catalyst Serverless Ecosystem:

- **Catalyst Datastore**: Relational database for storing FIRs, Districts, Stations, and ML Predictions.
- **Catalyst Advanced I/O Functions**: Powers the Node.js Express backend for the React client.
- **Catalyst Event Signals**: Triggers intelligence workflows upon new FIR insertions.
- **Catalyst Circuits**: Orchestrates the multi-step AI inference pipeline.
- **Catalyst QuickML**: Trains and deploys machine learning models for forecasting and anomaly detection.
- **Catalyst SmartBrowz**: Dynamically generates PDF Intelligence Reports.
- **Catalyst Mail / Cron**: Scheduled and event-driven email notifications to officers.

---

## 📁 Folder Structure

```
ksp-datathon/
├── client/                     # React Frontend Application
│   ├── public/                 # Static assets
│   ├── src/                    # React components, contexts, and API services
│   └── package.json            # Frontend dependencies
├── functions/                  # Zoho Catalyst Backend Functions
│   ├── api_service/            # Node.js/Express REST API
│   ├── event_handler/          # Catalyst Event Signal processors
│   └── cron_jobs/              # Scheduled periodic tasks
├── ml/                         # Machine Learning & AI Pipeline
│   ├── feature_engineering.py  # Data preprocessing and scaling
│   ├── models.py               # Custom estimators and scoring models
│   └── quickml_integration.py  # Scripts to sync data with Zoho QuickML
├── data-generator/             # Synthetic Data Engine
│   ├── generate.py             # Generates realistic synthetic FIR data
│   └── config.py               # Generation rules and parameters
├── catalyst.json               # Zoho Catalyst configuration
└── README.md                   # Project documentation
```

---

## 💻 Installation

### Prerequisites
- Node.js (v18+)
- Python (3.13+)
- Zoho Catalyst CLI (`npm install -g zcatalyst-cli`)
- A Zoho Catalyst Account

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/ksp-crime-intelligence.git
   cd ksp-datathon
   ```

2. **Backend Setup**
   ```bash
   cd functions/api_service
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../../client
   npm install
   ```

4. **Python ML Environment (Optional, for local testing)**
   ```bash
   cd ../
   python -m venv .venv
   source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

---

## ☁️ Deployment

Deploying the application to Zoho Catalyst is fully automated via the Catalyst CLI:

1. **Login to Catalyst**
   ```bash
   catalyst login
   ```
2. **Initialize Project**
   ```bash
   catalyst init
   ```
3. **Deploy All Components**
   ```bash
   catalyst deploy
   ```
*This command deploys the client hosting, backend functions, database schema, and circuit configurations to your Catalyst production environment.*

---

## 📸 Screenshots

*(Replace these with actual screenshots of your application)*

| Dashboard Overview | Crime Hotspot Map |
| :---: | :---: |
| ![Dashboard](https://via.placeholder.com/400x250?text=Dashboard+Overview) | ![Map](https://via.placeholder.com/400x250?text=Crime+Hotspot+Map) |

| AI Intelligence Report | Officer Email Alert |
| :---: | :---: |
| ![Report](https://via.placeholder.com/400x250?text=AI+Intelligence+Report) | ![Alert](https://via.placeholder.com/400x250?text=Officer+Email+Alert) |

---

## 📖 API Documentation

### Base URL
`/server/api_service`

### Endpoints

- **`GET /api/firs`**
  - **Description**: Fetch all FIRs. Supports pagination and filtering.
  - **Query Params**: `limit`, `offset`, `district`, `status`

- **`POST /api/firs`**
  - **Description**: Create a new FIR. Triggers Event Signals.
  - **Body**: `{ "district": "Bangalore", "crime_type": "Theft", "description": "..." }`

- **`GET /api/analytics/hotspots`**
  - **Description**: Retrieve geospatial hotspot data for map rendering.

- **`GET /api/intelligence/reports/:district`**
  - **Description**: Generate and return a PDF report for a specific district using SmartBrowz.

---

## 🤝 Contributors

- **Your Name / Team Name** - *Initial work & Architecture* - [GitHub Profile](https://github.com/your-profile)

*Feel free to submit pull requests or raise issues for enhancements!*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

