import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "../../lib/dbConnect";
import { User } from "../../models/User";

const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";

export async function POST() {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const refreshTokenValue = cookieStore.get("refreshToken")?.value;

    if (refreshTokenValue) {
      let decoded: jwt.JwtPayload;
      try {
        decoded = jwt.verify(
          refreshTokenValue,
          JWT_REFRESH_SECRET
        ) as jwt.JwtPayload;

        const user = await User.findOne({ _id: decoded.id });

        if (user) {
          if (
            user.refreshTokens &&
            (await bcrypt.compare(refreshTokenValue, user.refreshTokens))
          ) {
            user.refreshTokens = null;
            await user.save();
          }
        }
      } catch (error) {
        console.error("Ошибка при проверке refresh токена при выходе:", error);
      }
    }

    const accessTokenCookie = serialize("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    });

    const refreshTokenCookie = serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    });

    const headers = new Headers();
    headers.append("Set-Cookie", accessTokenCookie);
    headers.append("Set-Cookie", refreshTokenCookie);
    headers.append("Content-Type", "application/json");

    return new Response(
      JSON.stringify({ message: "Вы успешно вышли из системы" }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Ошибка выхода:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при выходе" },
      { status: 500 }
    );
  }
}
