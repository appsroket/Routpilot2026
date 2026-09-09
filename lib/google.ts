import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// Google Maps JS API (v2 functional API). setOptions must be called before
// any library is imported; importMapsLibrary triggers the actual load.
let configured = false;

export function configureMaps() {
  if (configured) return;
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    v: "weekly",
    libraries: ["places", "geometry"],
  });
  configured = true;
}

export { importLibrary as importMapsLibrary };
