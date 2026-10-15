import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const LIBRARIES: ("places")[] = ["places"];

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
  minHeight: 380,
};

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

interface Props {
  open: boolean;
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (lat: number, lng: number, label?: string) => void;
  onClose: () => void;
}

const LocationPickerModal = ({
  open,
  initialLat,
  initialLng,
  onConfirm,
  onClose,
}: Props) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const startLat =
    initialLat != null && !Number.isNaN(initialLat)
      ? initialLat
      : DEFAULT_CENTER.lat;
  const startLng =
    initialLng != null && !Number.isNaN(initialLng)
      ? initialLng
      : DEFAULT_CENTER.lng;

  const [marker, setMarker] = useState({ lat: startLat, lng: startLng });
  const [pickedLabel, setPickedLabel] = useState<string>("");

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setMarker({ lat: startLat, lng: startLng });
      setPickedLabel("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [open]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(marker);
    }
  }, [marker]);

  if (!open) return null;

  if (loadError) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-red-600 mb-2">
            Map failed to load
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Google Maps could not be loaded. Check your API key and enabled
            APIs (Maps JavaScript API, Places API).
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#003D8C] text-white text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
          <p className="text-sm text-gray-500">Loading map…</p>
        </div>
      </div>
    );
  }

  const onLoadAutocomplete = (
    ac: google.maps.places.Autocomplete
  ) => {
    autocompleteRef.current = ac;
  };

  const onPlaceChanged = () => {
    const ac = autocompleteRef.current;
    if (!ac) return;

    const place = ac.getPlace();
    if (!place.geometry || !place.geometry.location) {
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setMarker({ lat, lng });
    setPickedLabel(place.formatted_address || place.name || "");
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setPickedLabel("");
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setPickedLabel("");
  };

  const handleConfirm = () => {
    onConfirm(
      Number(marker.lat.toFixed(6)),
      Number(marker.lng.toFixed(6)),
      pickedLabel || undefined
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Pick a Location
            </h3>
            <p className="text-xs text-gray-500">
              Search an address or click anywhere on the map.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <Autocomplete
            onLoad={onLoadAutocomplete}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: "in" },
              fields: ["geometry", "formatted_address", "name"],
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search: e.g., Bal Pharma Bangalore"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003D8C]"
            />
          </Autocomplete>
        </div>

        <div className="flex-1 min-h-[380px] relative">
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={marker}
            zoom={15}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            onClick={handleMapClick}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            <Marker
              position={marker}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          </GoogleMap>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-gray-600 font-mono">
            Lat: <b>{marker.lat.toFixed(6)}</b>&nbsp;&nbsp; Lng:{" "}
            <b>{marker.lng.toFixed(6)}</b>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-sm rounded-full bg-[#003D8C] text-white font-semibold hover:bg-[#002D5B]"
            >
              Use This Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;