export default function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-[#1b1c1c]">{title}</h1>
      <p className="mt-2 text-[#4e4634]">{description}</p>
      <span className="mt-4 rounded-full bg-[#efc13e]/10 px-3 py-1 text-xs font-medium text-[#765b00]">
        Em desenvolvimento
      </span>
    </div>
  );
}
