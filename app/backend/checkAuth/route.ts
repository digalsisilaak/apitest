import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { User } from "../../type/type";

const usersFilePath = path.join(process.cwd(), "app", "backend", "users.json");
const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "your_access_secret_key";

interface JwtPayload {
  id: number;
  username: string;
}

function readUsers(): User[] {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  const data = fs.readFileSync(usersFilePath, "utf-8");
  return JSON.parse(data);
}

function writeUsers(users: User[]): void {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
}

async function authenticateToken(request: Request): Promise<JwtPayload | null> {
  const cookies = parse(request.headers.get("cookie") || "");
  const token = cookies.authToken;

  if (token == null) return null;

  return new Promise((resolve) => {
    jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return resolve(null);
      }
      resolve(user as JwtPayload);
    });
  });
}

export async function GET(request: Request) {
  const authenticatedUser = await authenticateToken(request);

  if (!authenticatedUser) {
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }

  try {
    const users: User[] = readUsers();
    const user = users.find((u: User) => u.id === authenticatedUser.id);

    if (!user) {
      return NextResponse.json(
        { isAuthenticated: false, message: "Пользователь не найден" },
        { status: 200 }
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
    }

    return NextResponse.json(
      {
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          purchaseHistory: user.purchaseHistory,
          streak: user.streak,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при проверке статуса авторизации:", error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        message: "Ошибка сервера при проверке статуса авторизации",
      },
      { status: 200 }
    );
  }
}
