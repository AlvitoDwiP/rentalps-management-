function ErrorState({
  title,
  description,
  retryLabel = "Coba Lagi",
  onRetry,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  retryClassName = "",
}) {
  return (
    <div
      className={`rounded-[1.75rem] border border-rose-200 bg-rose-50 px-5 py-8 ${className}`}
    >
      <p className={`text-lg font-semibold text-rose-700 ${titleClassName}`}>{title}</p>
      <p className={`mt-2 text-sm leading-6 text-rose-600 ${descriptionClassName}`}>
        {description}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-4 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 ${retryClassName}`}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
