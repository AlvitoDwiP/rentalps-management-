function SectionSkeleton({ variant = "grid", count = 6 }) {
  if (variant === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

export default SectionSkeleton;
