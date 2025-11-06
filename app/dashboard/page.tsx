"use client";

import React, { useEffect } from "react";
import { useDashboardStore } from "../main/lib/dashboardStore";

function DashBoard() {
  const { dashboardData, isLoading, error, fetchDashboardData } =
    useDashboardStore();

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  if (error) {
    return <div>Ошибка : {error}</div>;
  }

  if (isLoading) {
    return <div>Загрузка</div>;
  }
  return (
    <div>
      <h1>Таблица лидеров</h1>
      <ul>
        {dashboardData?.dashboard.map((user) => (
          <li key={user.username}>
            {user.username}: 🔥 {user.streak}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default DashBoard;
