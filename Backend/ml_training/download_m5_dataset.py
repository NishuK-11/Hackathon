"""Download the public M5 Forecasting dataset used for the pharmacy base model.

The M5 competition data contains daily unit sales for retail products sold across stores.
It is used only as a generic demand-pattern pre-training source. It is NOT pharmacy data.
Real pharmacy orders are still used later for pharmacy-specific training.
"""
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "m5_data"
ZIP_PATH = DATA_DIR / "m5.zip"
URL = "https://github.com/Nixtla/m5-forecasts/raw/main/datasets/m5.zip"


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    train_file = DATA_DIR / "sales_train_validation.csv"
    calendar_file = DATA_DIR / "calendar.csv"

    if train_file.exists() and calendar_file.exists():
        print(f"M5 dataset already present: {DATA_DIR}")
        return

    print("Downloading M5 dataset (~450 MB archive)...")
    print(URL)
    urllib.request.urlretrieve(URL, ZIP_PATH)

    print("Extracting M5 sales/calendar files...")
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        wanted = {"sales_train_validation.csv", "calendar.csv"}
        available = set(zf.namelist())
        for name in wanted:
            if name not in available:
                raise FileNotFoundError(f"{name} not found in M5 archive")
            zf.extract(name, DATA_DIR)

    ZIP_PATH.unlink(missing_ok=True)
    print(f"Done. Training data is in: {DATA_DIR}")


if __name__ == "__main__":
    main()
