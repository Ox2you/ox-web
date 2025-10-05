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

// Pontos fixos de exemplo em Londres (sem marcadores, só círculos com tooltip)
const airQualityPoints = [
  {
    lat: 51.5074,
    lng: -0.1278,
    color: "#ff0000", // Vermelho
    tooltip: "Air Quality: Poor",
    image: "../src/imagem/triste.png", // Ajustado para pasta public
  },
  {
    lat: 51.5072,
    lng: -0.1657,
    color: "#00ff00", // Verde
    tooltip: "Air Quality: good",
    image: "../src/imagem/feliz.png", // Ajustado para pasta public
  },
  {
    lat: 51.5055,
    lng: -0.0204,
    color: "#ffff00", // Amarelo
    tooltip: "Air Quality: Moderate",
    image: "../src/imagem/moderada.png", // Ajustado para pasta public
  },
];

export default function IndexPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Gerencia o estado aqui

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLocationChange = useCallback(
    (location: { lat: number; lng: number } | null, isLoading: boolean) => {
      setUserLocation(location);
      setIsLoading(isLoading);
    },
    []
  );

  useEffect(() => {
    if (!userLocation) return;

    // Centro o mapa no usuário, zoom out pra ver Londres
    const map = L.map("map").setView([userLocation.lat, userLocation.lng], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Marcador do usuário (mantido)
    L.marker([userLocation.lat, userLocation.lng])
      .addTo(map)
      .bindPopup("You are Here!")
      .openPopup();

    // Adiciona os círculos coloridos com tooltip contendo texto e imagem (se houver)
    airQualityPoints.forEach((point) => {
      const tooltipContent = point.image
        ? `<div style="text-align: center; padding: 8px;">
             <img src="${point.image}" alt="Air quality icon" style="width: 32px; height: 32px; display: block; margin: 0 auto 8px;" />
             <div>${point.tooltip}</div>
           </div>`
        : point.tooltip;

      L.circle([point.lat, point.lng], {
        color: point.color,
        fillColor: point.color,
        fillOpacity: 0.4,
        radius: 800, // Raio fixo de 800m
        weight: 2,
      })
        .addTo(map)
        .bindTooltip(tooltipContent, {
          permanent: false, // Aparece só no hover
          direction: "auto",
          className: "custom-tooltip", // Para estilizar via CSS se quiser
        });
    });

    // Cleanup: Remove mapa
    return () => {
      map.remove();
    };
  }, [userLocation]);

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
            <Button onPress={onOpen} className="ml-5">
              Open Filters
            </Button>
          </div>
          <FilterPopup isOpen={isOpen} onOpenChange={onOpenChange} />
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
        <AirPopup />
      </section>
    </DefaultLayout>
  );
}