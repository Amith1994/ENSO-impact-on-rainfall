import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def safe_pct_departure(actual, normal):
    """
    Computes percentage departure safely.
    Handles division by zero cases.
    """
    if isinstance(actual, (pd.Series, np.ndarray)):
        # Vectorized version
        departure = np.zeros_like(actual, dtype=float)
        # Where normal is not zero
        mask = normal != 0
        departure[mask] = ((actual[mask] - normal[mask]) / normal[mask]) * 100.0
        # Where normal is zero but actual is greater than zero, set to 100.0%
        zero_norm_with_rain = (normal == 0) & (actual > 0)
        departure[zero_norm_with_rain] = 100.0
        return departure
    else:
        # Scalar version
        if normal == 0:
            return 0.0 if actual == 0 else 100.0
        return ((actual - normal) / normal) * 100.0

def compute_district_departures(df, normals, district_name):
    """
    Computes Actual, Normal, and % Departure for Monthly, Weekly, Seasonal, and Annual scales.
    
    Returns:
        dict: DataFrames for monthly, weekly, seasonal, and annual departures.
    """
    # 1. Monthly Departures
    monthly_actual = df.groupby(['Year', 'Month'])['Rainfall'].sum().reset_index()
    # Map normals
    monthly_actual['Normal'] = monthly_actual['Month'].map(normals['monthly'])
    monthly_actual['Departure'] = safe_pct_departure(monthly_actual['Rainfall'].values, monthly_actual['Normal'].values)
    monthly_actual.rename(columns={'Rainfall': 'Actual'}, inplace=True)
    monthly_actual['District'] = district_name
    
    # 2. Weekly Departures
    weekly_actual = df.groupby(['Year', 'SMW'])['Rainfall'].sum().reset_index()
    weekly_actual['Normal'] = weekly_actual['SMW'].map(normals['weekly'])
    weekly_actual['Departure'] = safe_pct_departure(weekly_actual['Rainfall'].values, weekly_actual['Normal'].values)
    weekly_actual.rename(columns={'Rainfall': 'Actual'}, inplace=True)
    weekly_actual['District'] = district_name
    
    # 3. Seasonal Departures
    # Southwest Monsoon (months 6,7,8,9)
    sw_actual = df[df['Month'].isin([6, 7, 8, 9])].groupby('Year')['Rainfall'].sum().reset_index()
    sw_actual['Season'] = 'SW Monsoon'
    sw_actual['Normal'] = normals['seasonal']['SW']
    sw_actual['Departure'] = safe_pct_departure(sw_actual['Rainfall'].values, sw_actual['Normal'].values)
    sw_actual.rename(columns={'Rainfall': 'Actual'}, inplace=True)
    
    # Northeast Monsoon (months 10,11,12)
    ne_actual = df[df['Month'].isin([10, 11, 12])].groupby('Year')['Rainfall'].sum().reset_index()
    ne_actual['Season'] = 'NE Monsoon'
    ne_actual['Normal'] = normals['seasonal']['NE']
    ne_actual['Departure'] = safe_pct_departure(ne_actual['Rainfall'].values, ne_actual['Normal'].values)
    ne_actual.rename(columns={'Rainfall': 'Actual'}, inplace=True)
    
    seasonal_df = pd.concat([sw_actual, ne_actual], ignore_index=True)
    seasonal_df['District'] = district_name
    
    # 4. Annual Departures
    annual_actual = df.groupby('Year')['Rainfall'].sum().reset_index()
    annual_actual['Normal'] = normals['annual']
    annual_actual['Departure'] = safe_pct_departure(annual_actual['Rainfall'].values, annual_actual['Normal'].values)
    annual_actual.rename(columns={'Rainfall': 'Actual'}, inplace=True)
    annual_actual['District'] = district_name
    
    return {
        'monthly': monthly_actual[['District', 'Year', 'Month', 'Actual', 'Normal', 'Departure']],
        'weekly': weekly_actual[['District', 'Year', 'SMW', 'Actual', 'Normal', 'Departure']],
        'seasonal': seasonal_df[['District', 'Year', 'Season', 'Actual', 'Normal', 'Departure']],
        'annual': annual_actual[['District', 'Year', 'Actual', 'Normal', 'Departure']]
    }
