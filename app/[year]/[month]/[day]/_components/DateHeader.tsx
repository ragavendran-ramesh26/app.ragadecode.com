interface Props {
  date: string;
}
export default function DateHeader({ date }: Props) {
  return (
    <header className="mt-6 mb-6">
      <h2 className="text-[22px] font-bold leading-tight text-gray-900">{date}</h2>
      <div className="mt-3 h-1 w-12 rounded-full bg-red-500/20" />
    </header>
  );
}
