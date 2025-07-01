"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionButtonProps } from "@/lib/types";

export function ActionButton({
  variant,
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  children,
  className,
}: ActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-black hover:bg-gray-800 text-white";
      case "secondary":
        return "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      default:
        return "bg-black hover:bg-gray-800 text-white";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-8 px-3 text-sm";
      case "lg":
        return "h-12 px-6 text-lg";
      default:
        return "h-10 px-4";
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        getVariantStyles(),
        getSizeStyles(),
        "transition-all duration-200 font-medium",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
