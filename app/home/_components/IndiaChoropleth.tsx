'use client';
import { scaleSequential, scaleThreshold, scaleLinear } from 'd3-scale';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

export default function IndiaChoropleth({
  data = {},
  colorBy = 'value', // 'value' | 'metrics.temperatureC' | 'metrics.crime' | 'status'
  onStateClick,
  tooltipRenderer,   // optional custom tooltip
}: {
  data?: Record<string, StateDatum>;
  colorBy?: string;
  onStateClick?: (stateName: string, d: StateDatum) => void;
  tooltipRenderer?: (name: string, d: StateDatum) => React.ReactNode;
}) {

  // pick a number from StateDatum by 'path' string
  const getNumeric = (d?: StateDatum) => {
    if (!d) return undefined;
    if (colorBy === 'value') return d.value;
    const [scope, key] = colorBy.split('.');
    if (scope === 'metrics' && key && d.metrics) return (d.metrics as any)[key];
    return undefined;
  };

  // numeric scale example (blue)
  const values = Object.values(data).map(getNumeric).filter((x): x is number => typeof x === 'number');
  const [min, max] = values.length ? [Math.min(...values), Math.max(...values)] : [0, 1];
  const colorNumeric = scaleLinear<string>().domain([min, max]).range(['#dbeafe', '#1d4ed8']); // light→dark

  // categorical status → color example
  const colorStatus = (s?: string) =>
    s === 'high' ? '#b91c1c' : s === 'med' ? '#f59e0b' : s === 'low' ? '#16a34a' : '#d1d5db';

  const fillFor = (d?: StateDatum) => {
    if (!d) return '#eef2f7';
    if (colorBy.startsWith('metrics') || colorBy === 'value') {
      const v = getNumeric(d);
      if (typeof v === 'number' && isFinite(v)) return colorNumeric(v);
      return '#eef2f7';
    }
    if (colorBy === 'status') return colorStatus(d.status);
    return '#eef2f7';
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
      <div className="w-full" style={{ height: '50vh', minHeight: 280, maxHeight: 520 }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [80, 22], scale: 900 }}
          width={440} height={440}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography="/india-states.geojson">
            {({ geographies }) =>
              geographies.map((geo) => {
                const props: any = geo.properties || {};
                const name =
                  props.st_nm || props.STATE || props.State_Name || props.NAME_1 || props.NAME || 'Unknown';
                const datum = data[name];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillFor(datum)}
                    stroke="#9ca3af"
                    strokeWidth={0.5}
                    onClick={() => {
                      onStateClick?.(name, datum);
                      const href = datum?.meta?.href;
                      if (href) window.location.href = href;
                    }}
                    style={{
                      default: { outline: 'none' },
                      hover:   { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Simple legend (numeric) */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
        <span>Low</span>
        <div className="h-2 flex-1 rounded bg-gradient-to-r from-[#dbeafe] to-[#1d4ed8]" />
        <span>High</span>
      </div>
    </div>
  );
}
