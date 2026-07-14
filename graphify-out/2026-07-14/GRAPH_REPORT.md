# Graph Report - Crime-Intelligence-Agent  (2026-07-14)

## Corpus Check
- 120 files · ~87,160 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 792 nodes · 995 edges · 71 communities (62 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4387731c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_DataFrame|DataFrame]]
- [[_COMMUNITY___init__.py|__init__.py]]
- [[_COMMUNITY_DESIGN|DESIGN.md]]
- [[_COMMUNITY_Table Definitions (28 tables)|Table Definitions (28 tables)]]
- [[_COMMUNITY_1. Table-by-Table Deep Dive|1. Table-by-Table Deep Dive]]
- [[_COMMUNITY_What You Must Do When Invoked|What You Must Do When Invoked]]
- [[_COMMUNITY_Phase 1 Implementation ML Model Integration - Complete|Phase 1 Implementation: ML Model Integration - Complete]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_App.jsx|App.jsx]]
- [[_COMMUNITY_deploy.py|deploy.py]]
- [[_COMMUNITY_networkData.js|networkData.js]]
- [[_COMMUNITY_CatalystQuickML|CatalystQuickML]]
- [[_COMMUNITY_generate.py|generate.py]]
- [[_COMMUNITY_test-endpoints.js|test-endpoints.js]]
- [[_COMMUNITY_HotspotMap.jsx|HotspotMap.jsx]]
- [[_COMMUNITY_Karnataka State Police (KSP) - Crime Intelligence Agent|Karnataka State Police (KSP) - Crime Intelligence Agent]]
- [[_COMMUNITY_copbotEnhanced.js|copbotEnhanced.js]]
- [[_COMMUNITY_import-data.js|import-data.js]]
- [[_COMMUNITY_Karnataka Police FIR Database -- Planted Patterns & Anomalies|Karnataka Police FIR Database -- Planted Patterns & Anomalies]]
- [[_COMMUNITY_SocioEconomicOverlay.jsx|SocioEconomicOverlay.jsx]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_index.js|index.js]]
- [[_COMMUNITY_graphify reference extra exports and benchmark|graphify reference: extra exports and benchmark]]
- [[_COMMUNITY_authMiddleware.js|authMiddleware.js]]
- [[_COMMUNITY_authMiddleware.js|authMiddleware.js]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_authMiddleware.js|authMiddleware.js]]
- [[_COMMUNITY_authMiddleware.js|authMiddleware.js]]
- [[_COMMUNITY_authMiddleware.js|authMiddleware.js]]
- [[_COMMUNITY_Frontend Design|Frontend Design]]
- [[_COMMUNITY_Karnataka Police FIR Database Design & Architecture Document|Karnataka Police FIR Database Design & Architecture Document]]
- [[_COMMUNITY_6.1 Core API Routes|6.1 Core API Routes]]
- [[_COMMUNITY_5. AI Crime Intelligence Integration|5. AI Crime Intelligence Integration]]
- [[_COMMUNITY_index.js|index.js]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_index.js|index.js]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_graphify reference query, path, explain|graphify reference: query, path, explain]]
- [[_COMMUNITY_.oxlintrc.json|.oxlintrc.json]]
- [[_COMMUNITY_Login.jsx|Login.jsx]]
- [[_COMMUNITY_Navbar.jsx|Navbar.jsx]]
- [[_COMMUNITY_index.js|index.js]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_Web Interface Guidelines|Web Interface Guidelines]]
- [[_COMMUNITY_CopBot.jsx|CopBot.jsx]]
- [[_COMMUNITY_4. Analytical Acceleration Derived & Aggregate Tables|4. Analytical Acceleration: Derived & Aggregate Tables]]
- [[_COMMUNITY_graphify reference add a URL and watch a folder|graphify reference: add a URL and watch a folder]]
- [[_COMMUNITY_graphify reference commit hook and native CLAUDE.md integration|graphify reference: commit hook and native CLAUDE.md integration]]
- [[_COMMUNITY_graphify reference incremental update and cluster-only|graphify reference: incremental update and cluster-only]]
- [[_COMMUNITY_React + Vite|React + Vite]]
- [[_COMMUNITY_RiskProfiling.jsx|RiskProfiling.jsx]]
- [[_COMMUNITY_WantedMissing.jsx|WantedMissing.jsx]]
- [[_COMMUNITY_2. Entity-Relationship Mapping & Hierarchy|2. Entity-Relationship Mapping & Hierarchy]]
- [[_COMMUNITY_graphify reference GitHub clone and cross-repo merge|graphify reference: GitHub clone and cross-repo merge]]
- [[_COMMUNITY_graphify reference transcribe video and audio|graphify reference: transcribe video and audio]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_extraction-spec|extraction-spec.md]]
- [[_COMMUNITY_index.js|index.js]]
- [[_COMMUNITY_index.js|index.js]]

