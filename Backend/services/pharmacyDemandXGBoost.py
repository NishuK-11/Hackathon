import json
import sys
from pathlib import Path
from typing import Dict, List, Any

try:
    import numpy as np
    from xgboost import XGBRegressor
except Exception as exc:  # pragma: no cover
    print(json.dumps({"error": f"xgboost_unavailable: {exc}"}))
    sys.exit(2)

FORECAST_DAYS = 7
MIN_NON_ZERO_DAYS = 5
MIN_TOTAL_DEMAND = 8
BASE_MODEL_PATH = Path(__file__).resolve().parents[1] / "ml_models" / "pharmacy_demand_xgb.json"


def make_features(values: List[float], idx: int) -> List[float]:
    l1 = values[idx - 1]
    l2 = values[idx - 2]
    l3 = values[idx - 3]
    prev3 = float(np.mean(values[max(0, idx - 3):idx]))
    prev7 = float(np.mean(values[max(0, idx - 7):idx]))
    prev14 = float(np.mean(values[max(0, idx - 14):idx]))
    dow = idx % 7
    return [l1, l2, l3, prev3, prev7, prev14, dow]


def recursive_forecast(model, values: List[float]) -> List[float]:
    working = [max(0.0, float(v)) for v in values]
    predictions: List[float] = []
    start_idx = len(working)
    for step in range(FORECAST_DAYS):
        idx = start_idx + step
        features = np.asarray([make_features(working, idx)], dtype=float)
        pred = float(model.predict(features)[0])
        recent = working[-7:]
        cap = max(2.0, float(np.mean(recent)) * 4.0) if recent else 2.0
        pred = max(0.0, min(pred, cap))
        pred = round(pred, 1)
        predictions.append(pred)
        working.append(pred)
    return predictions


def train_local(values: List[float]) -> Dict[str, Any]:
    X, y = [], []
    for idx in range(3, len(values)):
        X.append(make_features(values, idx))
        y.append(values[idx])
    model = XGBRegressor(
        n_estimators=180,
        max_depth=3,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=1,
    )
    model.fit(np.asarray(X, dtype=float), np.asarray(y, dtype=float), verbose=False)
    return {"model": model, "label": "XGBoost (pharmacy-trained)"}


def forecast(values: List[float]) -> Dict[str, Any]:
    values = [max(0.0, float(v)) for v in values]
    non_zero_days = sum(1 for v in values if v > 0)
    total_demand = sum(values)

    # Enough real history -> train a pharmacy-specific model.
    if non_zero_days >= MIN_NON_ZERO_DAYS and total_demand >= MIN_TOTAL_DEMAND and len(values) >= 14:
        trained = train_local(values)
        return {
            "useFallback": False,
            "model": trained["label"],
            "predictions": recursive_forecast(trained["model"], values),
            "trainingSource": "real_pharmacy_history",
        }

    # Cold-start path: use the separately trained base XGBoost model when there is
    # at least some observed sales. This lets a new pharmacy use AI without
    # pretending zero-history data is informative.
    if total_demand > 0 and BASE_MODEL_PATH.exists() and len(values) >= 14:
        try:
            base_model = XGBRegressor()
            base_model.load_model(BASE_MODEL_PATH)
            return {
                "useFallback": False,
                "model": "XGBoost (M5 pre-trained base model)",
                "predictions": recursive_forecast(base_model, values),
                "trainingSource": "m5_base_model",
            }
        except Exception as exc:
            return {"useFallback": True, "reason": f"base_model_error: {exc}"}

    return {"useFallback": True, "reason": "insufficient_history"}


def main() -> None:
    payload = json.load(sys.stdin)
    result = {"results": {}}
    for medicine_id, values in payload.get("histories", {}).items():
        try:
            result["results"][medicine_id] = forecast(values)
        except Exception as exc:
            result["results"][medicine_id] = {"useFallback": True, "reason": f"model_error: {exc}"}
    print(json.dumps(result))


if __name__ == "__main__":
    main()
