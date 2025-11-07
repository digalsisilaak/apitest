import { NextResponse } from "next/server";
import { User } from "../../../models/User";
import dbConnect from "../../../lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const usersToUpdate = await User.find({}).select("+lastLoginDate +streak");

    for (const user of usersToUpdate) {
      if (user.lastLoginDate === undefined || user.lastLoginDate === null) {
        user.streak = 0;
      } else {
        const lastLogin = new Date(user.lastLoginDate);
        lastLogin.setHours(0, 0, 0, 0);
        const lastLoginStr = lastLogin.toISOString().split("T")[0];
        if (lastLoginStr !== todayStr && lastLoginStr !== yesterdayStr) {
          user.streak = 0;
        }
      }
      await user.save();
    }

    console.log(
      "Dashboard cache updated successfully at",
      new Date().toISOString()
    );

    return NextResponse.json(
      { message: "Dashboard cache updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating dashboard cache:", error);
    return NextResponse.json(
      { message: "Error updating dashboard cache" },
      { status: 500 }
    );
  }
}
