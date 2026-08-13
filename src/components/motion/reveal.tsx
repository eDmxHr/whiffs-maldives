"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: 0 | 75 | 100 | 150 | 200 | 300 | 500
}

const delayClass = {
  0: "",
  75: "delay-75",
  100: "delay-100",
  150: "delay-150",
  200: "delay-200",
  300: "delay-300",
  500: "delay-500",
} as const

// Fades a section up into place the first time it crosses into the viewport. Kept deliberately
// simple (IntersectionObserver + tw-animate-css's animate-in utilities, already a dependency) --
// no new animation library for what's effectively a one-shot reveal.
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current

    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        visible ? cn("animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out", delayClass[delay]) : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  )
}
