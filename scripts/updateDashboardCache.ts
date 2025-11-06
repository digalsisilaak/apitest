import fs from "fs";
import path from "path";
import { User } from "../app/type/type";
import { dashUser } from "../app/main/lib/dashboardStore";

const usersFilePath = path.join(process.cwd(), "app", "backend", "users.json");
const dashboardCachePath = path.join(
  process.cwd(),
  "app",
  "backend",
  "dashboardCache.json"
);

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

export function updateDashboardCache() {
  try {
    let users: User[] = readUsers();

    const now = new Date();
    users = users.map((user) => {
      if (user.lastLoginDate) {
        const lastLogin = new Date(user.lastLoginDate);
        const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          return { ...user, streak: 0 };
        }
      }
      return user;
    });

    writeUsers(users);

    const publicUserData: dashUser[] = users.map((user) => ({
      username: user.username,
      streak: user.streak || 0,
    }));

    publicUserData.sort((a, b) => b.streak - a.streak);

    fs.writeFileSync(
      dashboardCachePath,
      JSON.stringify(publicUserData, null, 2),
      "utf-8"
    );
    console.log("Dashboard cache updated successfully.");
  } catch (error) {
    console.error("Error updating dashboard cache:", error);
  }
}

// updateDashboardCache(); //вызывать сервер
