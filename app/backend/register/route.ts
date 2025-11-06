import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User } from "../../type/type";
import { updateSpecificUserInCache } from "../../../scripts/dashboardUtils";

const usersFilePath = path.join(process.cwd(), "app", "backend", "users.json");

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

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Имя пользователя и пароль обязательны" },
        { status: 400 }
      );
    }

    const users: User[] = readUsers();
    if (users.some((user: User) => user.username === username)) {
      return NextResponse.json(
        { message: "Пользователь с таким именем уже существует" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Date.now(),
      username,
      password: hashedPassword,
      purchaseHistory: [],
      lastLoginDate: null,
      streak: 0,
    };
    users.push(newUser);
    writeUsers(users);

    updateSpecificUserInCache({
      username: newUser.username,
      streak: newUser.streak || 0,
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
