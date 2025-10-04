import { useState } from "react";
import { Input } from "@heroui/input";

interface LocationSearchProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
}

export const LocationSearch = ({ onLocationChange }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Por favor, insira um local para buscar.");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0]; // Pega o primeiro resultado
        onLocationChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setError(null);
      } else {
        setError("Nenhum local encontrado.");
        onLocationChange(null);
      }
    } catch (err) {
      console.error("Erro ao buscar localização:", err);
      setError("Erro ao buscar localização. Tente novamente.");
      onLocationChange(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Input
        label="Buscar Localização..."
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        className=""
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};