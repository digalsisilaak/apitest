"use client";

import Link from "next/link";
import StreakDisplay from "./StreakDisplay";
import ThemeToggle from "./ThemeToggle";
import React, { useState, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import DashboardIcon from "./DashboardIcon";
import { useDashboardStore } from "../lib/dashboardStore";

const Header: React.FC = () => {
  const { isLoggedIn, isLoading, user } = useAuth();
  const [showDashboardIcon, setShowDashboardIcon] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { fetchDashboardData, clearDashboardData } = useDashboardStore();

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    fetchDashboardData();
    hoverTimeoutRef.current = setTimeout(() => {
      setShowDashboardIcon(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      clearDashboardData();
      setShowDashboardIcon(false);
    }, 300);
  };

  if (isLoading) {
    return null;
  }

  return (
    <header className="flex items-center justify-between gap-x-4 fixed dark:bg-gray-800 bg-gray-200 w-full p-4 shadow-md z-10 h-16">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-lg dark:text-gray-200">
          Главная
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Link href="/my-account" className="font-bold dark:text-gray-200">
              {user?.username}
            </Link>
            <Link
              href="/shopping_cart"
              className="font-bold dark:text-gray-200"
            >
              Корзина
            </Link>
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative"
            >
              <StreakDisplay />
              {isLoggedIn && <DashboardIcon isVisible={showDashboardIcon} />}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/auth"
              className="px-2 py-1 bg-green-500 text-white font-bold rounded-md hover:bg-green-600"
            >
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="px-2 py-1 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600"
            >
              Зарегистрироваться
            </Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
