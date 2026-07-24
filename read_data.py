import os
import re
import logging
import pandas as pd

logger = logging.getLogger(__name__)

def load_enso_classification(file_path='ENSO.txt'):
    """
    Reads ENSO classification file (Year, Category).
    Returns a dictionary mapping Year (int) -> Category (str).
    """
    logger.info(f"Loading ENSO classifications from {file_path}")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"ENSO classification file not found at: {file_path}")
    
    # Read the file
    df = pd.read_csv(file_path)
    # Ensure columns are stripped and correct
    df.columns = [c.strip() for c in df.columns]
    
    # Map Year to Category
    enso_map = {}
    for _, row in df.iterrows():
        year = int(row['Year'])
        cat = str(row['Category']).strip()
        enso_map[year] = cat
        
    return enso_map

def load_district_data(file_path):
    """
    Loads and validates daily weather data for a single district.
    Renames 'Rainfall(mm)' to 'Rainfall' for consistency.
    """
    logger.info(f"Loading district data from: {file_path}")
    district_name = os.path.splitext(os.path.basename(file_path))[0]
    # Clean up name if it has parentheses, e.g. "Ballari (Bellary)" -> "Ballari", but preserving trailing parts like "Bengaluru (Bangalore) Rural" -> "Bengaluru Rural"
    district_name = re.sub(r'\s*\([^)]*\)\s*', ' ', district_name).strip()
        
    try:
        df = pd.read_excel(file_path)
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}")
        return district_name, None
        
    # Validation of required columns
    required_cols = ['Date', 'Year', 'Month', 'Day', 'SMW', 'Rainfall(mm)']
    # Support both 'Rainfall(mm)' and 'Rainfall'
    if 'Rainfall' in df.columns and 'Rainfall(mm)' not in df.columns:
        df = df.rename(columns={'Rainfall': 'Rainfall(mm)'})
        
    for col in required_cols:
        if col not in df.columns:
            logger.error(f"Missing required column '{col}' in {file_path}")
            return district_name, None
            
    # Process and clean data
    df['Date'] = pd.to_datetime(df['Date'])
    df['Year'] = df['Year'].astype(int)
    df['Month'] = df['Month'].astype(int)
    df['Day'] = df['Day'].astype(int)
    df['SMW'] = df['SMW'].astype(int)
    df['Rainfall'] = df['Rainfall(mm)'].astype(float)
    
    # Handle missing values
    if df['Rainfall'].isnull().any():
        num_missing = df['Rainfall'].isnull().sum()
        logger.warning(f"{district_name}: Found {num_missing} missing values in Rainfall. Filling with 0.0.")
        df['Rainfall'] = df['Rainfall'].fillna(0.0)
        
    # Validate negative rainfall
    if (df['Rainfall'] < 0).any():
        num_negative = (df['Rainfall'] < 0).sum()
        logger.warning(f"{district_name}: Found {num_negative} negative rainfall values. Setting to 0.0.")
        df.loc[df['Rainfall'] < 0, 'Rainfall'] = 0.0
        
    # Return cleaned DataFrame with standard columns
    clean_cols = ['Date', 'Year', 'Month', 'Day', 'SMW', 'Rainfall']
    # Keep extra columns like temperature if needed
    for col in df.columns:
        if col not in clean_cols:
            clean_cols.append(col)
            
    return district_name, df[clean_cols]

def get_all_district_files(directory='Karnataka'):
    """
    Returns list of paths to all district xlsx files.
    Skips control files or summary files.
    """
    files = []
    if not os.path.exists(directory):
        raise FileNotFoundError(f"Rainfall directory not found: {directory}")
        
    for f in os.listdir(directory):
        if f.endswith('.xlsx') and not f.startswith('Karnataka_') and not f.startswith('weather_'):
            files.append(os.path.join(directory, f))
            
    return sorted(files)
