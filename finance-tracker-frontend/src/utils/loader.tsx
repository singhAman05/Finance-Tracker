import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-4 w-4 border-2",
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
  xl: "h-16 w-16 border-4",
};

const textSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  fullScreen = false,
  className,
}) => {
  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className={cn(
          "rounded-full border-muted border-t-primary animate-spin",
          sizeMap[size]
        )}
      />

      {text && (
        <p
          className={cn("text-muted-foreground font-medium", textSizeMap[size])}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Loading data
            </p>
            <p className="text-xs text-muted-foreground">
              Please wait a moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return spinner;
};

export default Loader;
