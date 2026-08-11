import { Truck, ShieldCheck, Award, Headphones, type LucideIcon } from "lucide-react"
import type { Feature } from "@/lib/types"

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  award: Award,
  headphones: Headphones,
}

export function FeaturesBar({ features }: { features: Feature[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {features.map((f) => {
          const Icon = iconMap[f.icon] ?? Award
          return (
            <div
              key={f.title}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/60"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-bold text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
