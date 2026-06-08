"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface BackgroundSliderProps {
    images: string[]
    interval?: number
    className?: string
}

export default function BackgroundSlider({
    images,
    interval = 10000,
    className
}: BackgroundSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (images.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, interval)

        return () => clearInterval(timer)
    }, [images.length, interval])

    return (
        <div className={cn("absolute inset-0 -z-10 bg-slate-950 overflow-hidden", className)}>
            {images.map((image, index) => (
                <div
                    key={image}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-[3000ms] ease-in-out bg-cover bg-center bg-no-repeat",
                        index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                    style={{
                        backgroundImage: `url(${image})`,
                        willChange: "opacity",
                        transform: "translateZ(0)"
                    }}
                />
            ))}
            {/* Dark Overlay Gradient - Stable Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/50 to-transparent z-30 pointer-events-none" />
        </div>
    )
}
