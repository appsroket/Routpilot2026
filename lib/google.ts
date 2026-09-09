import { Loader } from "@googlemaps/js-api-loader";

// Shared Google Maps JS API loader (client-side).
export const mapsLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  version: "weekly",
  libraries: ["places", "geometry"],
});
