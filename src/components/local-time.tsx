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
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return <span className="location__time">{time}</span>;
}
