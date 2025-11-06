import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "../../type/type";
import useStreakStore from "./streakStore";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/backend/checkAuth");
      const data = await response.json();

      if (data.isAuthenticated) {
        setIsLoggedIn(true);
        setUser(data.user);
        useStreakStore.getState().setStreak(data.user.streak || 0);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Ошибка проверки статуса аутентификации:", error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/backend/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUser(data.user);
        useStreakStore.getState().setStreak(data.user.streak || 0);
        return true;
      } else {
        const data = await response.json();
        console.error("Login failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Login request failed:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/backend/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful:", data.message);
        return true;
      } else {
        console.error("Registration failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Registration request failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/backend/logout", { method: "POST" });
      setIsLoggedIn(false);
      setUser(null);
      router.push("/auth");
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, register, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
