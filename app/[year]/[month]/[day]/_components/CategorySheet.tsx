import { CategoryGroup } from "../_types";

interface Props {
  categories: CategoryGroup[];
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
  onClose: () => void;
}

export default function CategorySheet({ categories, activeTag, onSelectTag, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto p-4">
        <div className="mx-auto h-1 w-10 bg-gray-200 rounded-full mb-3" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Categories</h3>
          <button className="rounded-full border px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>
        {categories.map((cat, i) => (
          <details key={i} className="group rounded-lg border p-2">
            <summary className="cursor-pointer flex items-center justify-between">
              <span className="font-semibold text-gray-700">{cat.category} ({cat.article_count})</span>
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {cat.hashtags.map((tag, j) => (
                <button
                  key={j}
                  onClick={() => { onSelectTag(tag.hashtag); onClose(); }}
                  className={`px-3 py-2 rounded-full text-xs font-medium border min-h-9
                    ${activeTag === tag.hashtag
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "hover:bg-blue-50 text-gray-700 border-gray-300"}`}
                >
                  #{tag.hashtag} ({tag.count})
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
