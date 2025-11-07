import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Имя пользователя и пароль обязательны" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким именем уже существует" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      purchaseHistory: [],
      lastLoginDate: null,
      streak: 0,
      refreshTokens: null,
    });

  

    return NextResponse.json(
      {
        message: "Пользователь успешно зарегистрирован",
        user: {
          id: newUser.id,
          username: newUser.username,
          purchaseHistory: newUser.purchaseHistory,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при регистрации" },
      { status: 500 }
    );
  }
}
