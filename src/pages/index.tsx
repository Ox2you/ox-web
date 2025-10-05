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

// Define AirQuality type for consistency
type AirQuality = "good" | "moderate" | "poor";

// Fixed example points in London
const airQualityPoints = [
  {
    lat: 51.5074,
    lng: -0.1278,
    color: "#ff0000", // Red
    tooltip: "Air Quality: Poor",
    image: "../src/imagem/triste.png",
    airQuality: "poor" as AirQuality,
  },
  {
    lat: 51.5072,
    lng: -0.1657,
    color: "#00ff00", // Green
    tooltip: "Air Quality: Good",
    image: "../src/imagem/feliz.png",
    airQuality: "good" as AirQuality,
  },
  {
    lat: 51.5055,
    lng: -0.0204,
    color: "#ffff00", // Yellow
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

  const handleLocationChange = useCallback(
    (location: { lat: number; lng: number } | null, isLoading: boolean) => {
      setUserLocation(location);
      setIsLoading(isLoading);
    },
    []
  );

  useEffect(() => {
    if (!userLocation) return;

    const map = L.map("map").setView([userLocation.lat, userLocation.lng], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([userLocation.lat, userLocation.lng])
      .addTo(map)
      .bindPopup("You are here!")
      .openPopup();

    airQualityPoints.forEach((point) => {
      const tooltipContent = point.image
        ? `<div style="text-align: center; padding: 8px;">
             <img src="${point.image}" alt="Air quality icon" style="width: 32px; height: 32px; display: block; margin: 0 auto 8px;" />
             <div>${point.tooltip}</div>
           </div>`
        : point.tooltip;

      const circle = L.circle([point.lat, point.lng], {
        color: point.color,
        fillColor: point.color,
        fillOpacity: 0.4,
        radius: 800,
        weight: 2,
      })
        .addTo(map)
        .bindTooltip(tooltipContent, {
          permanent: false,
          direction: "auto",
          className: "custom-tooltip",
        });

      circle.on("click", () => {
        console.log(`Clicked circle with quality: ${point.airQuality}`); // Debug log
        setSelectedAirQuality(point.airQuality);
        onAirPopupOpen();
      });
    });

    return () => {
      map.remove();
    };
  }, [userLocation, onAirPopupOpen]);

  return (
    <DefaultLayout>
      <UserLocation onLocationChange={handleLocationChange} />
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-row items-center justify-center">
          <LocationSearch
            onLocationChange={(location) => {
              if (location) {
                setUserLocation(location);
                setIsLoading(false);
              }
            }}
          />
          <div>
            <Button onPress={onFilterOpen} className="ml-5">
              Open Filters
            </Button>
          </div>
          <FilterPopup isOpen={isFilterOpen} onOpenChange={onFilterOpenChange} />
        </div>
        {isLoading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: "400px", width: "100%" }}
          >
            <p>Loading map...</p>
          </div>
        ) : (
          <div id="map" style={{ height: "400px", width: "100%" }} />
        )}
        <AirPopup airQuality={selectedAirQuality} isOpen={isAirPopupOpen} onOpenChange={onAirPopupOpenChange} />
      </section>
    </DefaultLayout>
  );
}