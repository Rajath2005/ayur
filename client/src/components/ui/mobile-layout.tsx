import React from "react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    showNav?: boolean;
}

export function MobileLayout({
    children,
    className,
    showNav = true,
    ...props
}: MobileLayoutProps) {
    return (
        <div
            className={cn(
                "min-h-[100dvh] w-full bg-background flex flex-col relative overflow-hidden",
                "pb-safe-bottom pt-safe-top", // Safe area padding
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
