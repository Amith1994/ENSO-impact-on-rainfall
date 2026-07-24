import pandas as pd
import logging

logger = logging.getLogger(__name__)

def process_monthly_enso_summary(monthly_df, enso_map):
    """
    Aligns monthly rainfall data with ENSO categories and computes statistics
    for each District, Month, and ENSO Phase.
    """
    logger.info("Processing monthly ENSO phase-wise summary")
    # Make a copy and map Year to ENSO Category
    df = monthly_df.copy()
    df['ENSO_Phase'] = df['Year'].map(enso_map)
    
    # Ensure ENSO_Phase is present
    if df['ENSO_Phase'].isnull().any():
        missing_years = df[df['ENSO_Phase'].isnull()]['Year'].unique()
        logger.warning(f"Some years have no ENSO classification: {missing_years}")
        df['ENSO_Phase'] = df['ENSO_Phase'].fillna('Neutral - Neutral')
        
    # Group by District, Month, and ENSO_Phase
    group_cols = ['District', 'Month', 'ENSO_Phase']
    
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
    
    # Reorder columns
    cols = ['District', 'Month', 'ENSO_Phase', 'Mean', 'Median', 'SD', 'CV', 'Max', 'Min', 'Departure']
    return summary[cols]
