"use client";
import React, { memo } from "react";
import useStreakStore from "../lib/streakStore";
import Link from "next/link";

const StreakDisplay = memo(function StreakDisplay() {
  const { currentStreak } = useStreakStore();

  return (
    <Link href="/dashboard" className="streak-display">
      {currentStreak > 0 ? (
        <span role="img" aria-label="fire" className="dark:text-white">
          🔥 {currentStreak}
        </span>
      ) : (
        <span role="img" aria-label="no-fire">
          --
        </span>
      )}
    </Link>
  );
});

export default StreakDisplay;
