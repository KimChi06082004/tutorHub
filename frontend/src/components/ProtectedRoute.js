import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuthUser } from "../utils/auth"; // hàm đọc user từ localStorage

export default function ProtectedRoute({ children, roles = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  useEffect(() => {
    if (!user) {
      // chưa login → về login
      router.replace("/login");
    } else if (roles.length && !roles.includes(user.role)) {
      // login nhưng role sai → về dashboard đúng role
      if (user.role === "admin") router.replace("/dashboard/admin");
      else if (user.role === "tutor") router.replace("/dashboard/tutor");
      else if (user.role === "accountant")
        router.replace("/dashboard/accountant");
      else router.replace("/dashboard/student");
    } else {
      setLoading(false);
    }
  }, [user, roles, router]);

  if (loading) return <p>Loading...</p>;
  return <>{children}</>;
}
