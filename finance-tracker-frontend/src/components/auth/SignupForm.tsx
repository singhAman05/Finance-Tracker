"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/redux/ui/label";
import { Input } from "@/components/redux/ui/input";
import { Button } from "@/components/redux/ui/button";

export default function AuthForm() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(!loading);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
