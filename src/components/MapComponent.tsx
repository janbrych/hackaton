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

// Mapping from our region IDs to NUTS3 codes used in GeoJSON
const REGION_TO_NUTS3: Record<string, string> = {
  PHA: "CZ010",
  STC: "CZ020",
  JHC: "CZ031",
  PLK: "CZ032",
  KVK: "CZ041",
  ULK: "CZ042",
  LBK: "CZ051",
  HKK: "CZ052",
  PAK: "CZ053",
  VYS: "CZ063",
  JHM: "CZ064",
  OLK: "CZ071",
  ZLK: "CZ072",
  MSK: "CZ080",
};

// Reverse mapping: NUTS3 code -> our region ID
const NUTS3_TO_REGION: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_TO_NUTS3).map(([rid, nuts3]) => [nuts3, rid])
);

function getScoreColors(score: number, selected: boolean, hover: boolean) {
  let fillBase: string;
  let strokeColor: string;

  if (score >= 70) {
    fillBase = "#22c55e";
    strokeColor = "#22c55e";
  } else if (score >= 50) {
    fillBase = "#f59e0b";
    strokeColor = "#f59e0b";
  } else {
    fillBase = "#64748b";
    strokeColor = "#64748b";
  }

  let fillOpacity: number;
  let weight: number;

  if (selected) {
    fillOpacity = 0.45;
    weight = 3;
  } else if (hover) {
    fillOpacity = 0.3;
    weight = 2;
  } else {
    fillOpacity = 0.13;
    weight = 1.5;
  }

  return { fillColor: fillBase, fillOpacity, color: strokeColor, weight };
}

