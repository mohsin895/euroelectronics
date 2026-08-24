"use client"

import { useEffect, useState } from "react"

interface BrandHistoryPagerProps {
  ids: string[]
}

export function BrandHistoryPager({ ids }: BrandHistoryPagerProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(sections.indexOf(visible.target as HTMLElement))
      },
      { threshold: 0.5 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [ids])

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {ids.map((id, i) => (
        <button
          key={id}
          type="button"
          aria-label={`Go to section ${i + 1}`}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
          className={`h-2 w-2 rounded-full transition-colors ${
            i === active ? "bg-red-500" : "bg-neutral-300"
          }`}
        />
      ))}
    </div>
  )
}
