import pandas as pd
import logging

logger = logging.getLogger(__name__)

def process_seasonal_enso_summary(seasonal_df, enso_map):
    """
    Aligns seasonal rainfall data with ENSO categories and computes statistics
    for each District, Season, and ENSO Phase.
    """
    logger.info("Processing seasonal ENSO phase-wise summary")
    df = seasonal_df.copy()
    df['ENSO_Phase'] = df['Year'].map(enso_map)
    
    if df['ENSO_Phase'].isnull().any():
        df['ENSO_Phase'] = df['ENSO_Phase'].fillna('Neutral - Neutral')
        
    group_cols = ['District', 'Season', 'ENSO_Phase']
    
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
    
    cols = ['District', 'Season', 'ENSO_Phase', 'Mean', 'Median', 'SD', 'CV', 'Max', 'Min', 'Departure']
    return summary[cols]

def process_annual_enso_summary(annual_df, enso_map):
    """
    Aligns annual rainfall data with ENSO categories and computes statistics
    for each District and ENSO Phase.
    """
    logger.info("Processing annual ENSO phase-wise summary")
    df = annual_df.copy()
    df['ENSO_Phase'] = df['Year'].map(enso_map)
    
    if df['ENSO_Phase'].isnull().any():
        df['ENSO_Phase'] = df['ENSO_Phase'].fillna('Neutral - Neutral')
        
    group_cols = ['District', 'ENSO_Phase']
    
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
    
    cols = ['District', 'ENSO_Phase', 'Mean', 'Median', 'SD', 'CV', 'Max', 'Min', 'Departure']
    return summary[cols]
