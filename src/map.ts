import "maplibre-gl/dist/maplibre-gl.css";
import { config, LngLatBounds, Map as MapLibreMap, Marker } from "maplibre-gl";
import type { Photo } from "./data.ts";

const STYLE_URL = `https://api.protomaps.com/styles/v5/light/en.json?key=${import.meta.env.VITE_PROTOMAPS_KEY}`;

config.WORKER_URL = "/maplibre-gl-worker.mjs";

export interface MapHandle {
  select(index: number): void;
}

export function createMap(
  container: HTMLElement,
  photos: Photo[],
  onSelect: (index: number) => void,
): MapHandle {
  const map = new MapLibreMap({
    container,
    style: STYLE_URL,
    center: [0, 0],
    zoom: 1,
  });

  const pins: HTMLElement[] = [];

  for (const [index, photo] of photos.entries()) {
    const pin = document.createElement("button");
    pin.className = "map-pin";
    pin.type = "button";
    pin.setAttribute("aria-label", photo.file);
    pin.addEventListener("click", () => onSelect(index));

    new Marker({ element: pin }).setLngLat([photo.lng, photo.lat]).addTo(map);

    pins.push(pin);
  }

  if (photos.length > 0) {
    const bounds = new LngLatBounds();
    for (const photo of photos) {
      bounds.extend([photo.lng, photo.lat]);
    }
    map.fitBounds(bounds, { padding: 40, maxZoom: 17 });
  }

  return {
    select(index: number): void {
      for (const [i, pin] of pins.entries()) {
        pin.classList.toggle("active", i === index);
      }
    },
  };
}
