"use client";

import { useEffect, useRef } from "react";
import type { CzechRegion } from "@/data/czechRegions";
import type { PlantRecommendation } from "@/lib/optimizer";

interface Props {
  regions: CzechRegion[];
  recommendations: PlantRecommendation[];
  onSelect: (region: CzechRegion) => void;
  selectedId?: string;
}

export default function MapComponent({ regions, recommendations, onSelect, selectedId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [49.8, 15.5],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        minZoom: 6,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersRef.current = layerGroup;

      leafletMapRef.current = map;

      function renderMarkers() {
        layerGroup.clearLayers();
        regions.forEach((region) => {
          const rec = recommendations.find((r) => r.regionId === region.id);
          const score = region.plantFeasibility ?? 0;
          const isSelected = region.id === selectedId;

          let color: string;
          let size: number;
          if (rec && score >= 70) {
            color = "#22c55e"; size = 18;
          } else if (rec && score >= 50) {
            color = "#f59e0b"; size = 14;
          } else {
            color = "#64748b"; size = 10;
          }

          const pulseClass = rec ? "animate-pulse" : "";

          const markerHtml = `
            <div style="
              width: ${size + 8}px;
              height: ${size + 8}px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${rec ? `<div style="
                position: absolute;
                width: ${size + 16}px;
                height: ${size + 16}px;
                border-radius: 50%;
                background: ${color}22;
                border: 1px solid ${color}44;
                left: 50%; top: 50%;
                transform: translate(-50%, -50%);
              "></div>` : ""}
              <div style="
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${color};
                border: ${isSelected ? "3px solid white" : "2px solid rgba(255,255,255,0.3)"};
                box-shadow: 0 0 ${rec ? 12 : 4}px ${color}88;
                position: relative;
                z-index: 2;
              "></div>
              ${rec ? `<div style="
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                font-size: 10px;
                color: ${color};
                font-weight: 600;
                text-shadow: 0 1px 2px #0a0f1e;
              ">${rec.totalCapacityMW} MW</div>` : ""}
            </div>
          `;

          const icon = L.divIcon({
            html: markerHtml,
            className: "",
            iconSize: [size + 8, size + 8 + (rec ? 22 : 0)],
            iconAnchor: [(size + 8) / 2, (size + 8) / 2],
          });

          const marker = L.marker([region.lat, region.lng], { icon })
            .addTo(layerGroup)
            .on("click", () => onSelect(region));

          const recInfo = rec
            ? `<div style="margin-top:8px;padding:8px;background:#1a2535;border-radius:6px;font-size:12px;">
                <div style="color:#22c55e;font-weight:600;margin-bottom:4px;">✓ Elektrárna HydroGrid</div>
                <div style="color:#94a3b8;">${rec.totalCapacityMW} MW · návratnost ${rec.paybackYears} let</div>
              </div>`
            : "";

          marker.bindTooltip(`
            <div style="background:#0f1729;border:1px solid #1e3a5f;border-radius:8px;padding:10px;color:#e2e8f0;min-width:200px;font-family:system-ui">
              <div style="font-weight:700;font-size:14px;margin-bottom:6px;">${region.name}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;">
                <div style="color:#94a3b8;">Skóre:</div>
                <div style="color:${color};font-weight:600;">${score}/100</div>
                <div style="color:#94a3b8;">OZE:</div>
                <div>${region.renewableCapacity} MW</div>
                <div style="color:#94a3b8;">Přebytek:</div>
                <div style="color:#00d4ff;">${((region.annualSurplus ?? 0) / 1000).toFixed(1)} GWh</div>
              </div>
              ${recInfo}
            </div>
          `, {
            permanent: false,
            direction: "top",
            offset: [0, -size / 2 - 8],
            className: "leaflet-tooltip-custom",
          });
        });
      }

      renderMarkers();
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Re-render markers when selection changes
  useEffect(() => {
    if (!leafletMapRef.current || !markersRef.current) return;
    import("leaflet").then((L) => {
      markersRef.current!.clearLayers();
      regions.forEach((region) => {
        const rec = recommendations.find((r) => r.regionId === region.id);
        const score = region.plantFeasibility ?? 0;
        const isSelected = region.id === selectedId;

        let color: string;
        let size: number;
        if (rec && score >= 70) { color = "#22c55e"; size = 18; }
        else if (rec && score >= 50) { color = "#f59e0b"; size = 14; }
        else { color = "#64748b"; size = 10; }

        const markerHtml = `
          <div style="width:${size+8}px;height:${size+8}px;position:relative;display:flex;align-items:center;justify-content:center;">
            ${rec ? `<div style="position:absolute;width:${size+16}px;height:${size+16}px;border-radius:50%;background:${color}22;border:1px solid ${color}44;left:50%;top:50%;transform:translate(-50%,-50%);"></div>` : ""}
            <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${isSelected?"3px solid white":"2px solid rgba(255,255,255,0.3)"};box-shadow:0 0 ${rec?12:4}px ${color}88;position:relative;z-index:2;"></div>
            ${rec?`<div style="position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;color:${color};font-weight:600;text-shadow:0 1px 2px #0a0f1e;">${rec.totalCapacityMW} MW</div>`:""}
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "",
          iconSize: [size + 8, size + 8 + (rec ? 22 : 0)],
          iconAnchor: [(size + 8) / 2, (size + 8) / 2],
        });

        L.marker([region.lat, region.lng], { icon })
          .addTo(markersRef.current!)
          .on("click", () => onSelect(region));
      });
    });
  }, [selectedId, regions, recommendations, onSelect]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
