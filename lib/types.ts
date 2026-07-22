export interface WindowState {
  id: string;
  processId?: number;
  appId?: string;
  title: string;
  icon: string | any; // Can be string or imported image object
  component: string;
  status?: "running" | "minimized" | "suspended";
  startedAt?: string;
  lastActiveAt?: string;
  memoryMb?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
  disableMaximize?: boolean; // Optional property to disable maximize button
  metadata?: Record<string, any>; // For passing additional data like initial folder
}

export interface DesktopIcon {
  id: string;
  title: string;
  icon: string | any;
  component: string;
  position: { x: number; y: number };
}

export interface AppRegistryEntry {
  id: string;
  title: string;
  icon: string | any;
  component: string;
  category: "System" | "Portfolio" | "Productivity" | "Utilities" | "Games";
  description: string;
  defaultPosition?: { x: number; y: number };
  defaultSize: { width: number; height: number };
  defaultIconPosition?: { x: number; y: number };
  showOnDesktop?: boolean;
  searchable?: boolean;
  launchAliases?: string[];
  externalUrl?: string;
  metadata?: Record<string, any>;
}
