"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useDashboardStore } from "../lib/dashboardStore";
import { dashUser } from "../lib/dashboardStore";
interface DashboardIconProps {
  isVisible: boolean;
}

const DashboardIcon: React.FC<DashboardIconProps> = ({ isVisible }) => {
  const { dashboardData, isLoading, error } = useDashboardStore();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-4 bg-gray-700 text-white rounded-md shadow-lg w-max max-w-xs"
        >
          <Link href="/dashboard">
            {isLoading && <span>Загрузка...</span>}
            {error && <span className="text-red-500">Ошибка!</span>}
            {dashboardData &&
              dashboardData.dashboard.map((user: dashUser) => (
                <div key={user.username}>
                  <p>
                    {user.username}:{user.streak}
                  </p>
                </div>
              ))}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardIcon;
