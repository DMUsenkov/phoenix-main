export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-surface-200 border-t-phoenix-500 animate-spin" />
          <div className="absolute inset-0 bg-glow-phoenix opacity-50" />
        </div>
        <p className="text-zinc-400 text-sm font-medium animate-pulse">Загрузка...</p>
      </div>
    </div>
  );
}
