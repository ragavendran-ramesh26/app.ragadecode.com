// IndiaChoropleth.tsx
'use client';
import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { geoCentroid } from 'd3-geo';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

type Metrics = Record<string, number>;
export type StateDatum = {
  value?: number;
  metrics?: Metrics;
  status?: 'low'|'med'|'high';
  meta?: { href?: string; label?: string; slug?: string };
};

export default function IndiaChoropleth({
  data = {},
  colorBy = 'value',           // 'value' or 'metrics.murder' etc.
  onStateClick,
  tooltipRenderer,
  showLabels = true,           // NEW
  minLabelValue = 1,           // NEW: don’t label zeros
}: {
  data?: Record<string, StateDatum>;
  colorBy?: string;
  onStateClick?: (stateName: string, d: StateDatum) => void;
  tooltipRenderer?: (name: string, d: StateDatum) => React.ReactNode;
  showLabels?: boolean;
  minLabelValue?: number;
}) {
  const getNumeric = (d?: StateDatum) => {
    if (!d) return undefined;
    if (colorBy === 'value') return d.value ?? 0;
    const [scope, key] = colorBy.split('.');
    if (scope === 'metrics' && key) return Number(d.metrics?.[key] ?? 0);
    return undefined;
  };

  // compute scale domain
  const [min, max] = useMemo(() => {
    const nums = Object.values(data)
      .map(getNumeric)
      .filter((x): x is number => typeof x === 'number' && isFinite(x));
    if (!nums.length) return [0, 1];
    const mn = Math.min(...nums);
    const mx = Math.max(...nums);
    return mx > mn ? [mn, mx] : [0, mx || 1];
  }, [data, colorBy]);

  // 🔶 orange heat scale (light -> deep)
  const colorNumeric = scaleLinear<string>()
    .domain([min, max])
    .range(['#ffedd5', '#ea580c']); // tailwind's orange-100 -> orange-600-ish

  const fillFor = (d?: StateDatum) => {
    const v = getNumeric(d);
    return typeof v === 'number' && isFinite(v) ? colorNumeric(v) : '#eef2f7';
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
      <div className="w-full" style={{ height: '50vh', minHeight: 280, maxHeight: 520 }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [80, 22], scale: 900 }}
          width={440}
          height={440}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography="/india-states.geojson">
            {({ geographies }) =>
              geographies.map((geo) => {
                const props: any = geo.properties || {};
                const name =
                  props.st_nm || props.STATE || props.State_Name || props.NAME_1 || props.NAME || 'Unknown';
                const datum = data[name];
                const value = getNumeric(datum) ?? 0;

                return (
                  <>
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillFor(datum)}
                      stroke="#9ca3af"
                      strokeWidth={0.5}
                      onClick={() => {
                        if (datum) onStateClick?.(name, datum);
                        const href = datum?.meta?.href;
                        if (href) window.location.href = href;
                      }}
                      style={{
                        default: { outline: 'none' },
                        hover:   { outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                    {showLabels && value >= minLabelValue && (
                      <Marker key={`${geo.rsmKey}-label`} coordinates={geoCentroid(geo) as [number, number]}>
                        <text
                          textAnchor="middle"
                          // readable on both light and darker fills
                          style={{ fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}
                          // a little white halo for contrast
                          stroke="#ffffff" strokeWidth={3} paintOrder="stroke"
                          fill="#111827" // gray-900 text
                        >
                          {value}
                        </text>
                      </Marker>
                    )}
                  </>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Legend updated to orange */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
        <span>Low</span>
        <div className="h-2 flex-1 rounded bg-gradient-to-r from-[#ffedd5] to-[#ea580c]" />
        <span>High</span>
      </div>
    </div>
  );
}