## God Nodes (most connected - your core abstractions)
1. `Table Definitions (28 tables)` - 29 edges
2. `1. Table-by-Table Deep Dive` - 29 edges
3. `FeaturePipeline` - 13 edges
4. `CatalystQuickML` - 13 edges
5. `ExplainabilityWrapper` - 12 edges
6. `train_and_save_all()` - 12 edges
7. `What You Must Do When Invoked` - 12 edges
8. `Karnataka State Police (KSP) - Crime Intelligence Agent` - 12 edges
9. `Karnataka Police FIR Database -- Planted Patterns & Anomalies` - 12 edges
10. `SpatialFeatureTransformer` - 11 edges

## Surprising Connections (you probably didn't know these)
- `DataExtractor` --uses--> `FeaturePipeline`  [INFERRED]
  ml/deploy.py → ml/feature_engineering.py
- `BehavioralProfiles()` --calls--> `fetchClusters()`  [INFERRED]
  client/src/components/Dashboard/BehavioralProfiles.jsx → client/src/utils/copbotEnhanced.js
- `CaseOutcomePredictions()` --calls--> `fetchPredictions()`  [INFERRED]
  client/src/components/Dashboard/CaseOutcomePredictions.jsx → client/src/utils/copbotEnhanced.js
- `CrimeTrendsChart()` --calls--> `fetchAnomalies()`  [INFERRED]
  client/src/components/Dashboard/CrimeTrendsChart.jsx → client/src/utils/copbotEnhanced.js
- `TrendForecasts()` --calls--> `fetchForecasts()`  [INFERRED]
  client/src/components/Dashboard/TrendForecasts.jsx → client/src/utils/copbotEnhanced.js

## Import Cycles
- None detected.

## Communities (71 total, 9 thin omitted)

