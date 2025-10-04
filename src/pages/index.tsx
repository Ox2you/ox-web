import DefaultLayout from "@/layouts/default";
import { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UserLocation } from "../components/user-location";
import { LocationSearch } from "../components/location-search";

export default function IndexPage() {
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

    const map = L.map("map").setView([userLocation.lat, userLocation.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([userLocation.lat, userLocation.lng])
      .addTo(map)
      .bindPopup("Você está aqui!")
      .openPopup();

    return () => {
      map.remove();
    };
  }, [userLocation]);

  return (
    <DefaultLayout>
      <UserLocation onLocationChange={handleLocationChange} />
      <section className="flex flex-col items-center justify-center gap-4">
        <LocationSearch
          onLocationChange={(location) => {
            if (location) {
              setUserLocation(location);
              setIsLoading(false);
            }
          }}
        />
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
      </section>
    </DefaultLayout>
  );
}