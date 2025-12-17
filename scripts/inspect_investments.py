# scripts/inspect_investments.py
import pandas as pd
from pathlib import Path

p = Path("data/startup_investments.csv")
if not p.exists():
    print("File not found:", p)
    raise SystemExit(1)

print("Reading sample (first 20 rows) - this may use fallback encoding if needed.")
df = pd.read_csv(p, sep=None, engine="python", nrows=20)   # python engine auto-detects sep
print("Columns:", df.columns.tolist())
print("\nFirst 20 rows (showing as table):")
print(df.head(20).to_string(index=False))
print("\nData types:")
print(df.dtypes)