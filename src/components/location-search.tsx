import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Input } from "@heroui/input";
import { useTheme } from "@heroui/use-theme";
import clsx from "clsx";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
}

export const LocationSearch = ({ onLocationChange }: LocationSearchProps) => {
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Atualiza o tema dinamicamente
  useEffect(() => {
    setCurrentTheme(theme);
    if (theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [theme]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !(dropdownRef.current && dropdownRef.current.contains(e.target as Node))
      ) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atualiza posição do dropdown
  useEffect(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [searchQuery, showSuggestions]);

  // Busca com debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5`
        );
        const data = await response.json();

        if (data.length > 0) {
          setSuggestions(data as LocationSuggestion[]);
          setShowSuggestions(true);
          setError(null);
          setHighlightIndex(-1);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setError("Nenhum local encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar sugestões:", err);
        setSuggestions([]);
        setShowSuggestions(false);
        setError("Erro ao buscar sugestões. Tente novamente.");
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const { lat, lon } = suggestion;
    onLocationChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    setHighlightIndex(-1);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Por favor, insira um local para buscar.");
      return;
    }

    if (suggestions.length > 0 && highlightIndex >= 0) {
      handleSelectSuggestion(suggestions[highlightIndex]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0)
        handleSelectSuggestion(suggestions[highlightIndex]);
      else handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  // Scroll automático para o item destacado
  useEffect(() => {
    if (dropdownRef.current && highlightIndex >= 0) {
      const item = dropdownRef.current.children[highlightIndex] as HTMLElement;
      if (item) {
        const containerTop = dropdownRef.current.scrollTop;
        const containerBottom = containerTop + dropdownRef.current.offsetHeight;
        const itemTop = item.offsetTop;
        const itemBottom = itemTop + item.offsetHeight;

        if (itemBottom > containerBottom) {
          dropdownRef.current.scrollTop += itemBottom - containerBottom;
        } else if (itemTop < containerTop) {
          dropdownRef.current.scrollTop -= containerTop - itemTop;
        }
      }
    }
  }, [highlightIndex]);

  return (
    <div className="flex min-w-[500px] flex-col gap-2 relative">
      <Input
        label="Buscar Localização..."
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        ref={inputRef}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions &&
        suggestions.length > 0 &&
        dropdownCoords &&
        createPortal(
          <ul
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownCoords.top,
              left: dropdownCoords.left,
              width: dropdownCoords.width,
            }}
            className="border rounded-md shadow-lg max-h-60 overflow-y-auto transition-colors duration-200 z-[9999] bg-white text-black border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            {suggestions.map((suggestion, index) => (
              <li key={index} className="list-none">
                <button
                  type="button"
                  className={clsx(
                    "w-full px-4 py-2 text-left focus:outline-none text-sm hover:opacity-80",
                    { "bg-gray-200 dark:bg-gray-700": index === highlightIndex }
                  )}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightIndex(index)}
                >
                  {suggestion.display_name}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}

      {error && (
        <p className={clsx("text-sm text-red-500 dark:text-red-400")}>
          {error}
        </p>
      )}
    </div>
  );
};
