import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { Search, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.Place | null) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({ 
  onPlaceSelect, 
  placeholder = "Buscar localização...", 
  className = "",
  defaultValue = ""
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    // We need a dummy div for PlacesService if we don't have a map, or use the map instance
    if (map) {
      placesService.current = new placesLib.PlacesService(map);
    }
  }, [placesLib, map]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (!val || val.length < 3 || !autocompleteService.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    autocompleteService.current.getPlacePredictions({
      input: val,
      componentRestrictions: { country: 'br' },
      locationBias: map?.getBounds() || undefined,
    }, (predictions: google.maps.places.AutocompletePrediction[] | null, status: any) => {
      setIsSearching(false);
      if (status === 'OK' && predictions) {
        setSuggestions(predictions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    });
  };

  const handleSelect = (suggestion: google.maps.places.AutocompletePrediction) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);

    if (!placesLib || !geocodingLib || !map) return;

    // Use Geocoder or PlacesService to get detailed info
    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ placeId: suggestion.place_id }, (results: google.maps.GeocoderResult[] | null, status: string) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        // Convert GeocoderResult to a subset of Place for simplicity or just pass the geocoder result
        // For our needs, we mostly need lat/lng and name
        const placeStub: any = {
          id: suggestion.place_id,
          displayName: suggestion.structured_formatting.main_text,
          formattedAddress: result.formatted_address,
          location: {
            lat: () => result.geometry.location.lat(),
            lng: () => result.geometry.location.lng(),
          }
        };
        onPlaceSelect(placeStub);
      }
    });
  };

  const clear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onPlaceSelect(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={20} />
        <input 
          type="text" 
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full h-16 pl-16 pr-12 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700 italic group-focus-within:bg-white/[0.08]"
        />
        {query && (
          <button 
            onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0c1310] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-2xl"
          >
            {suggestions.map((s, i) => (
              <button
                key={s.place_id}
                onClick={() => handleSelect(s)}
                className={`w-full p-4 flex items-start gap-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group`}
              >
                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors shrink-0 mt-0.5">
                  <Search size={14} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-white mb-0.5">{s.structured_formatting.main_text}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase italic truncate">{s.structured_formatting.secondary_text}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaceAutocomplete;
