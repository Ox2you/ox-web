import { useEffect, useState } from "react";

interface UserLocationProps {
  onLocationChange: (location: { lat: number; lng: number } | null, isLoading: boolean) => void;
}

export const UserLocation = ({ onLocationChange }: UserLocationProps) => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setIsLoading(false);
            onLocationChange({ lat: latitude, lng: longitude }, false);
          },
          (error) => {
            console.error("Erro ao obter localização:", error);
            setUserLocation({ lat: 51.505, lng: -0.09 });
            setIsLoading(false);
            onLocationChange({ lat: 51.505, lng: -0.09 }, false);
          }
        );
      } else {
        console.error("Geolocalização não é suportada pelo navegador.");
        setUserLocation({ lat: 51.505, lng: -0.09 });
        setIsLoading(false);
        onLocationChange({ lat: 51.505, lng: -0.09 }, false);
      }
    };

    getUserLocation();
  }, [onLocationChange]);

  return null;
};