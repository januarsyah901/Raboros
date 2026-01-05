// Theme color tokens
export const THEME_COLORS = {
  dark: {
    bg: {
      primary: "bg-slate-950",
      secondary: "bg-slate-900",
      tertiary: "bg-slate-800",
      glass: "bg-slate-900/80",
    },
    text: {
      primary: "text-white",
      secondary: "text-slate-300",
      tertiary: "text-slate-400",
      muted: "text-slate-500",
    },
    border: {
      primary: "border-slate-800",
      secondary: "border-slate-700",
      tertiary: "border-slate-700/50",
    },
  },
  light: {
    bg: {
      primary: "bg-white",
      secondary: "bg-slate-50",
      tertiary: "bg-slate-100",
      glass: "bg-white/80",
    },
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      tertiary: "text-slate-500",
      muted: "text-slate-400",
    },
    border: {
      primary: "border-slate-200",
      secondary: "border-slate-100",
      tertiary: "border-slate-200/80",
    },
  },
};

// Spacing tokens
export const SPACING = {
  xs: "px-2 py-1.5",
  sm: "px-3 py-2",
  md: "px-4 py-2.5",
  lg: "px-6 py-3",
  xl: "px-8 py-4",
};

// Button variants
export const BUTTON_VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 active:scale-95",
  danger: "bg-rose-500 text-white hover:bg-rose-600 active:scale-95",
  ghost:
    "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95",
};

// Modal classes
export const MODAL_CLASSES = {
  backdrop: "fixed inset-0 z-50 flex items-center justify-center p-4",
  overlay: "absolute inset-0 bg-black/50 backdrop-blur-sm",
  content: "relative z-10 w-full max-w-sm rounded-[2rem] border p-6 shadow-2xl",
};

// Header classes
export const HEADER_CLASSES = {
  sticky:
    "sticky top-0 z-40 w-full transition-all duration-300 border-b backdrop-blur-xl",
  container: "mx-auto flex max-w-7xl items-center justify-between px-4 py-4",
};
