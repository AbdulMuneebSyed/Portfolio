import { createContext, useContext } from "react";
import type { StoreTab } from "@/lib/app-store/catalog";

export type SidebarTab = StoreTab | "categories" | "updates" | "account";

export type Route =
  | { kind: "tab"; id: SidebarTab }
  | { kind: "product"; id: string }
  | { kind: "category"; id: string }
  | { kind: "see-all"; title: string; itemIds: string[] }
  | { kind: "search"; query: string };

export interface StoreNav {
  push: (route: Route) => void;
  openItem: (id: string) => void;
  narrow: boolean;
}

export const StoreNavContext = createContext<StoreNav>({
  push: () => {},
  openItem: () => {},
  narrow: false,
});

export const useStoreNav = () => useContext(StoreNavContext);

export function routeTitle(route: Route, titles: Record<string, string>) {
  switch (route.kind) {
    case "tab":
      return titles[route.id] ?? route.id;
    case "category":
      return route.id;
    case "see-all":
      return route.title;
    case "search":
      return `Results for “${route.query}”`;
    case "product":
      return titles[route.id] ?? "";
  }
}
