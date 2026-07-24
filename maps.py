import os
import geopandas as gpd
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import logging
from graphs import save_publication_plot

logger = logging.getLogger(__name__)

# District mapping from Excel name (keys) to GeoJSON name (values)
DISTRICT_MAPPING = {
    'Ballari': 'Bellary',
    'Belagavi': 'Belgaum',
    'Bengaluru Rural': 'Bangalore Rural',
    'Bengaluru Urban': 'Bangalore',
    'Bidar': 'Bidar',
    'Chamarajanagar': 'Chamrajnagar',
    'Chikkamagaluru': 'Chikmagalur',
    'Chitradurga': 'Chitradurga',
    'Dakshina Kannada': 'Dakshina Kannada',
    'Davangere': 'Davanagere',
    'Dharwad': 'Dharwad',
    'Gadag': 'Gadag',
    'Hassan': 'Hassan',
    'Haveri': 'Haveri',
    'Kalaburagi': 'Gulbarga',
    'Kodagu': 'Kodagu',
    'Kolar': 'Kolar',
    'Koppal': 'Koppal',
    'Mandya': 'Mandya',
    'Mysuru': 'Mysore',
    'Raichur': 'Raichur',
    'Shivamogga': 'Shimoga',
    'Tumakuru': 'Tumkur',
    'Udupi': 'Udupi',
    'Uttara Kannada': 'Uttara Kannada',
    'Vijayapura': 'Bijapur'
}

def load_geojson(geojson_path='karnataka_districts.geojson'):
    """
    Loads district GeoJSON file.
    """
    if not os.path.exists(geojson_path):
        logger.error(f"GeoJSON boundary file not found at: {geojson_path}")
        return None
    try:
        gdf = gpd.read_file(geojson_path)
        return gdf
    except Exception as e:
        logger.error(f"Error loading GeoJSON file: {e}")
        return None

def generate_spatial_map(gdf, data_df, val_col, title, label, output_path, cmap='RdBu', center=0.0):
    """
    Merges data_df with gdf and plots a thematic map.
    """
    if gdf is None:
        return
        
    # Map district names to match GeoJSON
    plot_df = data_df.copy()
    plot_df['mapped_name'] = plot_df['District'].map(DISTRICT_MAPPING)
    
    # Merge with GeoJSON
    merged_gdf = gdf.merge(plot_df, left_on='district', right_on='mapped_name', how='left')
    
    fig, ax = plt.subplots(figsize=(9, 11))
    
    # Calculate sensible color limits centered around zero if needed
    val_max = merged_gdf[val_col].max()
    val_min = merged_gdf[val_col].min()
    
    if center is not None:
        limit = max(abs(val_max) if not pd.isna(val_max) else 10.0, 
                    abs(val_min) if not pd.isna(val_min) else 10.0)
        # Avoid division by zero/same limits
        if limit == 0:
            limit = 10.0
        vmin, vmax = -limit, limit
    else:
        vmin, vmax = val_min, val_max
        
    # Plot boundaries
    merged_gdf.plot(
        column=val_col,
        ax=ax,
        legend=True,
        cmap=cmap,
        vmin=vmin,
        vmax=vmax,
        missing_kwds={'color': '#f0f0f0', 'label': 'No Data'},
        edgecolor='#666666',
        linewidth=0.5,
        legend_kwds={'label': label, 'orientation': 'horizontal', 'pad': 0.05, 'shrink': 0.8}
    )
    
    # Add district names at centroids
    for idx, row in merged_gdf.iterrows():
        # Get centroid
        centroid = row['geometry'].centroid
        name = row['district']
        
        # Don't show NaN values
        val = row[val_col]
        if not pd.isna(val):
            # Shorten long names
            disp_name = name
            if name == 'Bangalore Rural':
                disp_name = 'Blr R.'
            elif name == 'Bangalore':
                disp_name = 'Blr U.'
            elif name == 'Dakshina Kannada':
                disp_name = 'D. Kannada'
            elif name == 'Uttara Kannada':
                disp_name = 'U. Kannada'
                
            ax.text(
                centroid.x, centroid.y, 
                f"{disp_name}\n({val:+.1f}%)", 
                fontsize=7, 
                ha='center', 
                va='center',
                weight='bold',
                color='black',
                bbox=dict(facecolor='white', alpha=0.6, edgecolor='none', pad=1)
            )
            
    ax.set_title(title, fontsize=14, weight='bold', pad=15)
    ax.axis('off')
    
    plt.tight_layout()
    save_publication_plot(fig, output_path)
    plt.close(fig)