export default function MapComponent({ regions, recommendations, onSelect, selectedId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  // Store references to individual geo layers by region ID for style updates
  const regionLayersRef = useRef<Record<string, L.Layer & { setStyle?: (s: object) => void }>>({});

  // ---- Helper: render markers (same logic as before) ----
  function renderMarkersInGroup(
    L: typeof import("leaflet"),
    layerGroup: L.LayerGroup,
    regionsArr: CzechRegion[],
    recsArr: PlantRecommendation[],
    selected: string | undefined,
    onSelectFn: (r: CzechRegion) => void
  ) {
    layerGroup.clearLayers();
    regionsArr.forEach((region) => {
      const rec = recsArr.find((r) => r.regionId === region.id);
      const score = region.plantFeasibility ?? 0;
      const isSelected = region.id === selected;

      let color: string;
      let size: number;
      if (rec && score >= 70) {
        color = "#22c55e"; size = 18;
      } else if (rec && score >= 50) {
        color = "#f59e0b"; size = 14;
      } else {
        color = "#64748b"; size = 10;
      }

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
        .on("click", () => onSelectFn(region));

      const recInfo = rec
        ? `<div style="margin-top:8px;padding:8px;background:#1a2535;border-radius:6px;font-size:12px;">
            <div style="color:#22c55e;font-weight:600;margin-bottom:4px;">&#10003; Elektrárna HydroGrid</div>
            <div style="color:#94a3b8;">${rec.totalCapacityMW} MW &middot; n&aacute;vratnost ${rec.paybackYears} let</div>
          </div>`
        : "";

      marker.bindTooltip(`
        <div style="background:#0f1729;border:1px solid #1e3a5f;border-radius:8px;padding:10px;color:#e2e8f0;min-width:200px;font-family:system-ui">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;">${region.name}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;">
            <div style="color:#94a3b8;">Sk&oacute;re:</div>
            <div style="color:${color};font-weight:600;">${score}/100</div>
            <div style="color:#94a3b8;">OZE:</div>
            <div>${region.renewableCapacity} MW</div>
            <div style="color:#94a3b8;">P&#345;ebytek:</div>
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

  // ---- Initial map setup ----
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

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

      // Base tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        minZoom: 6,
      }).addTo(map);

      // Marker layer group (rendered on top of GeoJSON)
      const layerGroup = L.layerGroup().addTo(map);
      markersRef.current = layerGroup;

      leafletMapRef.current = map;

      // ---- Try to load GeoJSON choropleth ----
      const GEOJSON_URL =
        "https://raw.githubusercontent.com/martinkraus/czech-regional-boundaries/master/kraj.geojson";

      fetch(GEOJSON_URL)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((geojsonData) => {
          // Try to detect the NUTS3 field name from first feature
          const firstFeature = geojsonData?.features?.[0];
          if (!firstFeature) throw new Error("No features in GeoJSON");

          const props = firstFeature.properties ?? {};
          // Possible field names for NUTS3 code
          const nutsFieldCandidates = [
            "KOD_CZNUTS3",
            "nuts3_code",
            "NUTS3",
            "KOD_NUTS3",
            "nuts_code",
            "NUTS_CODE",
            "NUTS3CODE",
          ];
          const nutsField = nutsFieldCandidates.find((f) => f in props);

          if (!nutsField) {
            // Log available fields for debugging but don't crash
            console.warn(
              "[MapComponent] Could not find NUTS3 field. Available props:",
              Object.keys(props)
            );
            throw new Error("NUTS3 field not found in GeoJSON properties");
          }

          // Build region lookup by ID for fast access
          const regionById: Record<string, CzechRegion> = {};
          regions.forEach((r) => { regionById[r.id] = r; });

          regionLayersRef.current = {};

          const geoLayer = L.geoJSON(geojsonData, {
            style: (feature) => {
              try {
                const nuts3 = feature?.properties?.[nutsField] as string | undefined;
                const regionId = nuts3 ? NUTS3_TO_REGION[nuts3] : undefined;
                const region = regionId ? regionById[regionId] : undefined;
                const score = region?.plantFeasibility ?? 0;
                const isSelected = region?.id === selectedId;
                return {
                  ...getScoreColors(score, isSelected, false),
                  opacity: 0.9,
                };
              } catch {
                return { fillColor: "#64748b", fillOpacity: 0.13, color: "#64748b", weight: 1.5, opacity: 0.9 };
              }
            },
            onEachFeature: (feature, layer) => {
              try {
                const nuts3 = feature?.properties?.[nutsField] as string | undefined;
                const regionId = nuts3 ? NUTS3_TO_REGION[nuts3] : undefined;
                const region = regionId ? regionById[regionId] : undefined;

                if (!region) return;

                // Store layer ref for later style updates
                const pathLayer = layer as L.Path;
                regionLayersRef.current[region.id] = pathLayer as unknown as L.Layer & { setStyle?: (s: object) => void };

                pathLayer.on("mouseover", () => {
                  const isSelected = region.id === selectedId;
                  const score = region.plantFeasibility ?? 0;
                  pathLayer.setStyle(getScoreColors(score, isSelected, true));
                });

                pathLayer.on("mouseout", () => {
                  const isSelected = region.id === selectedId;
                  const score = region.plantFeasibility ?? 0;
                  pathLayer.setStyle(getScoreColors(score, isSelected, false));
                });

                pathLayer.on("click", () => {
                  onSelect(region);
                });
              } catch (e) {
                console.warn("[MapComponent] onEachFeature error:", e);
              }
            },
          });

          // Add GeoJSON below markers
          geoLayer.addTo(map);
          // Ensure markers stay on top by re-adding the layer group
          layerGroup.remove();
          layerGroup.addTo(map);

          geoLayerRef.current = geoLayer;
        })
        .catch((err) => {
          console.warn("[MapComponent] GeoJSON load failed, using markers only:", err);
          // Markers-only fallback — already rendered below
        });

      // Always render markers (they show on top of regions or alone as fallback)
      renderMarkersInGroup(L, layerGroup, regions, recommendations, selectedId, onSelect);
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      geoLayerRef.current = null;
      regionLayersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Re-render markers and update GeoJSON styles when selection/data changes ----
  useEffect(() => {
    if (!leafletMapRef.current || !markersRef.current) return;

    import("leaflet").then((L) => {
      renderMarkersInGroup(L, markersRef.current!, regions, recommendations, selectedId, onSelect);

      // Update GeoJSON polygon styles for new selection
      const regionById: Record<string, CzechRegion> = {};
      regions.forEach((r) => { regionById[r.id] = r; });

      Object.entries(regionLayersRef.current).forEach(([regionId, layer]) => {
        const region = regionById[regionId];
        if (!region) return;
        const score = region.plantFeasibility ?? 0;
        const isSelected = region.id === selectedId;
        if (typeof layer.setStyle === "function") {
          layer.setStyle({
            ...getScoreColors(score, isSelected, false),
            opacity: 0.9,
          });
        }
      });
    });
  }, [selectedId, regions, recommendations, onSelect]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Legend overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "12px",
            zIndex: 1000,
            background: "rgba(10, 15, 30, 0.88)",
            border: "1px solid #1e3a5f",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#e2e8f0",
            fontFamily: "system-ui, sans-serif",
            fontSize: "12px",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "7px", fontSize: "11px", color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Vhodnost lokace
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "11px", height: "11px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
              <span style={{ color: "#22c55e", fontWeight: 600 }}>Sk&oacute;re &ge; 70</span>
              <span style={{ color: "#64748b", marginLeft: "2px" }}>doporu&#269;eno</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "11px", height: "11px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>Sk&oacute;re 50&ndash;69</span>
              <span style={{ color: "#64748b", marginLeft: "2px" }}>zv&aacute;&#382;it</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "11px", height: "11px", borderRadius: "50%", background: "#64748b", flexShrink: 0 }} />
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Sk&oacute;re &lt; 50</span>
              <span style={{ color: "#64748b", marginLeft: "2px" }}>nevhodn&eacute;</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
