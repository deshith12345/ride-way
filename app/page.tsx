import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Bus,
  CalendarCheck,
  CreditCard,
  MapPinned,
  QrCode,
  Route,
  ShieldCheck,
} from "lucide-react"
import BackgroundSlider from "@/components/shared/BackgroundSlider"
import SearchWidget from "@/components/shared/SearchWidget"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

const popularRoutes = [
  { from: "Colombo", to: "Kandy", time: "3h 30m", fare: "LKR 1,200", image: "/city-traffic.jpg" },
  { from: "Colombo", to: "Galle", time: "2h 45m", fare: "LKR 900", image: "/bus-motion.jpg" },
  { from: "Kandy", to: "Nuwara Eliya", time: "2h 15m", fare: "LKR 750", image: "/hero-light.jpg" },
]

const steps = [
  {
    title: "Find the right bus",
    text: "Search available trips by origin, destination, and travel date.",
    icon: Route,
  },
  {
    title: "Pick your seat",
    text: "Choose seats, add passenger details, and review the total before paying.",
    icon: CalendarCheck,
  },
  {
    title: "Board with QR",
    text: "Get a digital ticket that drivers can verify at boarding.",
    icon: QrCode,
  },
]

const guarantees = [
  { label: "Visa / Mastercard", icon: CreditCard },
  { label: "QR e-tickets", icon: BadgeCheck },
  { label: "Role-secured portals", icon: ShieldCheck },
]

const heroWallpapers = [
  "/bus-exterior-v2.jpg",
  "/bus-motion.jpg",
  "/city-traffic.jpg",
  "/bus-interior.jpg",
]

export default async function Home() {
  let userCount = 0
  let routeCount = 0
  let busCount = 0

  try {
    const [users, routes, buses] = await Promise.all([
      prisma.user.count({ where: { role: "TRAVELLER" } }),
      prisma.route.count(),
      prisma.bus.count(),
    ])
    userCount = users
    routeCount = routes
    busCount = buses
  } catch (error) {
    console.error("Prisma connection failed:", error)
  }

  const stats = [
    { value: `${(userCount + 50).toLocaleString()}+`, label: "Travellers" },
    { value: `${routeCount}+`, label: "Routes" },
    { value: `${busCount}+`, label: "Buses" },
    { value: "24/7", label: "Support" },
  ]

  return (
    <main className="bg-white text-slate-950">
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-slate-950">
        <BackgroundSlider images={heroWallpapers} interval={7000} className="z-0" />
        <div className="absolute inset-0 z-10 bg-black/55" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-white to-transparent" />

        <div className="container relative z-20 mx-auto flex min-h-[calc(100svh-4rem)] flex-col justify-center px-4 py-16">
          <div className="max-w-3xl pt-8 text-white">
            <div className="mb-5 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] backdrop-blur">
              <Bus className="h-4 w-4 text-cyan-200" />
              Bus booking across Sri Lanka
            </div>
            <h1 className="text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
              RideWay
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-100 sm:text-xl">
              Search routes, reserve seats, pay by card, and carry your e-ticket from one calm travel dashboard.
            </p>
          </div>

          <div className="mt-10 max-w-5xl border border-white/20 bg-white/95 p-3 shadow-2xl shadow-black/30 backdrop-blur">
            <SearchWidget />
          </div>

          <div className="mt-8 grid max-w-5xl grid-cols-2 border border-white/15 bg-black/25 backdrop-blur md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border-white/15 p-4 text-white md:border-r md:last:border-r-0">
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
        <Image
          src="/city-traffic.jpg"
          alt="City traffic wallpaper"
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="container relative mx-auto grid gap-8 px-4 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Popular corridors</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
              Fast starts for familiar routes.
            </h2>
            <p className="mt-4 max-w-sm font-medium leading-7 text-slate-300">
              Choose a known route and jump straight into available trips, seat choices, and card checkout.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {popularRoutes.map((route) => (
              <Link
                key={`${route.from}-${route.to}`}
                href={`/search?from=${route.from}&to=${route.to}`}
                className="group overflow-hidden border border-white/15 bg-white shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/3]">
                  <Image src={route.image} alt={`${route.from} to ${route.to}`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-slate-950">
                      {route.from} to {route.to}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-blue-600 transition group-hover:translate-x-1" />
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-500">{route.time} from {route.fare}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">How it works</p>
              <h2 className="mt-3 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                Built around the booking, not around paperwork.
              </h2>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">
                RideWay keeps the public travel experience simple while driver and admin tools stay separated behind protected subdomains.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {guarantees.map((item) => (
                  <div key={item.label} className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                    <item.icon className="h-4 w-4 text-blue-600" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex h-11 w-11 items-center justify-center bg-blue-600 text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden border border-slate-200">
            <Image
              src="/bus-interior.jpg"
              alt="Comfortable bus interior"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">Travel confidence</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              The details passengers check before they pay.
            </h2>
            <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {[
                ["Clear route timing", "Departure times, arrival estimates, bus type, and route details stay visible before checkout."],
                ["Seat-first booking", "Passengers choose exact seats and enter passenger details before the payment page."],
                ["Simple card checkout", "Visa and Mastercard validation happens in the RideWay checkout flow."],
              ].map(([title, text]) => (
                <div key={title} className="grid gap-3 py-5 sm:grid-cols-[180px_1fr]">
                  <h3 className="font-black text-slate-950">{title}</h3>
                  <p className="font-medium leading-7 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 bg-blue-600 px-6 font-black text-white hover:bg-blue-700">
                <Link href="/routes">
                  Explore routes <MapPinned className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 border-slate-300 px-6 font-black">
                <Link href="/track">Track a bus</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <Image
          src="/hero-bg.jpg"
          alt="RideWay evening bus wallpaper"
          fill
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
        <div className="container relative mx-auto grid gap-8 px-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Ready when you are</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
              Plan the next ride from a cleaner, faster homepage.
            </h2>
            <p className="mt-5 max-w-2xl font-medium leading-8 text-slate-200">
              Start with a route search, compare trips, reserve seats, and keep your ticket ready on your phone.
            </p>
          </div>
          <Button asChild className="h-12 bg-white px-6 font-black text-slate-950 hover:bg-cyan-50">
            <Link href="/routes">
              Browse routes <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
