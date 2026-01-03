"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";

import { loginGoogleRoute } from "@/routes/route_auth";
import { login } from "@/components/redux/slices/slice_auth";

export default function GoogleCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  // Prevents double execution in React Strict Mode
  const hasProcessed = useRef(false);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (
        status !== "authenticated" ||
        !session?.user ||
        hasProcessed.current
      ) {
        return;
      }

      hasProcessed.current = true;

      try {
        const { email, name } = session.user;

        if (!email || !name) {
          throw new Error("Google account missing email or name");
        }

        // Call backend → create/update user → get JWT
        const data = await loginGoogleRoute(email, name);

        // Persist auth state (same as phone login)
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        dispatch(
          login({
            user: data.user,
            token: data.token,
          })
        );

        // Redirect based on profile completion
        router.replace(data.user.profile_complete ? "/dashboard" : "/profile");
      } catch (error) {
        console.error("Google auth sync failed:", error);
        router.replace("/login?error=google_auth_failed");
      }
    };

    syncUserWithBackend();
  }, [status, session, dispatch, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900 dark:text-slate-100" />

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Signing you in
          </h2>
          <p className="text-sm text-slate-500">
            We are securely setting up your account
          </p>
        </div>
      </div>
    </div>
  );
}
