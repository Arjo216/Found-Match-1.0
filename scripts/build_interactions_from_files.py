# scripts/build_interactions_from_files.py
import pandas as pd
from pathlib import Path
import re
import json

ROOT = Path(".")
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

pitches_path = DATA_DIR / "startup_pitches.csv"
investments_path = DATA_DIR / "startup_investments.csv"

def normalise_colnames(df: pd.DataFrame) -> pd.DataFrame:
    # trim whitespace in column names and replace repeated spaces with single underscore
    df = df.rename(columns={c: re.sub(r"\s+", "_", c.strip()) for c in df.columns})
    return df

def normalise_text(s):
    if pd.isna(s):
        return ""
    return re.sub(r"\s+", " ", str(s)).strip()

def extract_markets_from_category_list(catstr):
    # category_list is often pipe or comma separated like: "|Software|AI|"
    if not isinstance(catstr, str):
        return []
    # remove leading/trailing pipes and split on | or , or ;
    s = catstr.strip()
    # common separators
    parts = re.split(r"[|,;]+", s)
    parts = [p.strip() for p in parts if p and p.strip() and p.strip() not in ("|",)]
    return parts

def main():
    print("ML preprocessor: building processed CSVs from startup_pitches.csv and startup_investments.csv")
    # 1) Load startups (pitches)
    if not pitches_path.exists():
        print("ERROR: startup_pitches.csv not found at", pitches_path)
        raise SystemExit(1)
    if not investments_path.exists():
        print("ERROR: startup_investments.csv not found at", investments_path)
        raise SystemExit(1)

    # Read with flexible engine + detect separators
    try:
        pitches = pd.read_csv(pitches_path, engine="python", sep=None)
    except Exception:
        pitches = pd.read_csv(pitches_path, encoding="utf-8", low_memory=False)

    try:
        invs = pd.read_csv(investments_path, engine="python", sep=None)
    except Exception:
        invs = pd.read_csv(investments_path, encoding="utf-8", low_memory=False)

    pitches = normalise_colnames(pitches)
    invs = normalise_colnames(invs)

    # Try to find canonical startup id/name/industry columns in pitches
    # Accept common names: Startup_ID, startup_id, id, Company_Name, company_name, name, Industry, industry
    print("Pitches columns:", list(pitches.columns))
    print("Investments columns:", list(invs.columns))

    # Find startup id column
    id_cols = [c for c in pitches.columns if c.lower() in ("startup_id", "id")]
    name_cols = [c for c in pitches.columns if "name" in c.lower()]
    industry_cols = [c for c in pitches.columns if "industry" in c.lower()]
    pitch_cols = [c for c in pitches.columns if "one_line" in c.lower() or "pitch" in c.lower()]

    if not id_cols:
        # fallback: create numeric id
        pitches["startup_id"] = range(1, len(pitches) + 1)
    else:
        pitches = pitches.rename(columns={id_cols[0]: "startup_id"})

    if name_cols:
        pitches = pitches.rename(columns={name_cols[0]: "company_name"})
    else:
        pitches["company_name"] = pitches.get("company", "").astype(str)

    if industry_cols:
        pitches = pitches.rename(columns={industry_cols[0]: "industry"})
    else:
        pitches["industry"] = ""

    if pitch_cols:
        pitches = pitches.rename(columns={pitch_cols[0]: "one_line_pitch"})
    else:
        pitches["one_line_pitch"] = ""

    # Normalise values
    pitches["company_name_norm"] = pitches["company_name"].astype(str).str.lower().str.replace(r"[^\w\s]", "", regex=True).str.strip()
    pitches["industry_norm"] = pitches["industry"].astype(str).str.lower().str.strip()

    # 2) Parse the investments CSV to build "synthetic investors"
    # Choose a column for market (common in your file: 'market' or 'market_' etc.)
    market_col_candidates = [c for c in invs.columns if "market" in c.lower()]
    cat_col_candidates = [c for c in invs.columns if "category" in c.lower() or "category_list" in c.lower()]

    chosen_market_col = market_col_candidates[0] if market_col_candidates else None
    chosen_cat_col = cat_col_candidates[0] if cat_col_candidates else None

    print("Chosen market column:", chosen_market_col)
    print("Chosen category column:", chosen_cat_col)

    # Normalize the columns (if present)
    if chosen_market_col:
        invs["market_norm"] = invs[chosen_market_col].astype(str).str.strip().str.lower()
    else:
        invs["market_norm"] = ""

    if chosen_cat_col:
        invs["category_list_norm"] = invs[chosen_cat_col].astype(str).apply(extract_markets_from_category_list)
    else:
        invs["category_list_norm"] = invs.get("category_list", "").astype(str).apply(extract_markets_from_category_list)

    # Build a set of focus tokens that will become synthetic investors:
    # We'll combine unique markets + frequent categories
    market_tokens = set([m for m in invs["market_norm"].unique() if m and m != "nan"])
    # flatten categories
    cat_tokens = set()
    for row in invs["category_list_norm"]:
        for v in row:
            cat_tokens.add(v.strip().lower())

    focus_tokens = sorted([t for t in (market_tokens | cat_tokens) if t])
    if not focus_tokens:
        # fallback to a small default list
        focus_tokens = ["saas", "ai", "fintech", "healthcare", "consumer", "marketplace"]
    print("Found focus tokens (investor proxies):", focus_tokens[:30])

    # Create synthetic investors from these tokens
    investors = []
    for i, tok in enumerate(focus_tokens):
        investors.append({
            "investor_id": i,
            "name": f"Investor_{i}_{tok.replace(' ','_')}",
            "focus_industries": tok,
        })
    investors_df = pd.DataFrame(investors)

    # 3) Build interactions by matching startup industry or company tokens
    interactions = []
    for _, s in pitches.iterrows():
        s_ind = normalise_text(s.get("industry", "") or s.get("Industry", "") or "")
        s_ind_norm = s_ind.lower().strip()
        s_name_norm = s.get("company_name_norm", "")

        # For each investor, check if investor focus token appears in startup industry or in category_list
        for _, inv in investors_df.iterrows():
            inv_focus = str(inv["focus_industries"]).lower()
            # match if inv_focus contained in startup industry OR in company name OR in category lists in investments file
            matched = False
            if inv_focus and s_ind_norm and inv_focus in s_ind_norm:
                matched = True
            # also try company name contains token
            if inv_focus and not matched and inv_focus in s_name_norm:
                matched = True

            # Also try to match if any investments rows for this startup (by name) have this token in category_list
            if not matched:
                # try to find rows in 'invs' where name matches current company
                # normalize invs.name similarly
                if "name" in invs.columns:
                    try:
                        rows = invs[invs["name"].astype(str).str.lower().str.replace(r"[^\w\s]","",regex=True).str.contains(s_name_norm[:10], na=False)]
                        # if any such rows and token in their categories or market
                        if not rows.empty:
                            # check category_list_norm or market_norm
                            if any(inv_focus == c for row in rows["category_list_norm"] for c in row):
                                matched = True
                            if any(inv_focus == str(m).lower() for m in rows.get("market_norm", []).values):
                                matched = True
                    except Exception:
                        pass

            if matched:
                interactions.append({
                    "investor_id": int(inv["investor_id"]),
                    "startup_id": int(s.get("startup_id")),
                    "interaction": 1
                })

    interactions_df = pd.DataFrame(interactions)

    # if interactions empty, fall back to simple heuristic: each startup connects to 2 random investors interested in its industry token
    if interactions_df.empty:
        print("WARNING: interactions table empty after mapping heuristics. Falling back to category-based assignment.")
        for _, s in pitches.iterrows():
            s_ind = normalise_text(s.get("industry","")).lower()
            candidates = [inv for inv in investors if inv["focus_industries"] in s_ind or s_ind in inv["focus_industries"]]
            # if none found, pick first two investors
            if not candidates:
                chosen = investors[:2] if len(investors) >= 2 else investors
            else:
                chosen = candidates[:3]
            for ch in chosen:
                interactions.append({
                    "investor_id": int(ch["investor_id"]),
                    "startup_id": int(s.get("startup_id")),
                    "interaction": 1
                })
        interactions_df = pd.DataFrame(interactions)

    # 4) Save processed CSVs
    out_dir = DATA_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    # minimal startups CSV
    startups_out = pitches[["startup_id","company_name","one_line_pitch","industry"]].copy()
    startups_out.to_csv(out_dir / "processed_startups.csv", index=False)
    investors_df.to_csv(out_dir / "processed_investors.csv", index=False)
    interactions_df.to_csv(out_dir / "processed_interactions.csv", index=False)

    print("Saved processed CSVs to", out_dir)
    print("Startups:", len(startups_out), "Investors:", len(investors_df), "Interactions:", len(interactions_df))

if __name__ == "__main__":
    main()
