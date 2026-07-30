import type { ReactNode } from "react"
import Link from "next/link"
import { rajdhani } from "@/lib/fonts"

interface AuthShellProps {
    eyebrow: string
    title: string
    description: string
    gaugeLabel: string
    /** 0–1, how far around the dial the needle sits for this step */
    gaugeValue: number
    children: ReactNode
}

const SWEEP_START = 130
const SWEEP_END = 410 // 280° total sweep, leaves a gap at the bottom
const REDLINE_FROM = 0.78 // last ~22% of the dial is the "redline" zone

function polar(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
    const start = polar(cx, cy, r, fromDeg)
    const end = polar(cx, cy, r, toDeg)
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

function Gauge({ value, label }: { value: number; label: string }) {
    const sweep = SWEEP_END - SWEEP_START
    const needleAngle = SWEEP_START + Math.min(Math.max(value, 0), 1) * sweep
    const redlineStart = SWEEP_START + REDLINE_FROM * sweep
    const needleTip = polar(100, 100, 64, needleAngle)

    const ticks = Array.from({ length: 11 }, (_, i) => {
        const angle = SWEEP_START + (i / 10) * sweep
        const outer = polar(100, 100, 76, angle)
        const inner = polar(100, 100, i % 5 === 0 ? 64 : 68, angle)
        const isRedline = angle >= redlineStart
        return { outer, inner, isRedline, key: i }
    })

    return (
        <div className="flex flex-col items-center gap-3" aria-hidden="true">
            <svg viewBox="0 0 200 130" className="w-40 sm:w-48">
                <path
                    d={arcPath(100, 100, 76, SWEEP_START, SWEEP_END)}
                    fill="none"
                    stroke="rgba(237,241,245,0.14)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d={arcPath(100, 100, 76, redlineStart, SWEEP_END)}
                    fill="none"
                    stroke="#FF5A1F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.55"
                />
                {ticks.map((t) => (
                    <line
                        key={t.key}
                        x1={t.inner.x}
                        y1={t.inner.y}
                        x2={t.outer.x}
                        y2={t.outer.y}
                        stroke={t.isRedline ? "#FF5A1F" : "rgba(237,241,245,0.35)"}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                ))}
                <line
                    x1="100"
                    y1="100"
                    x2={needleTip.x}
                    y2={needleTip.y}
                    stroke="#FF5A1F"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="4.5" fill="#FF5A1F" />
            </svg>
            <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8893A3]">Status</p>
                <p className={`${rajdhani.className} text-sm font-semibold uppercase tracking-[0.2em] text-[#EDF1F5]`}>
                    {label}
                </p>
            </div>
        </div>
    )
}

export function AuthShell({ eyebrow, title, description, gaugeLabel, gaugeValue, children }: AuthShellProps) {
    return (
        <div className={`${rajdhani.variable} min-h-screen bg-[#F4F5F7] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]`}>
            {/* Brand / signature panel */}
            <div className="relative flex flex-col justify-between overflow-hidden bg-[#11151B] px-6 py-8 text-[#EDF1F5] sm:px-10 lg:px-14 lg:py-12">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(115deg, transparent 0 64px, #EDF1F5 64px 65px)",
                    }}
                />

                <Link href="/" className="relative z-10 flex items-baseline gap-2">
                    <span className={`${rajdhani.className} text-2xl font-bold tracking-tight`}>Eggs </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#8893A3]">
                     & Spices
                    </span>
                </Link>

                <div className="relative z-10 mt-10 lg:mt-0">
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#FF5A1F]">{eyebrow}</p>
                    <h1 className={`${rajdhani.className} mt-3 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl`}>
                        {title}
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-[#A6AEBA] lg:text-base">
                        {description}
                    </p>
                </div>

                <div className="relative z-10 mt-10 hidden justify-end lg:mt-0 lg:flex">
                    <Gauge value={gaugeValue} label={gaugeLabel} />
                </div>
            </div>

            {/* Form panel */}
            <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    )
}
