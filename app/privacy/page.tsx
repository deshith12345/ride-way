const sections = [
  {
    title: "Information We Collect",
    text: "RideWay collects account details, contact information, booking records, payment references, and support messages needed to provide bus booking services.",
  },
  {
    title: "How We Use Information",
    text: "We use information to create bookings, issue tickets, verify passengers, support accounts, improve routes, prevent misuse, and keep the platform secure.",
  },
  {
    title: "Sharing and Processors",
    text: "We share only the details needed with payment processors, bus operators, drivers, and service providers who help operate RideWay.",
  },
  {
    title: "Your Choices",
    text: "You can update your profile from settings, request help from support, and ask us to review, correct, or delete eligible account information.",
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-600">Privacy</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Privacy Policy</h1>
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
