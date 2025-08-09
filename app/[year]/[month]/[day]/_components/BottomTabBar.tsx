interface Props {
  goHomeToday: () => void;
  openDate: () => void;
  openCats: () => void;
  openSettings: () => void;
  
}

export default function BottomTabBar({ goHomeToday, openDate, openCats, openSettings }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-white border-t"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="grid grid-cols-4">
        <button onClick={goHomeToday} className="flex flex-col items-center justify-center gap-1 py-2 min-h-12">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-[11px]">Home</span>
        </button>
        <button onClick={openDate} className="flex flex-col items-center justify-center gap-1 py-2 min-h-12">
          📅 <span className="text-[11px]">Calendar</span>
        </button>

        <button onClick={openCats} className="flex flex-col items-center justify-center gap-1 py-2 min-h-12">
          📂 <span className="text-[11px]">Filter</span>
        </button>
        <button onClick={openSettings} className="flex flex-col items-center justify-center gap-1 py-2 min-h-12">
          ⚙ <span className="text-[11px]">Settings</span>
        </button>
      </div>
    </nav>
  );
}
