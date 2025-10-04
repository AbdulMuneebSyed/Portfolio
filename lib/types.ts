export interface WindowState {
  id: string;
  title: string;
  icon: string | any; // Can be string or imported image object
  component: string;
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
