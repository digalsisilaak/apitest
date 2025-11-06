import fs from "fs";
import path from "path";
import { dashUser } from "../app/main/lib/dashboardStore";

const dashboardCachePath = path.join(
  process.cwd(),
  "app",
  "backend",
  "dashboardCache.json"
);

function readDashboardCache(): dashUser[] {
  if (!fs.existsSync(dashboardCachePath)) {
    return [];
  }
  const data = fs.readFileSync(dashboardCachePath, "utf-8");
  const parsedData = JSON.parse(data);
  if (Array.isArray(parsedData)) {
    return parsedData;
  }
  return [];
}

function writeDashboardCache(data: dashUser[]): void {
  fs.writeFileSync(dashboardCachePath, JSON.stringify(data, null, 2), "utf-8");
}

export function updateSpecificUserInCache(newUser: dashUser): void {
  const cachedData = readDashboardCache();

  const existingUserIndex = cachedData.findIndex(
    (user) => user.username === newUser.username
  );
  if (existingUserIndex !== -1) {
    cachedData[existingUserIndex] = newUser;
  } else {
    cachedData.push(newUser);
  }

  cachedData.sort((a, b) => b.streak - a.streak);
  writeDashboardCache(cachedData);
}
