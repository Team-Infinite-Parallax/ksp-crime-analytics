"""
Karnataka Police — ML Package Init
====================================
Exports all public classes and functions for use by Catalyst Functions
and the QuickML integration layer.
"""

from .feature_engineering import (
    CatalystDataLoader,
    FeaturePipeline,
    SpatialFeatureTransformer,
    TemporalFeatureTransformer,
    CaseFeatureTransformer,
    AccusedFeatureTransformer,
    DistrictRiskFeatureTransformer,
    MOTextFeatureTransformer,
)

from .models import (
    HotspotPredictor,
    DistrictRiskScorer,
    TrendForecaster,
    AnomalyDetector,
    CaseOutcomePredictor,
    ExplainabilityWrapper,
    train_and_save_all,
    run_inference,
)

from .quickml_integration import (
    CatalystQuickML,
    QUICKML_DATASETS,
    run_quickml_pipeline,
)

__version__ = "1.0.0"
__all__ = [
    # Feature Engineering
    "CatalystDataLoader",
    "FeaturePipeline",
    "SpatialFeatureTransformer",
    "TemporalFeatureTransformer",
    "CaseFeatureTransformer",
    "AccusedFeatureTransformer",
    "DistrictRiskFeatureTransformer",
    "MOTextFeatureTransformer",
    # Models
    "HotspotPredictor",
    "DistrictRiskScorer",
    "TrendForecaster",
    "AnomalyDetector",
    "CaseOutcomePredictor",
    "ExplainabilityWrapper",
    "train_and_save_all",
    "run_inference",
    # QuickML
    "CatalystQuickML",
    "QUICKML_DATASETS",
    "run_quickml_pipeline",
]
