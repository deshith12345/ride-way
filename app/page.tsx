import Link from "next/link"
import {
  ArrowRight,
  Bus,
  Clock3,
  CreditCard,
  MapPinned,
  Navigation,
  QrCode,
  ShieldCheck,
  TicketCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

function formatDuration(minutes?: number | null) {
  if (!minutes) return "Time pending"

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!hours) return `${mins}m`
  if (!mins) return `${hours}h`
  return `${hours}h ${mins}m`
}

function formatFare(amount?: number | null) {
  if (amount === null || amount === undefined) return "Fare pending"
  return `LKR ${Math.round(amount).toLocaleString()} starting fare`
}

function formatPlace(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

const featureTiles = [
  {
    title: "Account-protected booking",
    text: "Travellers browse freely, then sign in before reserving and paying.",
    icon: ShieldCheck,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Card-ready checkout",
    text: "Visa and Mastercard validation keeps payment flow direct and familiar.",
    icon: CreditCard,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "QR boarding",
    text: "Digital tickets are built for quick driver verification at boarding.",
    icon: QrCode,
    tone: "bg-amber-50 text-amber-700",
  },
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
        take: 4,
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
    console.error("Failed to fetch homepage data:", error)
  }

  const marqueeRoutes = [...featuredRoutes, ...featuredRoutes]

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-white">
      <section
        className="relative overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat py-20 md:py-28"
        style={{ backgroundImage: "url('/bus-exterior-v2.jpg')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.9),rgba(15,23,42,0.74),rgba(15,23,42,0.34))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_85%_22%,rgba(14,165,233,0.22),transparent_25%)]" />
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
              <Navigation className="h-4 w-4 text-cyan-200" />
              <span className="text-sm font-medium text-white">Smart Bus Travel in Sri Lanka</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
              Book Bus Tickets{" "}
              <span className="gradient-text">Instantly</span>
              <br />
              Travel Seamlessly
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-100">
              RideWay connects travellers to published bus routes across Sri Lanka.
              Browse trips, reserve seats, and board with digital tickets - no queues, no hassle.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/routes">
                <Button size="lg" className="gradient-primary rounded-full px-8 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                  Find your route
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="rounded-full border-2 border-white/35 bg-white/10 px-8 text-white backdrop-blur-xl hover:bg-white/20 hover:text-white">
                  How it works
                </Button>
              </Link>
            </div>
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-center md:text-left">
              <div>
                <p className="text-3xl font-bold text-white">{travellerCount.toLocaleString()}</p>
                <p className="text-sm text-slate-200">Travellers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{routeCount.toLocaleString()}</p>
                <p className="text-sm text-slate-200">Bus routes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{busCount.toLocaleString()}</p>
                <p className="text-sm text-slate-200">Active buses</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{scheduledTripCount.toLocaleString()}</p>
                <p className="text-sm text-slate-200">Scheduled trips</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredRoutes.length > 0 && (
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Popular Routes</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Discover published routes from the RideWay schedule and move straight into available trips.
              </p>
            </div>
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
              <div className="flex w-max gap-6 animate-route-marquee">
              {marqueeRoutes.map((route, index) => {
                const nearestTrip = route.trips?.[0]
                const departureTime = nearestTrip?.departureTime
                const formattedDeparture = departureTime
                  ? new Intl.DateTimeFormat("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    }).format(new Date(departureTime))
                  : "Check schedule"

                return (
                  <Link
                    key={`${route.id}-${index}`}
                    href={`/search?from=${encodeURIComponent(route.origin)}&to=${encodeURIComponent(route.destination)}`}
                    className="group relative min-w-[300px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:min-w-[360px]"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 className="h-4 w-4" />
                          <span>{formatDuration(route.estimatedDuration)}</span>
                        </div>
                        {nearestTrip && (
                          <div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                            Next: {formattedDeparture}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{formatPlace(route.origin)}</p>
                        </div>
                        <Bus className="h-5 w-5 shrink-0 text-blue-400" />
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-900">{formatPlace(route.destination)}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t pt-4">
                        <p className="text-sm font-semibold text-blue-600">{formatFare(nearestTrip?.basePrice)}</p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-transform group-hover:translate-x-1">
                          View trips <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="how-it-works" className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Book in Minutes</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              A simple, secure, and fast way to book your bus tickets online.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
                <MapPinned className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">1. Browse Routes</h3>
              <p className="mt-2 text-slate-600">Open the route list and find published trips for your journey.</p>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
                <TicketCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">2. Select & Pay</h3>
              <p className="mt-2 text-slate-600">Choose a trip, reserve your seat, and pay securely by card.</p>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">3. Board with QR</h3>
              <p className="mt-2 text-slate-600">Show your QR code to the driver and enjoy a hassle-free journey.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Why Travel with RideWay?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              RideWay keeps public route discovery clean while booking, payment, and tickets stay protected.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featureTiles.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.tone}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-primary rounded-3xl p-10 text-center text-white shadow-xl md:p-16">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to hit the road?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100">
              Create an account to keep your bookings, tickets, and traveller details together.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="rounded-full bg-white px-8 text-blue-600 shadow-lg transition-all hover:scale-105 hover:bg-slate-100 hover:shadow-xl">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
