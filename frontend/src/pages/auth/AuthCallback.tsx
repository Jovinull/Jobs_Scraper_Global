import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/Loading";

export default function AuthCallback() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      navigate("/app", { replace: true });
    } else {
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, [user, isLoading, navigate]);

  return <Loading />;
}
