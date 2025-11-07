import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { User } from "../../models/User";
import dbConnect from "../../lib/dbConnect";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "your_access_secret_key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";

export async function POST() {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token not found" },
        { status: 401 }
      );
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;
    } catch {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 }
      );
    }

    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (
      !user.refreshTokens ||
      !(await bcrypt.compare(refreshToken, user.refreshTokens))
    ) {
      user.refreshTokens = null;
      await user.save();
      return NextResponse.json(
        { message: "Invalid refresh token. Please log in again." },
        { status: 403 }
      );
    }

    user.refreshTokens = null;
    await user.save();

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokens = hashedNewRefreshToken;

    await user.save();

    const accessTokenCookie = serialize("authToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    const refreshTokenCookie = serialize("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    const headers = new Headers();
    headers.append("Set-Cookie", accessTokenCookie);
    headers.append("Set-Cookie", refreshTokenCookie);
    headers.append("Content-Type", "application/json");

    return new Response(
      JSON.stringify({ message: "Tokens refreshed successfully" }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Ошибка обновления токена:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при обновлении токена" },
      { status: 500 }
    );
  }
}
