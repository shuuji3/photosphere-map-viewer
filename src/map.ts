import { LngLatBounds, Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Photo } from './data.ts'

setWorkerUrl(workerUrl);

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
    style: `https://api.protomaps.com/styles/v5/light/en.json?key=${import.meta.env.VITE_PROTOMAPS_KEY}`,
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
