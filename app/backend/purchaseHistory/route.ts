import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { HistoryItem } from "../../type/type";
import { parse } from "cookie";
import dbConnect from "../../lib/dbConnect";
import { User } from "../../models/User";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "your_access_secret_key";

interface JwtPayload {
  id: string;
  username: string;
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
  await dbConnect();
  const authenticatedUser = await authenticateToken(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Неавторизован" }, { status: 401 });
  }

  try {
    const user = await User.findOne({ _id: authenticatedUser.id });

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
  await dbConnect();
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

    const user = await User.findOne({ _id: authenticatedUser.id });

    if (!user) {
      return NextResponse.json(
        { message: "Пользователь не найден" },
        { status: 404 }
      );
    }

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
    await user.save();
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
