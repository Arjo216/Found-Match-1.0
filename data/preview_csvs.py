#import pandas as pd
# preview_csvs.py
import pandas as pd
from pathlib import Path
import sys
import csv

cand1 = Path("data")
cand2 = Path(".")
if cand1.exists() and any(cand1.glob("*.csv")):
    data_dir = cand1
elif any(cand2.glob("*.csv")):
    data_dir = cand2
else:
    print("ERROR: data directory not found. Put your CSVs in ./data or run script from folder where CSVs exist.")
    sys.exit(1)

print("Using data directory:", data_dir.resolve())

def sniff_sep(path):
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        sample = fh.read(8192)
        try:
            return csv.Sniffer().sniff(sample).delimiter
        except Exception:
            # fallback guesses
            if "\t" in sample:
                return "\t"
            if ";" in sample:
                return ";"
            return ","

for f in sorted(data_dir.glob("*.csv")):
    print("=== ", f.name)
    sep = sniff_sep(f)
    print("  Detected separator:", repr(sep))
    try:
        df = pd.read_csv(f, nrows=5, sep=sep, encoding='utf-8', engine='python')
    except Exception as e:
        print("  Failed with utf-8 or engine; trying latin-1:", e)
        df = pd.read_csv(f, nrows=5, sep=sep, encoding='latin-1', engine='python')
    print("  Columns:", df.columns.tolist())
    print("  Preview:")
    print(df.head(3).to_string(index=False))
    print()


# If investments file is tab-separated:
inv = pd.read_csv("data/startup_investments.csv", sep="\t", engine="python", encoding="utf-8")
print(inv.columns)
print(inv.head())

# startups (likely comma-separated or intelligently parsed)
start = pd.read_csv("data/startup_pitches.csv", engine="python", encoding='utf-8')
print(start.columns)
print(start.head())
