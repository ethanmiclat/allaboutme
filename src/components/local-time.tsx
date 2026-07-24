"use client";

import { useEffect, useState } from "react";

/** Live local time (Central) for the Location section. */
export default function LocalTime() {
  const [time, setTime] = useState("—");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Chicago",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    update();
    // First tick lands on the next minute boundary, then every minute — so the
    // displayed minute flips exactly on time (a flat interval lags up to 30s).
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      update();
      interval = setInterval(update, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(timeout);
      if (interval !== undefined) clearInterval(interval);
    };
  }, []);

  return <span className="location__time">{time}</span>;
}
