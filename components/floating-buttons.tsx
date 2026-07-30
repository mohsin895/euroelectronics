"use client"

import { useState, useEffect } from "react"
import { ArrowUp, MessageCircle } from "lucide-react"

export function FloatingButtons() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const whatsappMessage = encodeURIComponent("Hi! I'd like to know more about your services.")
    const whatsappHref = `https://wa.me/8801727742555?text=${whatsappMessage}`

    return (
        <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">
            {visible && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    aria-label="Scroll to top"
                    className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
            )}

            <div className="group relative">
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-card px-3 py-1.5 text-sm text-foreground shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 border border-border">
          Chat with us
        </span>


                <a href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="grid h-12 w-12 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:-translate-y-0.5"
                >
                <MessageCircle className="h-6 w-6" />
            </a>
        </div>
</div>
)
}