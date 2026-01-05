import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Wifi, Clock, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export interface ErrorNotificationProps {
  title: string;
  message: string;
  details?: string;
  userAction?: string;
  isQuotaError?: boolean;
  isAuthError?: boolean;
  isServerError?: boolean;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  onAction?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  title,
  message,
  details,
  userAction,
  isQuotaError,
  isAuthError,
  isServerError,
  isNetworkError,
  isTimeoutError,
  onDismiss,
  onRetry,
  onAction,
  autoClose = true,
  autoCloseDuration = 8000,
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDuration, onDismiss]);

  if (!isVisible) return null;

  // Determine icon and color scheme based on error type
  let iconComponent = <AlertCircle size={20} />;
  let bgColor = "bg-red-50";
  let borderColor = "border-red-200";
  let titleColor = "text-red-800";
  let messageColor = "text-red-700";
  let buttonColor = "bg-red-100 hover:bg-red-200 text-red-800";

  if (isNetworkError || isTimeoutError) {
    iconComponent = <Wifi size={20} className="text-orange-600" />;
    bgColor = "bg-orange-50";
    borderColor = "border-orange-200";
    titleColor = "text-orange-800";
    messageColor = "text-orange-700";
    buttonColor = "bg-orange-100 hover:bg-orange-200 text-orange-800";
  } else if (isQuotaError) {
    iconComponent = <AlertTriangle size={20} className="text-amber-600" />;
    bgColor = "bg-amber-50";
    borderColor = "border-amber-200";
    titleColor = "text-amber-800";
    messageColor = "text-amber-700";
    buttonColor = "bg-amber-100 hover:bg-amber-200 text-amber-800";
  } else if (isAuthError) {
    iconComponent = <AlertCircle size={20} className="text-purple-600" />;
    bgColor = "bg-purple-50";
    borderColor = "border-purple-200";
    titleColor = "text-purple-800";
    messageColor = "text-purple-700";
    buttonColor = "bg-purple-100 hover:bg-purple-200 text-purple-800";
  } else if (isServerError) {
    iconComponent = <AlertCircle size={20} className="text-red-600" />;
    bgColor = "bg-red-50";
    borderColor = "border-red-200";
    titleColor = "text-red-800";
    messageColor = "text-red-700";
    buttonColor = "bg-red-100 hover:bg-red-200 text-red-800";
  }

  // Dark theme adjustments
  const isDark = theme === "dark";
  const darkBg = isDark ? "bg-slate-900/95 border-slate-700" : bgColor;
  const darkBorder = isDark ? "border-slate-700" : borderColor;
  const darkTitle = isDark ? "text-white" : titleColor;
  const darkMessage = isDark ? "text-slate-300" : messageColor;
  const darkButton = isDark
    ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
    : buttonColor;

  return (
    <div
      className={`
        fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md
        z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300
      `}
    >
      <div
        className={`
          border rounded-lg shadow-lg backdrop-blur-sm transition-all
          ${darkBg} ${darkBorder} border
        `}
      >
        <div className="p-4">
          {/* Header with icon and dismiss button */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-0.5">{iconComponent}</div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm ${darkTitle}`}>{title}</h3>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
              className={`flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity ${darkMessage}`}
              aria-label="Close error notification"
            >
              <X size={16} />
            </button>
          </div>

          {/* Message */}
          <p className={`text-sm mb-2 ${darkMessage}`}>{message}</p>

          {/* Details (if provided) */}
          {details && (
            <details className="mb-3">
              <summary
                className={`text-xs font-semibold cursor-pointer opacity-75 hover:opacity-100 ${darkMessage}`}
              >
                Lebih lanjut...
              </summary>
              <pre
                className={`
                  text-xs mt-2 p-2 rounded whitespace-pre-wrap word-break
                  ${
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-white/40 text-slate-700"
                  }
                `}
              >
                {details}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {onRetry && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  onRetry();
                }}
                className={`
                  px-3 py-1.5 rounded text-xs font-semibold
                  transition-colors
                  ${darkButton}
                `}
              >
                Coba Lagi
              </button>
            )}
            {userAction && onAction && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  onAction();
                }}
                className={`
                  px-3 py-1.5 rounded text-xs font-semibold
                  transition-colors
                  ${darkButton}
                `}
              >
                {userAction}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
