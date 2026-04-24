import { useEffect, useMemo, useState } from "react";

function calculateElapsedSeconds(startTime) {
  if (!startTime) {
    return 0;
  }

  const diffMs = Date.now() - new Date(startTime).getTime();

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return 0;
  }

  return Math.floor(diffMs / 1000);
}

function formatLiveDuration(elapsedSeconds) {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return `${hours}j ${minutes}m ${seconds}d`;
}

function useLiveDuration(startTime) {
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    calculateElapsedSeconds(startTime),
  );

  useEffect(() => {
    setElapsedSeconds(calculateElapsedSeconds(startTime));

    if (!startTime) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(calculateElapsedSeconds(startTime));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startTime]);

  return useMemo(
    () => ({
      elapsedSeconds,
      elapsedMinutes: Math.ceil(elapsedSeconds / 60),
      formatted: formatLiveDuration(elapsedSeconds),
    }),
    [elapsedSeconds],
  );
}

export default useLiveDuration;
