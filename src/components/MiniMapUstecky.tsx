"use client";

import { useEffect, useRef } from "react";

const PLANTS = [
  { lat: 50.661, lng: 14.032, name: "Centrum Ústí n. L.", mw: 120, primary: true },
  { lat: 50.458, lng: 13.418, name: "Průmyslová zóna Chomutov", mw: 85, primary: false },
  { lat: 50.503, lng: 13.636, name: "Doly Centrum – Most", mw: 60, primary: false },
  { lat: 50.397, lng: 13.573, name: "Triangle – Žatec", mw: 95, primary: false },
  { lat: 50.585, lng: 13.820, name: "Elektrárna Počerady", mw: 50, primary: false },
];

export default function MiniMapUstecky() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [50.56, 13.72],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 13,
      }).addTo(map);

      // Coverage circle — Ústecký kraj approx radius
      L.circle([50.56, 13.72], {
        radius: 52000,
        color: "#2563eb",
        fillColor: "#2563eb",
        fillOpacity: 0.07,
        weight: 2,
        dashArray: "8 5",
      }).addTo(map);

      // Plant markers
      PLANTS.forEach((plant) => {
        const size = plant.primary ? 22 : 16;
        const icon = L.divIcon({
          html: `
            <div style="position:relative;width:${size + 12}px;height:${size + 12}px;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:${size + 20}px;height:${size + 20}px;border-radius:50%;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);left:50%;top:50%;transform:translate(-50%,-50%);"></div>
              <div style="width:${size}px;height:${size}px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 12px rgba(37,99,235,0.45);z-index:2;"></div>
            </div>`,
          className: "",
          iconSize: [size + 12, size + 12],
          iconAnchor: [(size + 12) / 2, (size + 12) / 2],
        });

        L.marker([plant.lat, plant.lng], { icon })
          .addTo(map)
          .bindTooltip(
            `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;color:#0f172a;font-family:system-ui;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${plant.name}</div>
              <div style="font-size:12px;color:#2563eb;font-weight:600;">${plant.mw} MW</div>
            </div>`,
            { permanent: false, direction: "top", offset: [0, -(size / 2) - 10], className: "leaflet-tooltip-energieuk" }
          );
      });

      // Region label
      L.marker([50.56, 13.72], {
        icon: L.divIcon({
          html: `<div style="font-size:11px;font-weight:700;color:#2563eb;background:rgba(255,255,255,0.85);padding:3px 8px;border-radius:6px;border:1px solid #bfdbfe;white-space:nowrap;pointer-events:none;">Ústecký kraj</div>`,
          className: "",
          iconAnchor: [45, 10],
        }),
        interactive: false,
      }).addTo(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <style>{`.leaflet-tooltip-energieuk { background:transparent!important; border:none!important; box-shadow:none!important; padding:0!important; }`}</style>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
