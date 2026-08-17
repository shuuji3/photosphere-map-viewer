import "@photo-sphere-viewer/core/index.css";
import "./style.css";
import { Viewer } from "@photo-sphere-viewer/core";
import { loadPhotos } from "./data.ts";
import { createMap } from "./map.ts";

const viewerEl = document.querySelector<HTMLDivElement>("#viewer")!;
const mapEl = document.querySelector<HTMLDivElement>("#map")!;

const photos = await loadPhotos();

if (photos.length === 0) {
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent =
    "no geotagged photos found — drop 360 jpgs into public/photos/ and run `pnpm scan`";
  viewerEl.append(empty);
}

function photoLabel(file: string): string {
  return file;
}

function paramNumber(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw === null) {
    return undefined;
  }
  const value = Number(raw);
  const ok = Number.isFinite(value);
  return ok ? value : undefined;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

const params = new URLSearchParams(location.search);
const requestedPhoto = params.get("photo");
const requestedZoom = paramNumber(params, "zoom");
const requestedYaw = paramNumber(params, "yaw");
const requestedPitch = paramNumber(params, "pitch");

function resolvePhotoIndex(raw: string | null): number {
  if (raw === null || raw === "") {
    return 0;
  }
  const target = raw.toLowerCase().replace(/\.jpe?g$/i, "");
  const match = photos.findIndex((p) => p.file.toLowerCase().replace(/\.jpe?g$/i, "") === target);
  return match === -1 ? 0 : match;
}

const validIndex = resolvePhotoIndex(requestedPhoto);
const first = photos[validIndex];

const viewer = new Viewer({
  container: viewerEl,
  caption: first ? photoLabel(first.file) : "",
  panorama: first ? `photos/${first.file}` : undefined,
  navbar: "caption zoom fullscreen",
});

const map = createMap(mapEl, photos, (index) => select(index));

if (first) {
  map.select(validIndex);
}

let currentIndex = validIndex;

function select(index: number): void {
  const photo = photos[index];
  if (!photo) {
    return;
  }

  currentIndex = index;
  map.select(index);
  viewer.setOption("caption", photoLabel(photo.file));

  const current = viewer.getPosition();
  const position =
    photo.heading === undefined ? current : { yaw: photo.heading, pitch: current.pitch };
  void viewer.setPanorama(`photos/${photo.file}`, {
    position,
    transition: true,
    zoom: viewer.getZoomLevel(),
  });
}

let paramsApplied = false;

function applySharedView(): void {
  if (paramsApplied) {
    return;
  }
  paramsApplied = true;

  if (requestedYaw !== undefined || requestedPitch !== undefined) {
    viewer.rotate({
      yaw: toRadians(requestedYaw ?? 0),
      pitch: toRadians(requestedPitch ?? 0),
    });
  }

  if (requestedZoom !== undefined) {
    viewer.zoom(Math.max(0, Math.min(100, requestedZoom)));
  }
}

viewer.addEventListener("panorama-loaded", () => {
  setTimeout(applySharedView, 0);
});

const shareBtn = document.createElement("button");
shareBtn.className = "share-btn";
shareBtn.type = "button";
shareBtn.textContent = "share";
shareBtn.setAttribute("aria-label", "copy link to current view");
shareBtn.addEventListener("click", () => {
  const position = viewer.getPosition();
  const link = new URLSearchParams({
    photo: photos[currentIndex].file,
    zoom: String(Math.round(viewer.getZoomLevel())),
    yaw: String(Math.round(toDegrees(position.yaw))),
    pitch: String(Math.round(toDegrees(position.pitch))),
  });
  const url = `${location.origin}${location.pathname}?${link}`;
  void navigator.clipboard.writeText(url);
  shareBtn.classList.add("copied");
  setTimeout(() => shareBtn.classList.remove("copied"), 1200);
});
viewerEl.append(shareBtn);
