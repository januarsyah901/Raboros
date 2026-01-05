import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <main className="p-8 space-y-10">
      {children}
    </main>
  );
};
