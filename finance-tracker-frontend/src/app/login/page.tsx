import AuthForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <div>
      <AuthForm />
    </div>
  );
}
