import DefaultLayout from "@/layouts/default";
import { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UserLocation } from "../components/user-location";
import { LocationSearch } from "../components/location-search";
import  AirPopup  from "../components/air-popup";
import  FilterPopup  from "../components/filter-popup";

import {
  Button,
} from "@heroui/button";

import {
  useDisclosure,
} from "@heroui/use-disclosure";

// Pontos fixos de exemplo em Londres (sem marcadores, só círculos com tooltip)
const airQualityPoints = [
  {
    lat: 51.5074,
    lng: -0.1278,
    color: "#ff0000", // Vermelho
    tooltip: "Air Quality: Poor",
  },
  {
    lat: 51.5072,
    lng: -0.1657,
    color: "#00ff00", // Verde
    tooltip: "Air Quality: good",
  },
  {
    lat: 51.5055,
    lng: -0.0204,
    color: "#ffff00", // Amarelo
    tooltip: "Air Quality: Moderate",
  },
  {
    lat: 51.5595,
    lng: -0.1703,
    color: "#00ff00", // Verde
    tooltip: "Air Quality: good",
  },
];

export default function IndexPage() {

  const { isOpen, onOpen, onOpenChange } = useDisclosure();  // Gerencia o estado aqui
  
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
      .bindPopup("Você está aqui!")
      .openPopup();

        // Adiciona só os círculos coloridos (sem marcadores) com tooltip no hover
    airQualityPoints.forEach((point) => {
      L.circle([point.lat, point.lng], {
        color: point.color,
        fillColor: point.color,
        fillOpacity: 0.4,
        radius: 800, // Raio fixo de 800m
        weight: 2,
      })
        .addTo(map)
        .bindTooltip(point.tooltip, {
          permanent: false, // Aparece só no hover
          direction: "auto",
          className: "custom-tooltip", // Pra estilizar se quiser (CSS extra)
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
          <div><Button onPress={onOpen}>Abrir Filtros</Button></div>
          <FilterPopup isOpen={isOpen} onOpenChange={onOpenChange} />
        </div>
        {isLoading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: "400px", width: "100%" }}
          >
            <p>Carregando mapa...</p>
          </div>
        ) : (
          <div id="map" style={{ height: "400px", width: "100%" }} />
        )}
        <AirPopup></AirPopup>
      </section>
    </DefaultLayout>
  );
}