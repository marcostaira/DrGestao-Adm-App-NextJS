"use client";

import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  showText = false,
  className = "",
}: LogoProps) {
  // Definir tamanhos
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return { width: 24, height: 24, textClass: "text-sm" };
      case "md":
        return { width: 32, height: 32, textClass: "text-base" };
      case "lg":
        return { width: 48, height: 48, textClass: "text-lg" };
      case "xl":
        return { width: 64, height: 64, textClass: "text-xl" };
      default:
        return { width: 32, height: 32, textClass: "text-base" };
    }
  };

  const { width, height, textClass } = getSizeClasses();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="DrGestão Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />

      {showText && (
        <span className={`font-bold text-[#008089] ${textClass}`}>
          DrGestão
        </span>
      )}
    </div>
  );
}
