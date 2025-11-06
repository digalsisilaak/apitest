import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { dashUser } from "../../../app/main/lib/dashboardStore";

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
  return JSON.parse(data);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    const cachedData: dashUser[] = readDashboardCache();

    let responseData: dashUser[];
    if (showAll) {
      responseData = cachedData;
    } else {
      responseData = cachedData.slice(0, 5);
    }

    return NextResponse.json(
      {
        message: "Dashboard data retrieved successfully",
        dashboard: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при получении данных дашборда:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при получении данных дашборда" },
      { status: 500 }
    );
  }
}
