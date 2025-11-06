import React, { useEffect, ReactNode } from "react";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";

interface GuestRouteProps {
  children: ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};

export default GuestRoute;
