export interface Photo {
  file: string;
  lat: number;
  lng: number;
  heading?: number;
}

export async function loadPhotos(): Promise<Photo[]> {
  const res = await fetch("photos.json");
  if (!res.ok) {
    return [];
  }
  return (await res.json()) as Photo[];
}
