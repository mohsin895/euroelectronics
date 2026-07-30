'use client'

import { HeroCarousel } from './hero-carousel'
import { SideBanner } from './side-banner'

export function HeroSection() {
    return (
        <section className="relative w-full flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[68%]">
                <HeroCarousel />
            </div>

            <div className="relative w-full md:w-[32%]">
                <SideBanner />
            </div>
        </section>
    )
}