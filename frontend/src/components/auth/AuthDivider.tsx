export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
        or continue with
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
    </div>
  );
}
