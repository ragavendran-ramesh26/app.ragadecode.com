export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 border-b backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="px-4">
        <div className="flex justify-between items-center py-3">
          <a href="/" className="flex items-center gap-3 min-h-10">
            <img
              src="https://genuine-compassion-eb21be0109.media.strapiapp.com/ragadecode_logo_668c5f78f9.png"
              alt="Raga Decode Logo"
              className="h-8 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-900 text-base">Raga Decode</span>
              <span className="text-gray-500 text-[11px]">Decoded News. Clear. Bold. Unfiltered.</span>
            </div>
          </a>
          <div className="w-6" />
        </div>
      </div>
    </header>
  );
}
