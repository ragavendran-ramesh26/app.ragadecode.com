import { FaHome, FaCalendarAlt, FaFolderOpen, FaEllipsisH } from 'react-icons/fa';
import clsx from 'clsx';

interface Props {
  openDate: () => void;
  openCats: () => void;
  openSettings: () => void; // Keep name same
  goHome: () => void;
  active?: 'home' | 'calendar' | 'categories' | 'more';
}

export default function BottomTabBar({
  openDate,
  openCats,
  openSettings,
  goHome,
  active = 'home'
}: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-white border-t"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="grid grid-cols-4">
        {/* Home */}
        <button
          onClick={goHome}
          className="flex flex-col items-center justify-center gap-1 py-2 min-h-12"
        >
          <FaHome
            size={18}
            className={clsx(
              active === 'home' ? 'text-blue-600' : 'text-blue-400'
            )}
          />
          <span
            className={clsx(
              'text-[11px]',
              active === 'home' ? 'text-blue-600 font-medium' : 'text-gray-500'
            )}
          >
            Home
          </span>
        </button>

        {/* Calendar */}
        <button
          onClick={openDate}
          className="flex flex-col items-center justify-center gap-1 py-2 min-h-12"
        >
          <FaCalendarAlt
            size={18}
            className={clsx(
              active === 'calendar' ? 'text-red-600' : 'text-red-400'
            )}
          />
          <span
            className={clsx(
              'text-[11px]',
              active === 'calendar'
                ? 'text-red-600 font-medium'
                : 'text-gray-500'
            )}
          >
            Calendar
          </span>
        </button>

        {/* Categories */}
        <button
          onClick={openCats}
          className="flex flex-col items-center justify-center gap-1 py-2 min-h-12"
        >
          <FaFolderOpen
            size={18}
            className={clsx(
              active === 'categories' ? 'text-green-600' : 'text-green-400'
            )}
          />
          <span
            className={clsx(
              'text-[11px]',
              active === 'categories'
                ? 'text-green-600 font-medium'
                : 'text-gray-500'
            )}
          >
            Categories
          </span>
        </button>

        {/* More (was Settings) */}
        <button
          onClick={openSettings} // Keep original prop
          className="flex flex-col items-center justify-center gap-1 py-2 min-h-12"
        >
          <FaEllipsisH
            size={18}
            className={clsx(
              active === 'more' ? 'text-purple-600' : 'text-purple-400'
            )}
          />
          <span
            className={clsx(
              'text-[11px]',
              active === 'more'
                ? 'text-purple-600 font-medium'
                : 'text-gray-500'
            )}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
