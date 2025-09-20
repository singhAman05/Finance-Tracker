"use client";

import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { profileRoute } from "@/routes/route_profile";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);

      setName(parsed.fullName || "");
      setEmail(parsed.email || "");
      setPhone(parsed.phone || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!name || !email || !phone || !role) {
        throw new Error("All fields are required");
      }
      const profile_update = {
        full_name: name,
        email: email,
        phone: phone,
        profession: role,
        profile_complete: true,
      };

      const res = await profileRoute(profile_update);
      router.push("/dashboard");
    } catch (err: any) {
      console.log(err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-12 p-6 space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-md"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">
        Complete Your Profile
      </h1>

      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="text" value={phone} disabled />
      </div>

      <div>
        <Label>Role</Label>
        <div className="flex gap-4 mt-2">
          <Button
            type="button"
            variant={role === "student" ? "default" : "outline"}
            onClick={() => setRole("student")}
          >
            Student
          </Button>
          <Button
            type="button"
            variant={role === "professional" ? "default" : "outline"}
            onClick={() => setRole("professional")}
          >
            Professional
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Next"}
      </Button>
    </form>
  );
}
