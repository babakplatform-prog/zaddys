declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare module "framer-motion" {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module "lucide-react";