### Community 0 - "DataFrame"
Cohesion: 0.07
Nodes (28): AnomalyDetector, CaseOutcomePredictor, DistrictRiskScorer, ExplainabilityWrapper, HotspotPredictor, DataFrame, Series, Returns top-N SHAP features per row.         Format: [[{feature, value, shap_co (+20 more)

### Community 1 - "__init__.py"
Cohesion: 0.10
Nodes (21): BaseEstimator, AccusedFeatureTransformer, CaseFeatureTransformer, CatalystDataLoader, DistrictRiskFeatureTransformer, FeaturePipeline, MOTextFeatureTransformer, DataFrame (+13 more)

### Community 2 - "DESIGN.md"
Cohesion: 0.05
Nodes (41): Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors, Components (+33 more)

### Community 3 - "Table Definitions (28 tables)"
Cohesion: 0.07
Nodes (29): 10. Section, 11. CrimeHead, 12. CrimeSubHead, 13. CrimeHeadActSection, 14. CaseCategory, 15. CaseStatusMaster, 16. OccupationMaster, 17. ReligionMaster (+21 more)

### Community 4 - "1. Table-by-Table Deep Dive"
Cohesion: 0.07
Nodes (29): 10. GravityOffence, 11. CrimeHead, 12. CrimeSubHead, 13. CrimeHeadActSection, 14. CaseCategory, 15. CaseStatusMaster, 16. OccupationMaster, 17. ReligionMaster (+21 more)

### Community 5 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 6 - "Phase 1 Implementation: ML Model Integration - Complete"
Cohesion: 0.07
Nodes (26): 1. Backend Predictions API (`/predictions`), 1. Start the Backend, 2. Access Dashboard, 2. Frontend Components, 3. Integration Points, 3. Test Filters, 4. Verify Role-Based Access, A. Enhanced CrimeTrendsChart (+18 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, cytoscape, cytoscape-fcose, html2pdf.js, leaflet, lucide-react, react-dom, react-leaflet (+17 more)

### Community 8 - "App.jsx"
Cohesion: 0.13
Nodes (15): App(), CorrelationHeatmap(), Filters(), MetricCard(), RecentCrimesTable(), ReportsAnalytics(), ResourceDeployment(), RiskCard() (+7 more)

### Community 9 - "deploy.py"
Cohesion: 0.14
Nodes (18): _compute_psi(), DataExtractor, DataFrame, Returns dict of {table_name: DataFrame}., Extract via Catalyst DataStore CoQL (production path)., Pre-computes expensive ML predictions and stores them as JSON cache files., Packages ML artifacts and deploys to Catalyst environment.      Deployment ste, Monitors model health and data drift.      Checks:         1. Prediction dist (+10 more)

### Community 10 - "networkData.js"
Cohesion: 0.11
Nodes (17): CYTO_STYLE, LAYOUT_CONFIG, NetworkGraph(), NODE_TYPE_META, allEdges, allNodes, communities, crimeNodes (+9 more)

### Community 11 - "CatalystQuickML"
Cohesion: 0.13
Nodes (12): catalyst_risk_handler(), CatalystQuickML, Wraps Zoho Catalyst QuickML REST API calls.      Authentication: Uses the Cata, Uploads a feature CSV/parquet to QuickML as a training dataset.          Quick, Triggers a QuickML training job for the given dataset.          QuickML Traini, Polls QuickML model training status.          Response statuses: TRAINING | CO, Calls the QuickML hosted prediction endpoint.          Catalyst REST call:, Uses local joblib models as fallback when QuickML is unavailable. (+4 more)

### Community 12 - "generate.py"
Cohesion: 0.13
Nodes (6): _arr(), build_brief_facts(), get_officer(), _mk(), rand_amount(), rand_vehicle_reg()

### Community 13 - "test-endpoints.js"
Cohesion: 0.15
Nodes (12): catalyst, { requireAuth }, url, catalyst, requireAuth(), resolveEmployeeByEmail(), resolveEmployeeById(), catalyst (+4 more)

### Community 14 - "HotspotMap.jsx"
Cohesion: 0.15
Nodes (12): getHotspotPulseIcon(), HotspotMap(), stationIcon, TIMELINE_STEPS, MapFilters(), crimeCategories, districts, generateIncidents() (+4 more)

### Community 15 - "Karnataka State Police (KSP) - Crime Intelligence Agent"
Cohesion: 0.12
Nodes (16): 📖 API Documentation, 🏗️ Architecture, Base URL, 🚀 Catalyst Services, 🤝 Contributors, ☁️ Deployment, Endpoints, ✨ Features (+8 more)

### Community 16 - "copbotEnhanced.js"
Cohesion: 0.17
Nodes (11): BehavioralProfiles(), TYPOLOGY_ICONS, CaseOutcomePredictions(), CrimeTrendsChart(), TrendForecasts(), fetchAnomalies(), fetchClusters(), fetchForecasts() (+3 more)

### Community 17 - "import-data.js"
Cohesion: 0.19
Nodes (12): catalyst, filterExistingInBatch(), formatCoQLValue(), fs, insertWithRetry(), ORDER_FILE, OUTPUT_DIR, parseCSV() (+4 more)

### Community 18 - "Karnataka Police FIR Database -- Planted Patterns & Anomalies"
Cohesion: 0.15
Nodes (12): CrimeNo Format, Karnataka Police FIR Database -- Planted Patterns & Anomalies, ML Feature Suggestions, Overview, Pattern 1 - Burglary Hotspot (Bengaluru East, 3 stations), Pattern 2 - Cybercrime Growth (+40% Year-on-Year), Pattern 3 - Organized Crime (Drug Smuggling Syndicate), Pattern 4 - 15 Repeat Offenders (+4 more)

### Community 19 - "SocioEconomicOverlay.jsx"
Cohesion: 0.20
Nodes (9): react, DISTRICTS, EmergingTrendAlerts(), FACTOR_META, FACTOR_ORDER, SocioEconomicOverlay(), crimeCategoryTrends, districtSocioEconomic (+1 more)

### Community 20 - "package.json"
Cohesion: 0.18
Nodes (10): dependencies, ejs, express, zcatalyst-sdk-node, description, main, name, scripts (+2 more)

### Community 21 - "index.js"
Cohesion: 0.22
Nodes (7): catalyst, requireAuth(), catalyst, euclideanDistance(), performKMeansClustering(), { requireAuth }, url

### Community 22 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 23 - "authMiddleware.js"
Cohesion: 0.31
Nodes (7): catalyst, requireAuth(), resolveEmployeeByEmail(), resolveEmployeeById(), catalyst, { requireAuth }, url

### Community 24 - "authMiddleware.js"
Cohesion: 0.31
Nodes (7): catalyst, requireAuth(), resolveEmployeeByEmail(), resolveEmployeeById(), catalyst, { requireAuth }, url

### Community 25 - "package.json"
Cohesion: 0.22
Nodes (8): dependencies, zcatalyst-sdk-node, description, main, name, scripts, test, version

### Community 26 - "authMiddleware.js"
Cohesion: 0.31
Nodes (7): catalyst, requireAuth(), resolveEmployeeByEmail(), resolveEmployeeById(), catalyst, { requireAuth }, url

### Community 27 - "authMiddleware.js"
Cohesion: 0.36
Nodes (6): catalyst, requireAuth(), resolveEmployeeByEmail(), resolveEmployeeById(), catalyst, { requireAuth }

### Community 28 - "authMiddleware.js"
Cohesion: 0.36
Nodes (6): catalyst, requireAuth(), resolveEmployeeByEmail(), resolveEmployeeById(), catalyst, { requireAuth }

### Community 29 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 30 - "Karnataka Police FIR Database Design & Architecture Document"
Cohesion: 0.29
Nodes (6): 3.1 Clustered / Primary Key Indices, 3.2 Recommended Secondary & Composite Indices, 3. Database Indexing Strategy, 7. Operational Best Practices & Scaling Recommendations, AI Crime Intelligence Platform (Zoho Catalyst Implementation), Karnataka Police FIR Database Design & Architecture Document

### Community 31 - "6.1 Core API Routes"
Cohesion: 0.29
Nodes (7): 1. `GET /api/v1/cases`, 2. `POST /api/v1/cases`, 3. `GET /api/v1/analytics/hotspots`, 4. `GET /api/v1/accused/:id/network`, 6.1 Core API Routes, 6.2 Zoho Catalyst CoQL Query Implementation, 6. API Specifications & Database Integration

### Community 32 - "5. AI Crime Intelligence Integration"
Cohesion: 0.29
Nodes (7): 5.1 Burglary Hotspot Detection (Pattern 1), 5.2 Repeat Offender Profiling (Pattern 2), 5.3 Criminal Network Centrality (Pattern 3), 5.4 Temporal Forecasting (Pattern 4 & 5), 5.5 Behavioral Anomaly Detection (Pattern 6), 5.6 Clearance Rate Disparities (Pattern 7), 5. AI Crime Intelligence Integration

### Community 33 - "index.js"
Cohesion: 0.33
Nodes (5): catalyst, requireAuth(), catalyst, { requireAuth }, url

### Community 34 - "package.json"
Cohesion: 0.29
Nodes (6): dependencies, zcatalyst-sdk-node, description, main, name, version

### Community 35 - "package.json"
Cohesion: 0.29
Nodes (6): dependencies, zcatalyst-sdk-node, description, main, name, version

### Community 36 - "package.json"
Cohesion: 0.29
Nodes (6): author, dependencies, zcatalyst-sdk-node, main, name, version

### Community 37 - "index.js"
Cohesion: 0.33
Nodes (5): catalyst, requireAuth(), catalyst, { requireAuth }, url

### Community 38 - "package.json"
Cohesion: 0.29
Nodes (6): dependencies, zcatalyst-sdk-node, name, scripts, build, version

### Community 39 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 40 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 41 - "Login.jsx"
Cohesion: 0.27
Nodes (4): Login(), usersList, AlertCenter(), SEVERITY_CONFIG

### Community 42 - "Navbar.jsx"
Cohesion: 0.47
Nodes (3): AlertBadge(), VoiceSearch(), Navbar()

### Community 43 - "index.js"
Cohesion: 0.33
Nodes (5): app, catalyst, ejs, express, path

### Community 44 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, zcatalyst-sdk-node, main, name, version

### Community 45 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, zcatalyst-sdk-node, main, name, version

### Community 46 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, zcatalyst-sdk-node, main, name, version

### Community 47 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, zcatalyst-sdk-node, main, name, version

### Community 48 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, zcatalyst-sdk-node, main, name, version

### Community 49 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, zcatalyst-sdk-node, main, name, version

### Community 50 - "package.json"
Cohesion: 0.33
Nodes (5): dependencies, zcatalyst-sdk-node, main, name, version

### Community 51 - "Web Interface Guidelines"
Cohesion: 0.40
Nodes (4): Guidelines Source, How It Works, Usage, Web Interface Guidelines

### Community 52 - "CopBot.jsx"
Cohesion: 0.50
Nodes (4): CopBot(), crimeData, generateResponse(), suggestions

### Community 53 - "4. Analytical Acceleration: Derived & Aggregate Tables"
Cohesion: 0.40
Nodes (5): 4.1 Daily Station Crime Summary (`DailyUnitCrimeSummary`), 4.2 Offender Co-occurrence Matrix (`OffenderCooccurrence`), 4.3 District Performance Metrics (`DistrictClearanceAggregates`), 4.4 Spatial Heatmap Grid (`SpatialCrimeGrid`), 4. Analytical Acceleration: Derived & Aggregate Tables

### Community 54 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 55 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 56 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 57 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

### Community 58 - "RiskProfiling.jsx"
Cohesion: 0.50
Nodes (3): DISTRICTS, RISK_COLORS, RiskProfiling()

### Community 59 - "WantedMissing.jsx"
Cohesion: 0.50
Nodes (3): statusColors, wantedData, WantedMissing()

### Community 60 - "2. Entity-Relationship Mapping & Hierarchy"
Cohesion: 0.50
Nodes (4): 2.1 Administrative & Geographic Roll-Up, 2.2 Core Case Transactions (Star Schema Core), 2.3 Legal & Categorical Classification, 2. Entity-Relationship Mapping & Hierarchy

## Knowledge Gaps
- **374 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+369 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `SocioEconomicOverlay.jsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `react` connect `SocioEconomicOverlay.jsx` to `dependencies`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `FeaturePipeline` connect `__init__.py` to `deploy.py`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _416 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DataFrame` be split into smaller, more focused modules?**
  _Cohesion score 0.07259528130671507 - nodes in this community are weakly interconnected._
- **Should `__init__.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09574468085106383 - nodes in this community are weakly interconnected._
- **Should `DESIGN.md` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._