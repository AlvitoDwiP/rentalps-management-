function EmptyState({
  title,
  description,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}) {
  return (
    <div
      className={`rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center ${className}`}
    >
      <p className={`text-lg font-semibold text-slate-800 ${titleClassName}`}>
        {title}
      </p>
      <p className={`mt-2 text-sm leading-6 text-slate-500 ${descriptionClassName}`}>
        {description}
      </p>
    </div>
  );
}

export default EmptyState;
