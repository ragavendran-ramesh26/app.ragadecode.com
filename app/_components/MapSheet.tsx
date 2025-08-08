// app/_components/MapSheet.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

type Stat = { accidents: number; murder: number; rape: number; total: number };
export type StatsMap = Record<string, Stat>;

function normalizeStateName(props: any): string {
  return (
    props?.st_nm ||           // common in India TopoJSONs
    props?.NAME_1 ||          // some datasets (GADM-like)
    props?.name ||            // fallback
    ''
  );
}

export default function MapSheet({
  open,
  onClose,
  stats,
  geoUrl = '/india-states-topo.json',
}: {
  open: boolean;
  onClose: () => void;
  stats: StatsMap;
  geoUrl?: string; // path under /public
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; state: string; s: Stat } | null>(null);

  // color by total (simple linear red scale)
  const max = useMemo(
    () => Math.max(1, ...Object.values(stats || {}).map((s) => s?.total ?? 0)),
    [stats]
  );
  const fillFor = (name: string) => {
    const t = stats?.[name]?.total ?? 0;
    const pct = Math.min(1, t / max);
    const g = 235 - Math.round(pct * 150); // 235 -> 85
    return `rgb(255, ${g}, ${g})`;
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-white">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 border-b">
        <h2 className="text-base font-semibold">India Incidents Map</h2>
        <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Close</button>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-[48px]">
        <ComposableMap projection="geoMercator" style={{ width: '100%', height: '100%' }}>
          <ZoomableGroup center={[80, 22]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = normalizeStateName(geo.properties);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        const s = stats?.[name] || { accidents: 0, murder: 0, rape: 0, total: 0 };
                        setTooltip({ x: e.clientX, y: e.clientY, state: name, s });
                      }}
                      onMouseMove={(e) => {
                        setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => {
                        // Optional: drilldown to state page
                        // router.push(`/india/${encodeURIComponent(name)}`);
                      }}
                      style={{
                        default: { fill: fillFor(name), outline: 'none', stroke: '#9ca3af', strokeWidth: 0.5 },
                        hover:   { fill: '#ffd6d6', outline: 'none' },
                        pressed: { fill: '#ffb3b3', outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      {tooltip && tooltip.state && (
        <div
          className="pointer-events-none fixed z-[1100] bg-white/95 border rounded px-2 py-1 shadow text-[12px]"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="font-semibold">{tooltip.state}</div>
          <div>Accidents: {tooltip.s.accidents ?? 0}</div>
          <div>Murder: {tooltip.s.murder ?? 0}</div>
          <div>Rape: {tooltip.s.rape ?? 0}</div>
          <div className="mt-1 font-medium">Total: {tooltip.s.total ?? 0}</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute right-2 bottom-2 bg-white/95 border rounded shadow px-2 py-1 text-[11px]">
        <div className="font-medium mb-1">Incidents</div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-5" style={{ background: 'rgb(255,235,235)' }} />
          <span>Low</span>
          <span className="inline-block h-3 w-5" style={{ background: 'rgb(255,85,85)' }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
