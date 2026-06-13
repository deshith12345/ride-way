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
        <div className={cn("absolute inset-0 z-0 bg-slate-950 overflow-hidden", className)}>
            {images.map((image, index) => (
                <img
                    key={image}
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-opacity duration-[3000ms] ease-in-out",
                        index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                    style={{
                        willChange: "opacity",
                        transform: "translateZ(0)"
                    }}
                />
            ))}
        </div>
    )
}
