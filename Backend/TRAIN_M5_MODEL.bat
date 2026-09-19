@echo off
setlocal
cd /d "%~dp0"

python -m pip install -r requirements-ml.txt
python ml_training\download_m5_dataset.py
python ml_training\train_m5_base_model.py

if %errorlevel% neq 0 (
  echo.
  echo M5 training failed. Check the error above.
  pause
  exit /b %errorlevel%
)

echo.
echo M5 XGBoost base model trained successfully.
pause
