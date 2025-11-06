import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../type/type";
import { serialize } from "cookie";
import { updateSpecificUserInCache } from "../../../scripts/dashboardUtils";

const usersFilePath = path.join(process.cwd(), "app", "backend", "users.json");
const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "your_access_secret_key";
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

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    const users: User[] = readUsers();
    const user = users.find((u: User) => u.username === username);

    if (!user) {
      return NextResponse.json(
        { message: "Неправильное имя пользователя или пароль" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Неправильное имя пользователя или пароль" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    if (user.streak === undefined) {
      user.streak = 0;
    }
    if (user.lastLoginDate === undefined) {
      user.lastLoginDate = null;
    }

    if (!user.lastLoginDate) {
      user.streak = 1;
    } else {
      const lastLogin = new Date(user.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);

      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(
        Math.abs((today.getTime() - lastLogin.getTime()) / oneDay)
      );

      if (user.lastLoginDate === todayStr) {
      } else if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
      } else {
        user.streak = 1;
      }
    }
    user.lastLoginDate = todayStr;

    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      writeUsers(users);

      updateSpecificUserInCache({
        username: user.username,
        streak: user.streak || 0,
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshTokens = hashedRefreshToken;
    writeUsers(users);

    const accessTokenCookie = serialize("authToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    const refreshTokenCookie = serialize("refreshToken", refreshToken, {
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
      JSON.stringify({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          purchaseHistory: user.purchaseHistory,
          streak: user.streak,
        },
      }),
      {
        status: 200,
        headers: headers,
      }
    );
  } catch (error) {
    console.error("Ошибка входа:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при входе" },
      { status: 500 }
    );
  }
}
