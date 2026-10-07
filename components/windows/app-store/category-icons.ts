import {
  Briefcase,
  Building2,
  Code2,
  FolderOpen,
  Gamepad2,
  GraduationCap,
  Layers,
  Monitor,
  Palette,
  Settings2,
  Sparkles,
  Timer,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "AI / SaaS": Sparkles,
  EdTech: GraduationCap,
  "Full Stack": Layers,
  Enterprise: Building2,
  Community: Users,
  Interactive: Monitor,
  Experience: Briefcase,
  Portfolio: FolderOpen,
  System: Settings2,
  Utilities: Wrench,
  Games: Gamepad2,
  Productivity: Timer,
  Creativity: Palette,
  "Developer Tools": Code2,
};

export function categoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? Layers;
}
