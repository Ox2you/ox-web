import DefaultLayout from "@/layouts/default";
import { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UserLocation } from "../components/user-location";
import { LocationSearch } from "../components/location-search";
import AirPopup from "../components/air-popup";
import FilterPopup from "../components/filter-popup";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/use-disclosure";
import { fetchHeatmapData } from "../api/api-service";

// Define AirQuality type for consistency
type AirQuality = "good" | "moderate" | "poor";

// Fallback hardcoded points
const airQualityPoints = [
  {
    lat: 51.5074,
    lng: -0.1278,
    color: "#ff0000",
    tooltip: "Air Quality: Poor",
    image: "../src/imagem/triste.png",
    airQuality: "poor" as AirQuality,
  },
  {
    lat: 51.5072,
    lng: -0.1657,
    color: "#00ff00",
    tooltip: "Air Quality: Good",
    image: "../src/imagem/feliz.png",
    airQuality: "good" as AirQuality,
  },
  {
    lat: 51.5055,
    lng: -0.0204,
    color: "#ffff00",
    tooltip: "Air Quality: Moderate",
    image: "../src/imagem/moderada.png",
    airQuality: "moderate" as AirQuality,
  },
];

export default function IndexPage() {
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onOpenChange: onFilterOpenChange } = useDisclosure();
  const { isOpen: isAirPopupOpen, onOpen: onAirPopupOpen, onOpenChange: onAirPopupOpenChange } = useDisclosure();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAirQuality, setSelectedAirQuality] = useState<AirQuality>("moderate");
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = useCallback(
    (location: { lat: number; lng: number } | null, isLoading: boolean) => {
      setUserLocation(location);
      setIsLoading(isLoading);
    },
    []
  );

  useEffect(() => {
    if (!userLocation) {
      console.log("No user location, skipping API call");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHeatmapData({
          lat: userLocation.lat,
          lng: userLocation.lng,
          date: "2025-10-04",
          pollutant: "SO2",
          radius_km: 500,
        });
        console.log("API data fetched:", data);
        setHeatmapData(data.features || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error);
        setError("Failed to load air quality data. Using fallback data.");
        setHeatmapData(airQualityPoints); // Fallback to hardcoded data
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userLocation]);

  useEffect(() => {
    if (!userLocation || isLoading) {
      console.log("Skipping map render: userLocation or isLoading not ready");
      return;
    }

    const map = L.map("map").setView([userLocation.lat, userLocation.lng], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([userLocation.lat, userLocation.lng])
      .addTo(map)
      .bindPopup("You are here!")
      .openPopup();

    const dataToRender = heatmapData.length > 0 ? heatmapData : airQualityPoints;

    if ("geometry" in dataToRender[0]) { // API data
      // Separate points for red circles (poor air quality)
      const circlePoints = dataToRender.filter(item => Math.abs(item.properties.value) >= 0.085 && Math.abs(item.properties.value) <= 0.089);

      // Render red circles for poor air quality (|value| ∈ [0.085, 0.089])
      circlePoints.forEach((item: any) => {
        const { coordinates } = item.geometry;
        const { value, band } = item.properties;
        const normalizedValue = Math.round(value * 100);
        const tooltip = `
          <div style="text-align: center; padding: 8px;">
            <div>Air Quality: Poor</div>
          </div>
        `;

        const circle = L.circle([coordinates[1], coordinates[0]], {
          color: '#FF0000',
          fillColor: '#FF0000',
          fillOpacity: 0.5,
          radius: 10000, // 10 km
          weight: 2,
          opacity: 1
        })
          .addTo(map)
          .bindTooltip(tooltip, {
            permanent: false,
            direction: "auto",
            className: "custom-tooltip",
          });

        circle.on("click", () => {
          console.log(`Clicked circle with quality: poor, value: ${normalizedValue}`);
          setSelectedAirQuality("poor");
          onAirPopupOpen();
        });
      });

      // Render other points as circles
      dataToRender.forEach((item: any) => {
        const { coordinates } = item.geometry;
        const { value, band } = item.properties;
        const normalizedValue = Math.round(value * 100);
        const absValue = Math.abs(value);
        let color: string;
        let airQuality: AirQuality;

        // Skip red circle points to avoid duplication
        if (absValue >= 0.085 && absValue <= 0.089) {
          return;
        }

        // Assign color and air quality based on |value|
        if (absValue >= 0.05 && absValue < 0.085) { // Moderate
          color = '#E7B416';
          airQuality = 'moderate';
        } else if (absValue >= 0.01 && absValue < 0.05) { // Intermediate
          color = '#E7B416';
          airQuality = 'moderate';
        } else { // Good: < 0.01 or > 0.089
          color = '#2DC937';
          airQuality = 'good';
        }

        const tooltip = `
          <div style="text-align: center; padding: 8px;">
            <div>Air Quality: ${airQuality.charAt(0).toUpperCase() + airQuality.slice(1)}</div>
          </div>
        `;

        const circle = L.circle([coordinates[1], coordinates[0]], {
          color,
          fillColor: color,
          fillOpacity: 0.4,
          radius: 10000, // 10 km
          weight: 2,
          opacity: 0.7
        })
          .addTo(map)
          .bindTooltip(tooltip, {
            permanent: false,
            direction: "auto",
            className: "custom-tooltip",
          });

        circle.on("click", () => {
          console.log(`Clicked circle with quality: ${airQuality}, value: ${normalizedValue}`);
          setSelectedAirQuality(airQuality);
          onAirPopupOpen();
        });
      });

      // Add legend to the map
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '6px 8px';
        div.style.border = '2px solid rgba(0,0,0,0.2)';
        div.style.borderRadius = '5px';
        div.innerHTML += '<strong style="color:black">Air Quality Scale</strong><br>';
        div.innerHTML += '<i style="background: #FF0000; width: 18px; height: 18px; display: inline-block; margin-right: 8px; color:black;"></i> <label style="color:black">Poor</label><br>';
        div.innerHTML += '<i style="background: #E7B416; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> <label style="color:black">Moderate</label><br>';
        div.innerHTML += '<i style="background: #2DC937; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> <label style="color:black">Good</label><br>';
        return div;
      };
      legend.addTo(map);

    } else { // Fallback data (circle mode)
      dataToRender.forEach((item: any) => {
        let lat: number, lng: number, color: string, tooltip: string, airQuality: AirQuality;

        lat = item.lat;
        lng = item.lng;
        color = item.color;
        tooltip = item.image
          ? `<div style="text-align: center; padding: 8px;">
               <img src="${item.image}" alt="Air quality icon" style="width: 32px; height: 32px; display: block; margin: 0 auto 8px;" />
               <div>${item.tooltip}</div>
             </div>`
          : item.tooltip;
        airQuality = item.airQuality;

        const circle = L.circle([lat, lng], {
          color,
          fillColor: color,
          fillOpacity: 0.4,
          radius: 10000, // 10 km
          weight: 2,
          opacity: 0.7
        })
          .addTo(map)
          .bindTooltip(tooltip, {
            permanent: false,
            direction: "auto",
            className: "custom-tooltip",
          });

        circle.on("click", () => {
          console.log(`Clicked circle with quality: ${airQuality}`);
          setSelectedAirQuality(airQuality);
          onAirPopupOpen();
        });
      });
    }

    return () => {
      map.remove();
    };
  }, [userLocation, isLoading, heatmapData, onAirPopupOpen]);

  return (
    <DefaultLayout>
      <UserLocation onLocationChange={handleLocationChange} />
      <section className="flex flex-col items-center justify-center gap-4">
        <LocationSearch
          onLocationChange={(location) => {
            if (location) {
              setUserLocation(location);
              setIsLoading(true);
            }
          }}
        />
        <FilterPopup isOpen={isFilterOpen} onOpenChange={onFilterOpenChange} />
        {error && (
          <div className="text-red-500 text-center">
            {error}
          </div>
        )}
        {isLoading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: "400px", width: "100%" }}
          >
            <img src="/vento.gif" alt="Loading" style={{ maxWidth: "100px" }} />
          </div>
        ) : (
          <div id="map" style={{ height: "400px", width: "100%" }} />
        )}
        <AirPopup airQuality={selectedAirQuality} isOpen={isAirPopupOpen} onOpenChange={onAirPopupOpenChange} />
      </section>
    </DefaultLayout>
  );
}