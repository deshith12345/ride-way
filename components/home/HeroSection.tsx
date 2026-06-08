import BackgroundSlider from "@/components/shared/BackgroundSlider";
import SearchWidget from "@/components/shared/SearchWidget";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection({ wallpapers }: { wallpapers: string[] }) {
  return (
    <motion.section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <BackgroundSlider images={wallpapers} />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950 z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-30 pt-24 pb-32 text-center max-w-4xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-bold mb-8 animate-fade-in">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          Trusted by 50+ travellers across Sri Lanka
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8">
          Your Journey <span className="relative inline-block"><span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Starts Here</span><span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-500/40 to-cyan-400/40 blur-lg" /></span>
        </h1>
        <p className="text-lg sm:text-xl text-blue-100/80 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
          Book bus tickets across Sri Lanka in seconds. Choose your seat, pay securely, and travel with confidence — all from your phone.
        </p>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[32px] border border-white/[0.12] p-3 shadow-2xl shadow-black/30">
            <div className="bg-white rounded-[26px] p-2 shadow-inner">
              <SearchWidget />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
