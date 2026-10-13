import type { Metadata } from "next";
import { Site } from "@/components/site/site";
import "./site.css";

export const metadata: Metadata = {
  title: { absolute: "Syed Abdul Muneeb · Software Engineer" },
  description:
    "Syed Abdul Muneeb's portfolio: software engineer at PulseGen building AI-agent products. Experience, projects, research and contact.",
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
  return <Site />;
}
