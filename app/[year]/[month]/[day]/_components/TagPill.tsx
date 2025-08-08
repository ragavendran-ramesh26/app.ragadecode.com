interface Props {
  hashtag: string;
  active: boolean;
  onClick?: () => void;
}
export default function TagPill({ hashtag, active, onClick }: Props) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium cursor-pointer
        ${active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
    >
      <span className="capitalize">{hashtag}</span>
    </span>
  );
}
