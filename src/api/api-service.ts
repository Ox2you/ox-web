
interface HeatmapParams {
  lat: number;
  lng: number;
  date: string;
  pollutant: string;
  radius_km: number;
}

interface FeatureProperties {
  value: number;
  pollutant: string;
  radius_km: number;
  color: string;
  band: string;
  unit: string;
}

interface HeatmapResponse {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: FeatureProperties;
  }[];
  properties: {
    pollutant: string;
    radius_km: number;
  };
}

export const fetchHeatmapData = async ({
  lat,
  lng,
  date,
  pollutant,
  radius_km,
}: HeatmapParams): Promise<HeatmapResponse> => {
  const url = `https://ox2you-api.onrender.com/api/geo/heatmap?lat=${lat}&lon=${lng}&date=${date}&pollutant=${pollutant}&radius_km=${radius_km}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data: HeatmapResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    throw error;
  }
};