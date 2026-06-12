const sections = [
  {
    title: "Using RideWay",
    text: "You agree to provide accurate booking, passenger, and payment details. Tickets are valid only for the route, date, time, and seat shown at checkout.",
  },
  {
    title: "Bookings and Payments",
    text: "Fares are shown in LKR. A booking is confirmed after payment succeeds and the ticket is issued in your account or confirmation page.",
  },
  {
    title: "Passenger Responsibility",
    text: "Passengers should arrive before departure, carry any required identification, and follow driver and operator safety instructions during travel.",
  },
  {
    title: "Platform Availability",
    text: "RideWay works to keep services available, but routes, prices, bus assignments, and schedules can change because of operator, traffic, weather, or safety needs.",
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-600">Legal</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Terms of Service</h1>
          <p className="mt-4 text-slate-600">Last updated: June 12, 2026</p>
        </div>
      </section>
      <section className="container mx-auto max-w-3xl px-4 py-14">
        <div className="space-y-8">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
              <p className="mt-3 leading-8 text-slate-600">{section.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
