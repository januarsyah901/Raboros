import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface BackgroundPatternProps {
  children: React.ReactNode;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  children,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`relative min-h-screen pb-40 ${
        theme === "dark" ? "bg-slate-950" : "bg-white"
      }`}
    >
      {/* Background SVG Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: theme === "dark" ? 0.08 : 0.04 }}
        >
          {/* Gradient Definition */}
          <defs>
            <radialGradient id="grad1" cx="20%" cy="20%">
              <stop
                offset="0%"
                stopColor={theme === "dark" ? "#60a5fa" : "#3b82f6"}
              />
              <stop
                offset="100%"
                stopColor={theme === "dark" ? "#1e1b4b" : "#ffffff"}
              />
            </radialGradient>
          </defs>

          {/* Decorative circles and waves */}
          <circle cx="200" cy="150" r="300" fill="url(#grad1)" />
          <circle cx="1000" cy="600" r="350" fill="url(#grad1)" />

          {/* Wave pattern */}
          <path
            d="M 0,300 Q 300,250 600,300 T 1200,300 L 1200,800 L 0,800 Z"
            fill={theme === "dark" ? "#4f46e5" : "#93c5fd"}
            opacity="0.5"
          />

          {/* Additional decorative elements */}
          <path
            d="M 0,400 Q 300,350 600,400 T 1200,400"
            stroke={theme === "dark" ? "#818cf8" : "#60a5fa"}
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="relative z-0 max-w-5xl mx-auto">{children}</div>
    </div>
  );
};
