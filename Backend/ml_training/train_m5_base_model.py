"""Train the generic XGBoost base demand model from the public M5 dataset.

The resulting model is a generic retail-demand model for cold-start pharmacies.
It learns demand patterns from M5 retail unit-sales histories, not from medicine names.
Real pharmacy sales are used by the runtime for pharmacy-specific training once enough
history exists.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd
from xgboost import XGBRegressor

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "ml_training" / "m5_data"
SALES_PATH = DATA_DIR / "sales_train_validation.csv"
MODEL_PATH = ROOT / "ml_models" / "pharmacy_demand_xgb.json"
META_PATH = ROOT / "ml_models" / "pharmacy_demand_xgb_metadata.json"

SEED = 42
RNG = np.random.default_rng(SEED)
SAMPLE_SERIES = 800
HISTORY_DAYS = 365
VALIDATION_DAYS = 28


def make_features(values: np.ndarray, idx: int) -> list[float]:
    return [
        float(values[idx - 1]),
        float(values[idx - 2]),
        float(values[idx - 3]),
        float(values[max(0, idx - 3):idx].mean()),
        float(values[max(0, idx - 7):idx].mean()),
        float(values[max(0, idx - 14):idx].mean()),
        float(idx % 7),
    ]


def rows_from_series(series: Iterable[np.ndarray], history_days: int) -> tuple[np.ndarray, np.ndarray]:
    X: list[list[float]] = []
    y: list[float] = []
    for values in series:
        values = np.asarray(values, dtype=float)[-history_days:]
        if len(values) < 32:
            continue
        for idx in range(14, len(values)):
            X.append(make_features(values, idx))
            y.append(max(0.0, float(values[idx])))
    return np.asarray(X, dtype=np.float32), np.asarray(y, dtype=np.float32)


def build_model() -> XGBRegressor:
    return XGBRegressor(
        n_estimators=280,
        max_depth=5,
        learning_rate=0.05,
        min_child_weight=3,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="reg:squarederror",
        eval_metric="mae",
        random_state=SEED,
        n_jobs=1,
    )


def main() -> None:
    if not SALES_PATH.exists():
        raise FileNotFoundError(
            f"M5 data not found: {SALES_PATH}. Run download_m5_dataset.py first."
        )

    print("Reading M5 sales data...")
    sales = pd.read_csv(SALES_PATH)
    day_cols = [c for c in sales.columns if c.startswith("d_")]
    if not day_cols:
        raise ValueError("M5 sales file has no d_* columns")

    # Prefer series with meaningful non-zero activity so the base model learns useful demand patterns.
    activity = (sales[day_cols].to_numpy(copy=False) > 0).sum(axis=1)
    candidate_idx = np.flatnonzero(activity >= 30)
    if len(candidate_idx) < SAMPLE_SERIES:
        candidate_idx = np.arange(len(sales))
    chosen = RNG.choice(candidate_idx, size=min(SAMPLE_SERIES, len(candidate_idx)), replace=False)

    selected = sales.iloc[chosen][day_cols].to_numpy(dtype=np.float32)
    selected = selected[:, -HISTORY_DAYS:]

    # Hold out the last 28 days for an honest generic-base validation report.
    train_series = selected[:, :-VALIDATION_DAYS]
    valid_series = selected[:, -VALIDATION_DAYS:]

    X_train, y_train = rows_from_series(train_series, len(train_series[0]))
    print(f"Training rows: {len(y_train):,}")

    model = build_model()
    model.fit(X_train, y_train, verbose=False)

    # Validation is recursive so the metric reflects the way the service forecasts.
    abs_errors: list[float] = []
    squared_errors: list[float] = []
    for history, actual in zip(train_series, valid_series, strict=False):
        work = [float(v) for v in history.tolist()]
        for step in range(VALIDATION_DAYS):
            idx = len(work)
            features = np.asarray([make_features(np.asarray(work, dtype=float), idx)], dtype=np.float32)
            pred = max(0.0, float(model.predict(features)[0]))
            # Keep extreme recursive drift under control.
            recent = work[-7:]
            cap = max(2.0, float(np.mean(recent)) * 4.0) if recent else 2.0
            pred = min(pred, cap)
            target = float(actual[step])
            abs_errors.append(abs(pred - target))
            squared_errors.append((pred - target) ** 2)
            work.append(pred)

    mae = float(np.mean(abs_errors)) if abs_errors else None
    rmse = float(np.sqrt(np.mean(squared_errors))) if squared_errors else None

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save_model(MODEL_PATH)

    metadata = {
        "trainingSource": "M5 Forecasting Accuracy retail unit sales",
        "sourceDescription": "Walmart retail goods; generic demand-pattern pretraining only, not pharmacy data",
        "trainingSeries": int(len(selected)),
        "trainingDaysPerSeries": int(train_series.shape[1]),
        "validationDays": VALIDATION_DAYS,
        "validationMAE": round(mae, 4) if mae is not None else None,
        "validationRMSE": round(rmse, 4) if rmse is not None else None,
        "featureNames": [
            "lag_1",
            "lag_2",
            "lag_3",
            "rolling_mean_3",
            "rolling_mean_7",
            "rolling_mean_14",
            "day_of_week",
        ],
        "seed": SEED,
    }
    META_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print(json.dumps({"model": str(MODEL_PATH), **metadata}, indent=2))


if __name__ == "__main__":
    main()
