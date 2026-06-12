import Link from "next/link"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 px-4 py-20 text-white">
        <div className="container mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Contact</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">We are here to help before, during, and after the ride.</h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-300">
            Reach RideWay support for booking help, route questions, operator onboarding, or ticket issues.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid max-w-5xl gap-8 px-4 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          {[
            { icon: Phone, title: "Hotline", value: "+94 11 234 5678" },
            { icon: Mail, title: "Email", value: "support@rideway.lk" },
            { icon: MapPin, title: "Office", value: "Colombo, Sri Lanka" },
          ].map((item) => (
            <Card key={item.title} className="border-slate-100">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">{item.title}</p>
                  <p className="font-bold text-slate-900">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button asChild variant="outline" className="h-12 w-full rounded-xl font-bold">
            <Link href="/help"><MessageCircle className="mr-2 h-4 w-4" /> Visit Help Center</Link>
          </Button>
        </div>

        <Card className="border-slate-100 shadow-xl shadow-slate-200/60">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-black text-slate-900">Send a message</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">This form prepares your message in your email app.</p>
            <form action="mailto:support@rideway.lk" method="post" encType="text/plain" className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="name@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required placeholder="Booking, route, payment, or account help" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Tell us what happened and include your booking reference if you have one."
                />
              </div>
              <Button type="submit" className="h-12 rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
