import { Profile } from "@/components/profile";
import { Shell } from "@/components/shell";

// The OS is client-only. Next to it, the same profile is rendered on the
// server as plain text, so search engines, link checkers, screen readers and
// visitors without JavaScript get who Muneeb is and how to reach him.
export default function Home() {
  return (
    <>
      {/* The first Tab stop: keyboard and screen-reader users can skip the
          OS and read the profile as a plain page. */}
      <a href="/profile" className="skip-link">
        Skip to a plain-text profile
      </a>
      <Profile hidden />
      <Shell />
    </>
  );
}
