import type { Metadata } from "next";
import { Profile } from "@/components/profile";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Syed Abdul Muneeb's experience, projects, skills and contact details as a plain page.",
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
  return <Profile />;
}
