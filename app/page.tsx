import BackgroundSlider from "@/components/shared/BackgroundSlider";
import SearchWidget from "@/components/shared/SearchWidget";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  let userCount = 0;
  let routeCount = 0;
  let busCount = 0;
  try {
    const [u, r, b] = await Promise.all([
      prisma.user.count({ where: { role: "TRAVELLER" } }),
      prisma.route.count(),
      prisma.bus.count(),
    ]);
    userCount = u;
    routeCount = r;
    busCount = b;
  } catch (error) {
    console.error("Prisma connection failed:", error);
    // fallback values remain zero
  }

  const wallpapers = [
    "/bus-motion.jpg",
    "/bus-interior.jpg",
    "/hero-bg.jpg",
    "/city-traffic.jpg",
    "/bus-exterior-v2.jpg",
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Full-screen immersive with glassmorphism search
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <BackgroundSlider images={wallpapers} />

        {/* Extra gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950 z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-8 relative z-30 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-bold mb-8 animate-fade-in">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              Trusted by {(userCount + 50).toLocaleString()}+ travellers across Sri Lanka
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8">
              Your Journey{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Starts Here
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-500/40 to-cyan-400/40 blur-lg" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100/80 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
              Book bus tickets across Sri Lanka in seconds. Choose your seat,
              pay securely, and travel with confidence — all from your phone.
            </p>
          </div>

          {/* ── Search Widget (Glassmorphism Card) ──────────────────── */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[32px] border border-white/[0.12] p-3 shadow-2xl shadow-black/30">
              <div className="bg-white rounded-[26px] p-2 shadow-inner">
                <SearchWidget />
              </div>
            </div>
          </div>
        </div>

        {/* ── Floating Stats Bar ────────────────────────────────────── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-6">
          <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/[0.1] px-8 py-5 flex items-center justify-between gap-4">
            {[
              { value: `${(userCount + 50).toLocaleString()}+`, label: "Happy Travellers" },
              { value: `${routeCount}+`, label: "Routes Available" },
              { value: `${busCount}+`, label: "Buses in Fleet" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-center flex-1">
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] font-bold text-blue-200/60 uppercase tracking-[0.15em] mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS — Minimal 3-step visual
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-50 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-60" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-blue-600 font-black text-xs uppercase tracking-[0.25em] mb-4">
              Simple Process
            </p>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Book in 3 easy steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Search Routes",
                desc: "Enter your origin, destination, and travel date to discover available buses.",
                color: "from-blue-600 to-blue-500",
                shadow: "shadow-blue-200",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Select & Pay",
                desc: "Choose your preferred seats and pay securely with Stripe-powered checkout.",
                color: "from-violet-600 to-violet-500",
                shadow: "shadow-violet-200",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Travel Happy",
                desc: "Get your e-ticket with QR code. Just show it to the driver and enjoy the ride!",
                color: "from-emerald-600 to-emerald-500",
                shadow: "shadow-emerald-200",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-[32px] border border-slate-100 p-10 hover:border-slate-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Step number watermark */}
                <span className="absolute top-6 right-8 text-[80px] font-black text-slate-50 select-none leading-none group-hover:text-slate-100/80 transition-colors">
                  {item.step}
                </span>

                <div className={`relative z-10 inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 shadow-xl ${item.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>

                <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="relative z-10 text-slate-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES — Bento-grid layout
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-blue-600 font-black text-xs uppercase tracking-[0.25em] mb-4">
              Platform Features
            </p>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Built for modern travel
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* Feature cards */}
            {[
              {
                title: "Seat Selection",
                desc: "Interactive seat maps let you pick your exact preferred spot on the bus.",
                emoji: "💺",
                bg: "bg-blue-50 hover:bg-blue-100/80",
              },
              {
                title: "E-Tickets & QR",
                desc: "Digital tickets with scannable QR codes — no printing needed.",
                emoji: "🎫",
                bg: "bg-violet-50 hover:bg-violet-100/80",
              },
              {
                title: "Secure Payments",
                desc: "Stripe-powered checkout with bank-grade encryption on every transaction.",
                emoji: "🔒",
                bg: "bg-emerald-50 hover:bg-emerald-100/80",
              },
              {
                title: "Real-Time Updates",
                desc: "Get instant notifications about your trip status and any schedule changes.",
                emoji: "⚡",
                bg: "bg-amber-50 hover:bg-amber-100/80",
              },
              {
                title: "Easy Cancellation",
                desc: "Cancel upcoming trips with one click right from your dashboard.",
                emoji: "↩️",
                bg: "bg-rose-50 hover:bg-rose-100/80",
              },
              {
                title: "Multi-Role Platform",
                desc: "Dedicated dashboards for travellers, drivers, and administrators.",
                emoji: "👥",
                bg: "bg-cyan-50 hover:bg-cyan-100/80",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`group ${f.bg} rounded-[28px] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}
              >
                <span className="text-4xl mb-5 block group-hover:scale-110 transition-transform duration-300">
                  {f.emoji}
                </span>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          POPULAR ROUTES — Social proof section
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-blue-600 font-black text-xs uppercase tracking-[0.25em] mb-4">
              Popular Routes
            </p>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Most loved destinations
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              { from: "Colombo", to: "Kandy", time: "~3h 30m", price: "LKR 1,200", popular: true },
              { from: "Colombo", to: "Galle", time: "~2h 45m", price: "LKR 900" },
              { from: "Kandy", to: "Nuwara Eliya", time: "~2h 15m", price: "LKR 750" },
              { from: "Colombo", to: "Jaffna", time: "~7h", price: "LKR 3,500" },
            ].map((route, i) => (
              <Link
                key={i}
                href={`/routes`}
                className="group relative bg-white rounded-[28px] border border-slate-100 p-7 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {route.popular && (
                  <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-slate-300 uppercase tracking-[0.15em]">
                    {route.time}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                  {route.from}
                  <span className="text-slate-300 mx-2">→</span>
                  {route.to}
                </h3>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <span className="text-blue-600 font-black text-lg">{route.price}</span>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                    View trips →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA — Final call to action
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-blue-400 font-black text-xs uppercase tracking-[0.25em] mb-6">
              Start Your Journey
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-8">
              Ready to ride{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                smarter?
              </span>
            </h2>
            <p className="text-lg text-blue-200/70 font-medium max-w-xl mx-auto mb-12 leading-relaxed">
              Join thousands of travellers who trust RideWay for safe, comfortable,
              and affordable bus travel across Sri Lanka.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/routes">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-7 text-lg rounded-2xl font-black shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all hover:scale-105 active:scale-100"
                >
                  Browse Routes
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-10 py-7 text-lg rounded-2xl border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all font-bold"
                >
                  Create Account — It&apos;s Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-950 border-t border-white/5 py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                Ride<span className="text-blue-400">Way</span>
              </h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Sri Lanka&apos;s modern bus booking platform. Travel smarter, travel better.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-5">
                Travel
              </h4>
              <ul className="space-y-3">
                {["Search Routes", "Popular Trips", "Bus Operators"].map((item) => (
                  <li key={item}>
                    <Link href="/routes" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-5">
                Account
              </h4>
              <ul className="space-y-3">
                {["My Bookings", "Settings", "Manage Tickets"].map((item) => (
                  <li key={item}>
                    <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {["About Us", "Contact", "Terms of Service", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-slate-500 font-medium cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 font-medium">
              &copy; {new Date().getFullYear()} RideWay. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
