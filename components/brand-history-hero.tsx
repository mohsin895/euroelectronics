import Image from "next/image"

interface BrandHistoryHeroProps {
  image: string
  title?: string
}

export function BrandHistoryHero({ image, title = "Brand History" }: BrandHistoryHeroProps) {
  return (
    <section className="relative h-[280px] w-full overflow-hidden md:h-[340px]">
      <Image
        src={image}
        alt={title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-4">
          <div className="inline-block bg-white/70 px-10 py-8 backdrop-blur-sm md:px-16 md:py-10">
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">{title}</h1>
          </div>
        </div>
      </div>
    </section>
  )
}
