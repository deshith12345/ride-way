"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { MapPin, Clock, ArrowRight, Search as SearchIcon, Map, Filter, Loader2 } from "lucide-react"

interface Route {
  id: string;
  origin: string;
  destination: string;
  popular?: boolean;
  estimatedDuration: number;
  totalDistance: number;
  basePrice?: number;
  nextTripDate?: string | null;
}

const routeHeroImages = [
  {
    src: "/route-backgrounds/colombo-buddha-lake.jpg",
    alt: "Colombo lake and Buddha statues",
  },
  {
    src: "/route-backgrounds/galle-lighthouse.jpg",
    alt: "Galle lighthouse and coastal fort",
  },
]

export default function RoutesPage() {
  const [search, setSearch] = useState({ from: "", to: "" })
  const [allRoutes, setAllRoutes] = useState<Route[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [heroImageIndex, setHeroImageIndex] = useState(0)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch('/api/routes', { cache: 'no-store' })
        const data = await res.json()
        if (Array.isArray(data)) {
          setAllRoutes(data)
          setFilteredRoutes(data)
        }
      } catch (err) {
        console.error("Failed to fetch routes:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoutes()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % routeHeroImages.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [])

  const handleSearch = () => {
    const results = allRoutes.filter(route =>
      route.origin.toLowerCase().includes(search.from.toLowerCase()) &&
      route.destination.toLowerCase().includes(search.to.toLowerCase())
    )
    setFilteredRoutes(results)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Hero */}
      <div className="relative overflow-hidden py-24 text-white">
        <div className="absolute inset-0 z-0">
          {routeHeroImages.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${heroImageIndex === index ? "opacity-100" : "opacity-0"}`}
              alt={image.alt}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-slate-900/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md">Route Explorer</Badge>
            <h1 className="mb-6 text-4xl font-black tracking-tight drop-shadow-2xl lg:text-6xl">Discover Sri Lanka by Bus</h1>
            <p className="max-w-2xl text-xl font-semibold leading-8 text-white drop-shadow-lg">Connecting major cities across the island with reliable, comfortable, and affordable bus services.</p>
            <div className="mt-8 flex items-center gap-3">
              {routeHeroImages.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={`Show ${image.alt}`}
                  onClick={() => setHeroImageIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${heroImageIndex === index ? "w-10 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 mb-20">
        {/* Advanced Search Bar */}
        <Card className="rounded-3xl border-none shadow-2xl shadow-blue-900/10 p-2 mb-16 bg-white/90 backdrop-blur-xl">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="md:col-span-4 relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Origin City (e.g. Colombo)"
                className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-blue-500 transition-all border-none"
                value={search.from}
                onChange={e => setSearch({ ...search, from: e.target.value })}
              />
            </div>
            <div className="md:col-span-1 flex justify-center">
              <ArrowRight className="h-5 w-5 text-slate-300 hidden md:block" />
            </div>
            <div className="md:col-span-4 relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Destination (e.g. Kandy)"
                className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-blue-500 transition-all border-none"
                value={search.to}
                onChange={e => setSearch({ ...search, to: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={handleSearch}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <SearchIcon className="mr-2 h-5 w-5" /> Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            {filteredRoutes.length} Available Routes
          </h2>
          <Button variant="ghost" className="text-slate-500 font-bold flex items-center gap-2">
            <Filter className="h-4 w-4" /> Sort &amp; Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-slate-500 font-bold">Discovering routes...</p>
            </div>
          ) : (
            filteredRoutes.map(route => {
              const hasScheduledBus = route.basePrice !== null && route.basePrice !== undefined
              const bookingParams = new URLSearchParams({
                from: route.origin.toLowerCase(),
                to: route.destination.toLowerCase(),
              })
              if (route.nextTripDate) bookingParams.set("date", route.nextTripDate)

              return (
              <div key={route.id} className="group bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                      <MapPin className="h-7 w-7" />
                    </div>
                    {route.popular && (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">Popular</Badge>
                    )}
                  </div>

                  <div className="space-y-1 mb-8">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Route Details</p>
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      {route.origin} <ArrowRight className="h-5 w-5 text-blue-300" /> {route.destination}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-500 font-bold mb-10 pb-10 border-b border-slate-50">
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl"><Clock className="h-4 w-4 text-blue-500" /> {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m</span>
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl"><Map className="h-4 w-4 text-blue-500" /> {route.totalDistance}km</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Fare starts at</span>
                      <span className="text-2xl font-black text-blue-600">{hasScheduledBus ? `LKR ${route.basePrice}` : "No buses scheduled"}</span>
                    </div>
                    <Link
                      href={hasScheduledBus ? `/search?${bookingParams.toString()}` : "#"}
                      aria-disabled={!hasScheduledBus}
                      onClick={(event) => {
                        if (!hasScheduledBus) event.preventDefault()
                      }}
                    >
                      <Button disabled={!hasScheduledBus} className="bg-slate-900 text-white hover:bg-black h-14 px-8 rounded-2xl font-black shadow-lg shadow-slate-200 transition-all hover:-translate-x-1 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-4 border-dashed border-slate-100">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No routes found</h3>
            <p className="text-slate-500 font-medium">Try searching for different cities or broader terms.</p>
            <Button variant="link" className="text-blue-600 font-black mt-4" onClick={() => { setSearch({ from: "", to: "" }); setFilteredRoutes(allRoutes) }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
