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
import SearchWidget from "@/components/shared/SearchWidget"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

function formatDuration(minutes?: number | null) {
  if (!minutes) return "Schedule pending"

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!hours) return `${mins}m`
  if (!mins) return `${hours}h`
  return `${hours}h ${mins}m`
}

function formatFare(amount?: number | null) {
  if (amount === null || amount === undefined) return "Fare updates soon"
  return `From LKR ${Math.round(amount).toLocaleString()}`
}

const bookingSteps = [
  {
    title: "Search",
    text: "Choose the route, date, and seat count in one clean panel.",
    icon: Route,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Reserve",
    text: "Pick exact seats and confirm passenger details before checkout.",
    icon: CalendarCheck,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Board",
    text: "Use the QR ticket on your phone when the driver checks boarding.",
    icon: QrCode,
    tone: "bg-amber-50 text-amber-700",
  },
]

const trustItems = [
  { label: "Visa / Mastercard", icon: CreditCard },
  { label: "Protected booking", icon: ShieldCheck },
  { label: "QR e-tickets", icon: BadgeCheck },
]

export default async function Home() {
  let travellerCount = 0
  let routeCount = 0
  let busCount = 0
  let scheduledTripCount = 0
  let featuredRoutes: {
    id: string
    origin: string
    destination: string
    estimatedDuration: number | null
    trips: { basePrice: number; departureTime: Date }[]
  }[] = []

  try {
    const now = new Date()
    const [travellers, routes, buses, scheduledTrips, routeCards] = await Promise.all([
      prisma.user.count({ where: { role: "TRAVELLER" } }),
      prisma.route.count(),
      prisma.bus.count({ where: { isActive: true } }),
      prisma.trip.count({ where: { status: "SCHEDULED", departureTime: { gte: now } } }),
      prisma.route.findMany({
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: {
          id: true,
          origin: true,
          destination: true,
          estimatedDuration: true,
          trips: {
            where: { status: "SCHEDULED", departureTime: { gte: now } },
            orderBy: { departureTime: "asc" },
            take: 1,
            select: {
              basePrice: true,
              departureTime: true,
            },
          },
        },
      }),
    ])

    travellerCount = travellers
    routeCount = routes
    busCount = buses
    scheduledTripCount = scheduledTrips
    featuredRoutes = routeCards
  } catch (error) {
    console.error("Home data unavailable:", error)
  }

  const stats = [
    { value: travellerCount.toLocaleString(), label: "Travellers" },
    { value: routeCount.toLocaleString(), label: "Routes" },
    { value: busCount.toLocaleString(), label: "Active buses" },
    { value: scheduledTripCount.toLocaleString(), label: "Scheduled trips" },
  ]

  return (
    <main className="overflow-hidden bg-[#f6f8fb] text-slate-950">
      <section
        className="relative min-h-[calc(100svh-4rem)] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bus-exterior-v2.jpg')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,24,0.28),rgba(7,12,24,0.56)_42%,rgba(246,248,251,0.98)_92%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.36),transparent_28%),radial-gradient(circle_at_86%_22%,rgba(56,189,248,0.22),transparent_26%)]" />

        <div className="container relative mx-auto flex min-h-[calc(100svh-4rem)] flex-col justify-center px-4 py-14">
          <div className="mx-auto max-w-5xl text-center text-white">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-2xl shadow-slate-950/15 backdrop-blur-2xl">
              <Bus className="h-4 w-4 text-white" />
              RideWay bus booking
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[0.96] tracking-normal drop-shadow-2xl sm:text-6xl lg:text-7xl">
              Book your next ride with a calmer flow.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-white/90 sm:text-xl">
              Find routes, choose seats, pay by card, and keep your QR ticket ready from one polished traveller experience.
            </p>
          </div>

          <div className="mx-auto mt-10 w-full max-w-6xl rounded-[2.25rem] border border-white/45 bg-white/82 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl">
            <SearchWidget />
          </div>

          <div className="mx-auto mt-6 flex flex-wrap justify-center gap-3">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-950/10 backdrop-blur-2xl"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative -mt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-3 rounded-[2.25rem] border border-white/80 bg-white/78 p-3 shadow-xl shadow-slate-200/70 backdrop-blur-2xl md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.7rem] bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
                <p className="text-3xl font-black text-slate-950">{stat.value}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.15em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-[2.5rem] border border-white bg-white/76 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Live schedule</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                  Routes published from your system.
                </h2>
              </div>
              <Button asChild variant="outline" className="h-12 rounded-full border-slate-200 bg-white px-6 font-black shadow-sm">
                <Link href="/routes">
                  View all routes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {featuredRoutes.length > 0 ? (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {featuredRoutes.map((route) => {
                  const nextTrip = route.trips[0]

                  return (
                    <Link
                      key={route.id}
                      href={`/search?from=${encodeURIComponent(route.origin)}&to=${encodeURIComponent(route.destination)}`}
                      className="group rounded-[2rem] border border-slate-100 bg-[#f9fbff] p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-blue-100/70"
                    >
                      <div className="mb-7 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-blue-100 text-blue-700">
                          <Bus className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-950">
                        {route.origin} to {route.destination}
                      </h3>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600 shadow-sm ring-1 ring-slate-100">
                          {formatDuration(route.estimatedDuration)}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100">
                          {formatFare(nextTrip?.basePrice)}
                        </span>
                      </div>
                      <p className="mt-5 text-sm font-medium leading-6 text-slate-500">
                        {nextTrip
                          ? `Next departure: ${nextTrip.departureTime.toLocaleDateString("en-LK", {
                              month: "short",
                              day: "numeric",
                            })}`
                          : "Trip times appear when schedules are published."}
                      </p>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-[#f9fbff] p-8 text-center">
                <p className="text-lg font-black text-slate-950">No routes published yet</p>
                <p className="mx-auto mt-2 max-w-xl font-medium leading-7 text-slate-600">
                  Add routes and schedules from the admin portal, and they will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pb-12 pt-4">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-3">
            {bookingSteps.map((step) => (
              <div key={step.title} className="rounded-[2rem] border border-white bg-white/78 p-6 shadow-lg shadow-slate-200/55 backdrop-blur-xl">
                <div className={`mb-8 flex h-12 w-12 items-center justify-center rounded-[1.25rem] ${step.tone}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">{step.title}</h3>
                <p className="mt-3 font-medium leading-7 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-6">
        <div className="container mx-auto px-4">
          <div className="rounded-[2.5rem] border border-white bg-white/78 p-8 shadow-xl shadow-blue-100/50 backdrop-blur-xl sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Secure booking</p>
                <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-normal text-slate-950 sm:text-5xl">
                  Guests can browse. Booking starts after sign in.
                </h2>
                <p className="mt-4 max-w-2xl font-medium leading-8 text-slate-600">
                  Every paid booking is tied to a traveller account, with passenger details and tickets kept behind authentication.
                </p>
              </div>
              <Button asChild className="h-12 rounded-full bg-blue-600 px-7 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
                <Link href="/routes">
                  Browse routes <MapPinned className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
