import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { User } from "../../type/type";

const usersFilePath = path.join(process.cwd(), "app", "backend", "users.json");

function readUsers(): User[] {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  const data = fs.readFileSync(usersFilePath, "utf-8");
  const users: User[] = JSON.parse(data);
  return users.map((user) => ({
    ...user,
    refreshTokens: user.refreshTokens || null,
  }));
}

function writeUsers(users: User[]): void {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
}

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "your_access_secret_key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";

export async function POST() {
  try {
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

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === decoded.id);

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[userIndex];

    if (
      !user.refreshTokens ||
      !(await bcrypt.compare(refreshToken, user.refreshTokens))
    ) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 }
      );
    }

    user.refreshTokens = null;

    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokens = hashedNewRefreshToken;

    writeUsers(users);

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
