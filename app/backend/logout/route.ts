import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { User } from "../../type/type";

const usersFilePath = path.join(process.cwd(), "app", "backend", "users.json");
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";

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

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshTokenValue = cookieStore.get("refreshToken")?.value;

    if (refreshTokenValue) {
      let decoded: jwt.JwtPayload;
      try {
        decoded = jwt.verify(
          refreshTokenValue,
          JWT_REFRESH_SECRET
        ) as jwt.JwtPayload;

        const users = readUsers();
        const userIndex = users.findIndex((u) => u.id === decoded.id);

        if (userIndex !== -1) {
          const user = users[userIndex];
          if (
            user.refreshTokens &&
            (await bcrypt.compare(refreshTokenValue, user.refreshTokens))
          ) {
            user.refreshTokens = null;
            writeUsers(users);
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
