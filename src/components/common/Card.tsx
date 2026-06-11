import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ children, className, hoverable = false }: CardProps) {
  return (
    <div className={cn("card-base", hoverable && "card-hover", className)}>
      {children}
    </div>
  );
}
