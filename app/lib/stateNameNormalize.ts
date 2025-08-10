// app/lib/stateNameNormalize.ts

// Map ANY incoming label to the exact GeoJSON st_nm value
const API_TO_GEO_NAME: Record<string, string> = {
  // Common variants / API quirks
  'Tamilnadu': 'Tamil Nadu',
  'NCT of Delhi': 'Delhi',
  'Andaman & Nicobar Islands': 'Andaman and Nicobar Islands',
  'Dadra & Nagar Haveli and Daman & Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'Uttaranchal': 'Uttarakhand',
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'Orissa': 'Odisha',
  'Pondicherry': 'Puducherry',

  // If your API ever returns short forms, add them here too:
  'Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
};

// Canonicalize loosely (lowercase, strip spaces, dashes, ampersands)
const canon = (s: string) =>
  s.toLowerCase().replace(/[\s\-&]/g, '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

// Known canonical forms for direct lookup (covers exact GeoJSON names)
const GEOJSON_NAMES = new Set<string>([
  'Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh',
  'Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal',
]);

// Build a canonical index for the official names so "tam il-nadu" etc. still hit.
const GEO_INDEX = (() => {
  const m = new Map<string,string>();
  GEOJSON_NAMES.forEach(n => m.set(canon(n), n));
  return m;
})();

/** Convert any API title to the exact GeoJSON st_nm string. */
export function toGeoName(apiTitle: string): string {
  if (!apiTitle) return '';
  // First, exact replacements
  const replaced = API_TO_GEO_NAME[apiTitle] ?? apiTitle;
  // If it's already a valid Geo name, done
  if (GEOJSON_NAMES.has(replaced)) return replaced;
  // Try canonical match
  const c = canon(replaced);
  return GEO_INDEX.get(c) ?? replaced; // fallback to replaced (won't color if unknown)
}