def generate_all_spatial_maps(seasonal_summary, monthly_summary, annual_summary, output_dir):
    """
    Generates all requested spatial anomaly maps.
    """
    logger.info("Generating spatial maps...")
    gdf = load_geojson()
    if gdf is None:
        logger.warning("Skipping spatial map generation due to missing GeoJSON boundary file.")
        return
        
    os.makedirs(os.path.join(output_dir, 'Maps'), exist_ok=True)
    
    # 1. SW Monsoon Mean Departure Map
    sw_df = seasonal_summary[seasonal_summary['Season'] == 'SW Monsoon'].groupby('District')['Departure'].mean().reset_index()
    generate_spatial_map(
        gdf, sw_df, 'Departure',
        title="Southwest Monsoon (SW) Mean Rainfall Departure (%)",
        label="Departure (%)",
        output_path=os.path.join(output_dir, 'Maps', 'sw_monsoon_mean_departure'),
        cmap='RdBu'
    )
    
    # 2. NE Monsoon Mean Departure Map
    ne_df = seasonal_summary[seasonal_summary['Season'] == 'NE Monsoon'].groupby('District')['Departure'].mean().reset_index()
    generate_spatial_map(
        gdf, ne_df, 'Departure',
        title="Northeast Monsoon (NE) Mean Rainfall Departure (%)",
        label="Departure (%)",
        output_path=os.path.join(output_dir, 'Maps', 'ne_monsoon_mean_departure'),
        cmap='RdBu'
    )
    
    # 3. ENSO Phase-wise Anomaly Maps (for SW Monsoon)
    # Generate maps for El Niño - Positive and La Niña - Negative as exemplars
    for phase in ['El Niño - Positive', 'La Niña - Negative', 'Neutral - Neutral']:
        phase_df = seasonal_summary[(seasonal_summary['Season'] == 'SW Monsoon') & (seasonal_summary['ENSO_Phase'] == phase)]
        if not phase_df.empty:
            clean_phase_name = phase.replace(' ', '_').replace('ñ', 'n')
            generate_spatial_map(
                gdf, phase_df, 'Departure',
                title=f"SW Monsoon Departure (%) - {phase} Phase",
                label="Departure (%)",
                output_path=os.path.join(output_dir, 'Maps', f"sw_monsoon_departure_{clean_phase_name}"),
                cmap='RdBu'
            )
            
    # 4. Monthly Anomaly Maps (e.g. for July)
    july_df = monthly_summary[monthly_summary['Month'] == 7].groupby('District')['Departure'].mean().reset_index()
    generate_spatial_map(
        gdf, july_df, 'Departure',
        title="July Average Rainfall Departure (%)",
        label="Departure (%)",
        output_path=os.path.join(output_dir, 'Maps', 'july_average_departure'),
        cmap='RdBu'
    )
    
    # 5. Annual Mean Deviation Map
    ann_df = annual_summary.groupby('District')['Departure'].mean().reset_index()
    generate_spatial_map(
        gdf, ann_df, 'Departure',
        title="Annual Average Rainfall Departure (%)",
        label="Departure (%)",
        output_path=os.path.join(output_dir, 'Maps', 'annual_mean_departure'),
        cmap='RdBu'
    )
    
    logger.info("Spatial maps generated successfully.")
