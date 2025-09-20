import React from "react";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  fullScreen = false,
  className = "",
}) => {
  // Size configuration
  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Text size based on loader size
  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const loader = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse ${sizeClasses[size]} ${className}`}
      ></div>
      {text && (
        <p
          className={`font-medium text-gray-600 animate-pulse ${textSizeClasses[size]} mt-2`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          {loader}
          <div className="mt-4 text-center">
            <p className="text-gray-500 font-medium">Loading your content...</p>
            <p className="text-sm text-gray-400 mt-1">This won't take long</p>
          </div>
        </div>
      </div>
    );
  }

  return loader;
};

export default Loader;
