import pandas as pd
import logging

logger = logging.getLogger(__name__)

def process_weekly_enso_summary(weekly_df, enso_map):
    """
    Aligns weekly rainfall data with ENSO categories and computes statistics
    for each District, SMW, and ENSO Phase.
    """
    logger.info("Processing weekly ENSO phase-wise summary")
    df = weekly_df.copy()
    df['ENSO_Phase'] = df['Year'].map(enso_map)
    
    # Ensure ENSO_Phase is present
    if df['ENSO_Phase'].isnull().any():
        df['ENSO_Phase'] = df['ENSO_Phase'].fillna('Neutral - Neutral')
        
    group_cols = ['District', 'SMW', 'ENSO_Phase']
    
    summary = df.groupby(group_cols).agg(
        Mean=('Actual', 'mean'),
        Median=('Actual', 'median'),
        SD=('Actual', 'std'),
        Max=('Actual', 'max'),
        Min=('Actual', 'min'),
        Departure=('Departure', 'mean')
    ).reset_index()
    
    # Calculate Coefficient of Variation (CV = SD/Mean * 100)
    summary['CV'] = (summary['SD'] / summary['Mean']) * 100.0
    summary['SD'] = summary['SD'].fillna(0.0)
    summary['CV'] = summary['CV'].fillna(0.0)
    
    cols = ['District', 'SMW', 'ENSO_Phase', 'Mean', 'Median', 'SD', 'CV', 'Max', 'Min', 'Departure']
    return summary[cols]
