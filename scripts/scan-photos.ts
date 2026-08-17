import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import exifrPkg from "exifr";

const { gps } = exifrPkg;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photosDir = path.join(root, "public", "photos");
const outFile = path.join(root, "public", "photos.json");

const files = (await readdir(photosDir)).filter((f: string) => /\.jpe?g$/i.test(f));

const photos: Array<{ file: string; lat: number; lng: number; heading?: number }> = [];

for (const file of files) {
  const buffer = await readFile(path.join(photosDir, file));
  const loc = await gps(buffer);
  if (!loc?.latitude || !loc?.longitude) {
    continue;
  }
  const extras = loc as unknown as Record<string, number | undefined>;
  const heading = extras.GPSImgDirection ?? extras.heading;
  photos.push({
    file,
    lat: loc.latitude,
    lng: loc.longitude,
    heading,
  });
}

photos.sort((a, b) => a.file.localeCompare(b.file));

await writeFile(outFile, `${JSON.stringify(photos, null, "\t")}\n`);
console.log(`scanned ${files.length} jpg(s), ${photos.length} geotagged -> ${outFile}`);
