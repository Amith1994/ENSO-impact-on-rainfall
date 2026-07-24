import pandas as pd
import logging

logger = logging.getLogger(__name__)

def compute_district_normals(df):
    """
    Computes rainfall normals (Monthly, Weekly, Seasonal, Annual) 
    for a district using the entire timeseries.
    
    Returns:
        dict: containing monthly, weekly, seasonal, and annual normals.
    """
    # 1. Monthly Normals (mean of annual monthly totals)
    monthly_annual_totals = df.groupby(['Year', 'Month'])['Rainfall'].sum().reset_index()
    monthly_normals = monthly_annual_totals.groupby('Month')['Rainfall'].mean()
    
    # 2. Weekly Normals (mean of annual weekly totals)
    # Ensure weeks are 1 to 52 (some files might have week 53, keep it or handle it)
    weekly_annual_totals = df.groupby(['Year', 'SMW'])['Rainfall'].sum().reset_index()
    weekly_normals = weekly_annual_totals.groupby('SMW')['Rainfall'].mean()
    
    # 3. Seasonal Normals
    # SW Monsoon: June, July, August, September (Months 6, 7, 8, 9)
    sw_annual = df[df['Month'].isin([6, 7, 8, 9])].groupby('Year')['Rainfall'].sum()
    # Handle years where there is no SW monsoon records (shouldn't happen, but good to have default)
    sw_normal = sw_annual.mean() if not sw_annual.empty else 0.0
    
    # NE Monsoon: October, November, December (Months 10, 11, 12)
    ne_annual = df[df['Month'].isin([10, 11, 12])].groupby('Year')['Rainfall'].sum()
    ne_normal = ne_annual.mean() if not ne_annual.empty else 0.0
    
    # 4. Annual Normal
    annual_totals = df.groupby('Year')['Rainfall'].sum()
    annual_normal = annual_totals.mean() if not annual_totals.empty else 0.0
    
    return {
        'monthly': monthly_normals,
        'weekly': weekly_normals,
        'seasonal': {'SW': sw_normal, 'NE': ne_normal},
        'annual': annual_normal
    }
