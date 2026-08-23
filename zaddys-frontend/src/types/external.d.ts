declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>; 

  export const Apple: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const ArrowUpRight: Icon;
  export const ArrowUp: Icon;
  export const AtSign: Icon;
  export const Monitor: Icon;
  export const Moon: Icon;
  export const AlertTriangle: Icon;
  export const Bot: Icon;
  export const Check: Icon;
  export const CheckCircle2: Icon;
  export const ChevronRight: Icon;
  export const CircleHelp: Icon;
  export const Clock: Icon;
  export const Copy: Icon;
  export const Download: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Gift: Icon;
  export const Globe2: Icon;
  export const Headphones: Icon;
  export const Home: Icon;
  export const Info: Icon;
  export const KeyRound: Icon;
  export const Link: Icon;
  export const Lock: Icon;
  export const LogOut: Icon;
  export const Mail: Icon;
  export const MapPin: Icon;
  export const Menu: Icon;
  export const MessageCircle: Icon;
  export const Minus: Icon;
  export const Package: Icon;
  export const Phone: Icon;
  export const Plus: Icon;
  export const Search: Icon;
  export const Send: Icon;
  export const Share2: Icon;
  export const ShoppingBag: Icon;
  export const ShoppingCart: Icon;
  export const SlidersHorizontal: Icon;
  export const Star: Icon;
  export const Sun: Icon;
  export const Trash2: Icon;
  export const User: Icon;
  export const UsersRound: Icon;
  export const Wine: Icon;
  export const X: Icon;
}

declare module "framer-motion" {
  import type { ComponentType, HTMLAttributes, ReactNode } from "react";

  type MotionProps = HTMLAttributes<HTMLElement> & {
    initial?: Record<string, number>;
    animate?: Record<string, number>;
    exit?: Record<string, number>;
    transition?: Record<string, string | number>;
  };

  export const motion: {
    div: ComponentType<MotionProps>;
    h1: ComponentType<MotionProps>;
    p: ComponentType<MotionProps>;
  };
  export const AnimatePresence: ComponentType<{ children?: ReactNode }>;
}