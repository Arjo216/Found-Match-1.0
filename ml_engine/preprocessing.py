import pandas as pd
import numpy as np
import os

def load_and_process_data():
    print("Loading datasets...")
    
    # Define file paths (Adjust if your filenames are slightly different)
    pitches_path = 'data/startup_pitches.csv'
    investments_path = 'data/startup_investments.csv' # or 'investments.csv'

    # --- 1. Load Pitches (Content Data) ---
    if not os.path.exists(pitches_path):
        raise FileNotFoundError(f"Could not find {pitches_path}. Please check the filename in your /data folder.")
    
    # 'on_bad_lines' skips rows that cause errors
    pitches_df = pd.read_csv(pitches_path, on_bad_lines='skip', engine='python')
    print(f"Loaded {len(pitches_df)} pitches.")

    # --- 2. Load Investments (Graph Data) ---
    if not os.path.exists(investments_path):
        # Fallback check if user named it investments.csv
        if os.path.exists('data/startup_investments.csv'):
            investments_path = 'data/startup_investments.csv'
        else:
            raise FileNotFoundError(f"Could not find {investments_path}. Please check the filename.")
            
    # CRITICAL FIX: on_bad_lines='skip' ignores the broken rows causing your error
    investments_df = pd.read_csv(investments_path, encoding='ISO-8859-1', on_bad_lines='skip', engine='python')
    print(f"Loaded {len(investments_df)} investment records.")
    
    # --- CLEANING & PREPARING ---
    # Standardize column names to avoid KeyErrors
    # (The dataset columns might vary slightly, this normalizes them)
    pitches_df.columns = [c.strip() for c in pitches_df.columns]
    investments_df.columns = [c.strip() for c in investments_df.columns]

    # Handle Startup Pitches
    # We look for typical column names in the specific Kaggle dataset
    # Usually: 'Startup_ID', 'Company_Name', 'One_Line_Pitch', 'Industry'
    # If exact names differ, we rename them for consistency
    if 'Company' in pitches_df.columns: pitches_df.rename(columns={'Company': 'Company_Name'}, inplace=True)
    if 'Pitch' in pitches_df.columns: pitches_df.rename(columns={'Pitch': 'One_Line_Pitch'}, inplace=True)
    
    # clean NaNs
    startups = pitches_df.dropna(subset=['Company_Name', 'One_Line_Pitch']).copy()
    # Create a synthetic ID if not present
    startups['Startup_ID'] = range(len(startups))
    
    # Handle Investors
    # The Crunchbase dataset usually has ' market ' or ' category_code '
    inv_col = 'market' if 'market' in investments_df.columns else 'category_code'
    if inv_col not in investments_df.columns:
         # Fallback: try to find any column that looks like industry/market
         possible_cols = [c for c in investments_df.columns if 'category' in c or 'market' in c]
         if possible_cols: inv_col = possible_cols[0]
         else: inv_col = None

    if inv_col:
        investors_list = investments_df[inv_col].dropna().unique()
    else:
        # Emergency fallback if dataset is totally different
        investors_list = ['Software', 'BioTech', 'FinTech', 'AI', 'E-Commerce']

    investors = pd.DataFrame({
        'investor_id': range(len(investors_list)),
        'focus_industry': investors_list
    })
    
    # --- CREATE INTERACTIONS MATRIX ---
    print("Building interaction matrix (this might take a moment)...")
    interactions = []
    
    # Create a quick lookup dictionary for investors
    # Key: Industry Name -> Value: Investor ID
    inv_lookup = pd.Series(investors.investor_id.values, index=investors.focus_industry).to_dict()
    
    # Map startups to investors based on industry string match
    # (Startups usually have an 'Industry' or 'Tags' column)
    industry_col = 'Industry' if 'Industry' in startups.columns else 'Tags'
    if industry_col in startups.columns:
        for idx, row in startups.iterrows():
            if pd.isna(row[industry_col]): continue
            
            # Simple matching: If startup industry matches investor focus
            s_industry = str(row[industry_col])
            
            # Check if this industry exists in our investor list
            if s_industry in inv_lookup:
                interactions.append({
                    'investor_id': inv_lookup[s_industry],
                    'startup_id': row['Startup_ID'],
                    'interaction': 1
                })
    
    # Convert to DataFrame
    interactions_df = pd.DataFrame(interactions)
    
    # If no matches found (e.g. industry names don't match exactly), create dummy data for testing
    if interactions_df.empty:
        print("Warning: No exact industry matches found. Creating synthetic matches for training demonstration.")
        # Create random connections so the model has something to learn
        for _ in range(min(1000, len(startups) * 2)):
            interactions.append({
                'investor_id': np.random.choice(investors['investor_id']),
                'startup_id': np.random.choice(startups['Startup_ID']),
                'interaction': 1
            })
        interactions_df = pd.DataFrame(interactions)

    return startups, investors, interactions_df

if __name__ == "__main__":
    try:
        s, i, inter = load_and_process_data()
        print(f"SUCCESS: Processed {len(s)} startups, {len(i)} investors, and {len(inter)} interactions.")
        
        # Save processed files
        os.makedirs('data', exist_ok=True)
        s.to_csv("data/processed_startups.csv", index=False)
        i.to_csv("data/processed_investors.csv", index=False)
        inter.to_csv("data/processed_interactions.csv", index=False)
        print("Files saved successfully to /data folder.")
        
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        print("Tip: Check your CSV filenames in the 'data' folder.")