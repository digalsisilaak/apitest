import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { User, HistoryItem } from "../../type/type";
import { parse } from "cookie";

const usersFilePath = path.join(process.cwd(), "app", "backend", "users.json");
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

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

function writeUsers(users: User[]) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

async function authenticateToken(request: Request): Promise<JwtPayload | null> {
  console.log(request);
  const cookies = parse(request.headers.get("cookie") || "");
  const token = cookies.authToken;

  if (token == null) return null;

  return new Promise((resolve) => {
    jwt.verify(token, SECRET_KEY, (err, user) => {
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
    return NextResponse.json({ message: "Неавторизован" }, { status: 401 });
  }

  try {
    const users: User[] = readUsers();
    const user = users.find((u: User) => u.id === authenticatedUser.id);

    if (!user) {
      return NextResponse.json(
        { message: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const page = parseInt(
      new URL(request.url).searchParams.get("_page") || "1",
      10
    );
    const limit = parseInt(
      new URL(request.url).searchParams.get("_limit") || "5",
      10
    );

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedHistory =
      user.purchaseHistory?.slice(startIndex, endIndex) || [];

    return NextResponse.json(paginatedHistory, { status: 200 });
  } catch (error) {
    console.error("Ошибка при получении истории покупок:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при получении истории покупок" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authenticatedUser = await authenticateToken(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Неавторизован" }, { status: 401 });
  }

  try {
    const newPurchaseItems: HistoryItem[] = await request.json();
    if (!Array.isArray(newPurchaseItems)) {
      return NextResponse.json(
        { message: "Неверный формат данных: ожидается массив" },
        { status: 400 }
      );
    }

    const users: User[] = readUsers();
    const userIndex = users.findIndex(
      (u: User) => u.id === authenticatedUser.id
    );

    if (userIndex === -1) {
      return NextResponse.json(
        { message: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const user = users[userIndex];
    if (!user.purchaseHistory) {
      user.purchaseHistory = [];
    }

    newPurchaseItems.forEach((item: HistoryItem) => {
      user.purchaseHistory.push({
        id: item.id,
        title: item.title,
        price: item.price,
        thumbnail: item.thumbnail,
        timestamp: Date.now(),
      });
    });
    writeUsers(users);
    return NextResponse.json(
      { message: "История покупок успешно обновлена" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при обновлении истории покупок:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при обновлении истории покупок" },
      { status: 500 }
    );
  }
}
