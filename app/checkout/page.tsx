"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, CreditCard, Loader2, LockKeyhole, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getCardBrand, isValidExpiry, isValidLuhn } from "@/lib/payments"

interface CheckoutSeat {
  seat: string
  name: string
  gender: "male" | "female"
  idNumber: string
  phone: string
}

interface Trip {
  id: string
  basePrice: number
  departureTime: string
  route: {
    origin: string
    destination: string
  }
  bus: {
    registrationNo: string
    type: string
  }
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripId = searchParams.get("tripId")
  const [trip, setTrip] = useState<Trip | null>(null)
  const [seats, setSeats] = useState<CheckoutSeat[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [payment, setPayment] = useState({
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  })

  useEffect(() => {
    const storedCheckout = window.sessionStorage.getItem("rideway_checkout")
    if (!tripId || !storedCheckout) {
      router.replace("/search")
      return
    }

    const parsedCheckout = JSON.parse(storedCheckout)
    if (parsedCheckout.tripId !== tripId || !Array.isArray(parsedCheckout.seats) || parsedCheckout.seats.length === 0) {
      router.replace(`/book/${tripId}`)
      return
    }

    setSeats(parsedCheckout.seats)

    const fetchTrip = async () => {
      try {
      const res = await fetch(`/api/trips/${tripId}`, { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Trip not found")
        setTrip(data)
      } catch (err: any) {
        setError(err.message || "Unable to load checkout")
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [router, tripId])

  const brand = getCardBrand(payment.cardNumber)
  const serviceFee = seats.length > 0 ? 150 : 0
  const total = useMemo(() => (trip ? seats.length * trip.basePrice + serviceFee : 0), [serviceFee, seats.length, trip])

  const handlePay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!brand) {
      setError("Only Visa and Mastercard are supported.")
      return
    }

    if (!isValidLuhn(payment.cardNumber) || !isValidExpiry(payment.expiry) || !/^\d{3,4}$/.test(payment.cvv)) {
      setError("Please enter valid card details.")
      return
    }

    setProcessing(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          seats,
          payment: {
            ...payment,
            brand,
            cardNumber: payment.cardNumber.replace(/\D/g, ""),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")

      window.sessionStorage.removeItem("rideway_checkout")
      router.replace(`/bookings/success?booking_id=${data.bookingId}`)
    } catch (err: any) {
      setError(err.message || "Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-black text-slate-900">Checkout unavailable</h1>
        <p className="text-slate-500 font-medium">{error || "Please return to booking and try again."}</p>
        <Button onClick={() => router.push("/search")} className="rounded-xl bg-blue-600 text-white">Back to Search</Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <button onClick={() => router.push(`/book/${trip.id}`)} className="mb-8 inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to seat selection
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100 p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Secure Card Payment</p>
                  <CardTitle className="mt-2 text-3xl font-black text-slate-900">Visa / Mastercard</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge className="rounded-xl bg-blue-50 px-3 py-1.5 font-black text-blue-700">VISA</Badge>
                  <Badge className="rounded-xl bg-orange-50 px-3 py-1.5 font-black text-orange-700">MASTERCARD</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handlePay} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    required
                    value={payment.cardholderName}
                    onChange={(event) => setPayment({ ...payment, cardholderName: event.target.value })}
                    placeholder="Name on card"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      required
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={payment.cardNumber}
                      onChange={(event) => setPayment({ ...payment, cardNumber: formatCardNumber(event.target.value) })}
                      placeholder="4111 1111 1111 1111"
                      className="h-12 rounded-xl pr-28 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                      {brand || "VISA / MC"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      required
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={payment.expiry}
                      onChange={(event) => setPayment({ ...payment, expiry: formatExpiry(event.target.value) })}
                      placeholder="MM/YY"
                      className="h-12 rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      required
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      value={payment.cvv}
                      onChange={(event) => setPayment({ ...payment, cvv: event.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="123"
                      className="h-12 rounded-xl font-mono"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
                    {error}
                  </div>
                )}

                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="mt-0.5 h-5 w-5 text-blue-600" />
                    <p className="font-medium leading-6">
                      Card numbers are validated for this booking flow and are never stored in the database.
                    </p>
                  </div>
                </div>

                <Button disabled={processing} className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-black text-white hover:bg-blue-700">
                  {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CreditCard className="mr-2 h-5 w-5" /> Pay LKR {total.toLocaleString()}</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50">
            <CardHeader className="bg-slate-900 p-8 text-white rounded-t-3xl">
              <CardTitle className="text-2xl font-black">Order Summary</CardTitle>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-200">
                <ShieldCheck className="h-4 w-4" /> Protected checkout session
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Route</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{trip.route.origin} to {trip.route.destination}</h2>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {format(new Date(trip.departureTime), "EEE, dd MMM yyyy")} at {format(new Date(trip.departureTime), "hh:mm a")}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Passengers</p>
                <div className="space-y-3">
                  {seats.map((seat) => (
                    <div key={seat.seat} className="flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-700">{seat.name}</span>
                      <Badge className="bg-blue-600 text-white">Seat {seat.seat}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Seats ({seats.length})</span>
                  <span className="font-black text-slate-900">LKR {(seats.length * trip.basePrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Service fee</span>
                  <span className="font-black text-slate-900">LKR {serviceFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-3xl font-black text-blue-600">LKR {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
