import Image from "next/image"
import Link from "next/link"
import type { BrandHistoryEntry } from "@/lib/brand-history-types"

interface BrandHistorySectionProps {
  entry: BrandHistoryEntry
  imagePosition: "left" | "right"
  tone: "white" | "gray"
}

export function BrandHistorySection({ entry, imagePosition, tone }: BrandHistorySectionProps) {
  const heading = entry.heading ?? `History of ${entry.brand} Home Appliance`
  const bg = tone === "gray" ? "bg-neutral-50" : "bg-white"

  const imageBlock = (
    <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full">
      <Image
        src={entry.image}
        alt={entry.imageAlt ?? `${entry.brand} home appliances`}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    </div>
  )

  const textBlock = (
    <div className="flex flex-col justify-center px-6 py-10 md:px-16 md:py-16">
      <h2 className="text-xl font-bold text-neutral-900 md:text-2xl">
        {"History of "}
        <span className="text-blue-600">{entry.brand}</span>
        {" Home Appliance"}
      </h2>
      <div className="mt-4 space-y-4">
        {entry.paragraphs.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-neutral-600 md:text-base">
            {paragraph}
          </p>
        ))}
      </div>
      {entry.linkHref && (
        <p className="mt-4 text-sm text-neutral-600 md:text-base">
          For more information, go to{" "}
          <Link href={entry.linkHref} className="text-blue-600 hover:underline">
            {entry.linkLabel ?? entry.linkHref}
          </Link>
        </p>
      )}
    </div>
  )

  return (
    <section className={bg}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
        {imagePosition === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </section>
  )
}
