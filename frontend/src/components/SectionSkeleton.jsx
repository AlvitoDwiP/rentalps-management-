function SectionSkeleton({ variant = "grid", count = 6 }) {
  if (variant === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[272px] animate-pulse rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)]"
        />
      ))}
    </div>
  );
}

export default SectionSkeleton;
