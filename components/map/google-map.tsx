"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import { configureMaps, importMapsLibrary } from "@/lib/google";

export type MapStop = {
  id: string;
  lat: number;
  lng: number;
  label: number;
};

type Props = {
  stops: MapStop[];
  homeBase: { lat: number; lng: number } | null;
  color: string;
  polyline: string | null;
};

export function GoogleMap({ stops, homeBase, color, polyline }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const overlaysRef = React.useRef<(google.maps.Marker | google.maps.Polyline)[]>([]);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const hasKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  // Initialize the map once.
  React.useEffect(() => {
    if (!hasKey || !containerRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        configureMaps();
        const { Map } = await importMapsLibrary("maps");
        if (cancelled || !containerRef.current) return;
        mapRef.current = new Map(containerRef.current, {
          center: homeBase ?? { lat: 39.5, lng: -98.35 },
          zoom: homeBase ? 11 : 4,
          disableDefaultUI: true,
          zoomControl: true,
          backgroundColor: "#0a0a0a",
        });
        setReady(true);
      } catch {
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasKey]);

  // Draw markers + polyline whenever data changes.
  React.useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    let cancelled = false;

    (async () => {
      // Ensure the maps library is loaded, then use the typed global namespace
      // (classic Marker / LatLngBounds / SymbolPath live on `google.maps`).
      await importMapsLibrary("maps");
      if (cancelled) return;

      // Clear previous overlays.
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];

      const bounds = new google.maps.LatLngBounds();

      if (homeBase) {
        const marker = new google.maps.Marker({
          position: homeBase,
          map,
          zIndex: 1000,
          label: { text: "H", color: "#0a0a0a", fontWeight: "700", fontSize: "12px" },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 13,
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeColor: "#0a0a0a",
            strokeWeight: 2,
          },
          title: "Home base",
        });
        overlaysRef.current.push(marker);
        bounds.extend(homeBase);
      }

      stops.forEach((stop) => {
        const marker = new google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map,
          label: { text: String(stop.label), color: "#0a0a0a", fontWeight: "700", fontSize: "12px" },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#0a0a0a",
            strokeWeight: 2,
          },
        });
        overlaysRef.current.push(marker);
        bounds.extend({ lat: stop.lat, lng: stop.lng });
      });

      if (polyline) {
        try {
          await importMapsLibrary("geometry");
          const path = google.maps.geometry.encoding.decodePath(polyline);
          const line = new google.maps.Polyline({
            path,
            map,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 4,
          });
          overlaysRef.current.push(line);
          path.forEach((p) => bounds.extend(p));
        } catch {
          // Polyline is a nice-to-have; markers still render.
        }
      }

      const count = stops.length + (homeBase ? 1 : 0);
      if (count === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(13);
      } else if (count > 1) {
        map.fitBounds(bounds, 64);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, stops, homeBase, color, polyline]);

  if (!hasKey || failed) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-6 text-center">
        <MapPin className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {failed
            ? "The map couldn't load."
            : "Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the map."}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[420px] w-full overflow-hidden rounded-lg border border-border bg-card"
    />
  );
}
