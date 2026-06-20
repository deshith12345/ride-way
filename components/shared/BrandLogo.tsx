import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
    href?: string
    variant?: "default" | "light"
    size?: "sm" | "md" | "lg"
    subtitle?: string
    showText?: boolean
    className?: string
    markClassName?: string
}

const sizeStyles = {
    sm: {
        mark: "h-8 w-8 rounded-lg",
        image: "h-full w-full",
        text: "text-xl",
        subtitle: "text-[9px]",
    },
    md: {
        mark: "h-10 w-10 rounded-xl",
        image: "h-full w-full",
        text: "text-2xl",
        subtitle: "text-[10px]",
    },
    lg: {
        mark: "h-12 w-12 rounded-2xl",
        image: "h-full w-full",
        text: "text-3xl",
        subtitle: "text-[10px]",
    },
}

export default function BrandLogo({
    href,
    variant = "default",
    size = "md",
    subtitle,
    showText = true,
    className,
    markClassName,
}: BrandLogoProps) {
    const styles = sizeStyles[size]
    const isLight = variant === "light"

    const content = (
        <div className={cn("flex items-center gap-3", className)}>
            <div
                className={cn(
                    "flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-lg shadow-blue-200/60",
                    isLight && "shadow-slate-950/20",
                    styles.mark,
                    markClassName
                )}
            >
                <img
                    src="/brand/rideway-logo.png"
                    alt="RideWay"
                    className={cn("object-contain", styles.image)}
                />
            </div>
            {showText && (
                <div className="min-w-0">
                    <div
                        className={cn(
                            "font-black leading-none tracking-tight text-slate-900",
                            isLight && "text-white",
                            styles.text
                        )}
                    >
                        RideWay
                    </div>
                    {subtitle && (
                        <div
                            className={cn(
                                "mt-1 flex items-center gap-1 font-black uppercase leading-none tracking-widest text-slate-400",
                                isLight && "text-white/70",
                                styles.subtitle
                            )}
                        >
                            <ShieldCheck className="h-2.5 w-2.5 text-blue-500" />
                            {subtitle}
                        </div>
                    )}
                </div>
            )}
        </div>
    )

    if (!href) return content

    return (
        <Link href={href} className="inline-flex">
            {content}
        </Link>
    )
}
