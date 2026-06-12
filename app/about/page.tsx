import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bus, MapPinned, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "Islandwide routes", value: "120+" },
  { label: "Fleet partners", value: "45+" },
  { label: "Support coverage", value: "24/7" },
]

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <Image
          src="/bus-exterior-v2.jpg"
          alt="RideWay bus on a Sri Lankan city route"
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
        <div className="container relative mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">About RideWay</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">A simpler way to move across Sri Lanka.</h1>
            <p className="mt-6 text-lg font-medium leading-8 text-slate-200">
              RideWay brings route search, seat selection, secure payments, driver tools, and ticket verification into one bus travel platform built for daily passengers and operators.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">
                <Link href="/routes">Browse Routes <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-white/30 bg-white/10 px-6 font-bold text-white hover:bg-white/20">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="text-4xl font-black text-slate-900">{stat.value}</div>
              <div className="mt-2 text-sm font-bold uppercase tracking-wider text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">What We Do</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Built for passengers, drivers, and fleet teams.</h2>
            <p className="mt-5 text-slate-600 leading-8">
              Passengers can discover trips and manage bookings. Drivers can view assigned journeys and validate tickets. Administrators can keep buses, routes, schedules, and users organized from one dashboard.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: MapPinned, title: "Route discovery", text: "Search trips by origin, destination, date, and route." },
              { icon: Bus, title: "Fleet visibility", text: "Track buses, schedules, drivers, and capacity." },
              { icon: ShieldCheck, title: "Secure booking", text: "Protected checkout and QR-based ticket validation." },
              { icon: Users, title: "Role-based tools", text: "Separate experiences for travellers, drivers, and admins." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 p-6 shadow-sm">
                <item.icon className="h-7 w-7 text-blue-600" />
                <h3 className="mt-4 font-black text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
