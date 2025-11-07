import { NextResponse } from "next/server";
import { User } from "../../models/User";
import dbConnect from "../../lib/dbConnect";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    const allUsersData = await User.find(
      {},
      { username: 1, streak: 1, _id: 0 }
    ).sort({ streak: -1, username: 1 });

    let responseData: { username: string; streak: number }[];
    if (showAll) {
      responseData = allUsersData;
    } else {
      responseData = allUsersData.slice(0, 5);
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
