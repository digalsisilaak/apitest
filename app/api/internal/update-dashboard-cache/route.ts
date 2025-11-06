import { NextResponse } from "next/server";
import { updateDashboardCache } from "../../../../scripts/updateDashboardCache";

export async function GET(request: Request) {
  const authHeader = request.headers.get("x-vercel-cron-auth");

  if (process.env.CRON_SECRET && authHeader !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    updateDashboardCache();
    return NextResponse.json(
      { message: "Dashboard cache updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in internal cache update API:", error);
    return NextResponse.json(
      { message: "Error updating dashboard cache" },
      { status: 500 }
    );
  }
}
