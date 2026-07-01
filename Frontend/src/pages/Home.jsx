import React, { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function useScrollY() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return scrollY
}

function useFadeIn(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function Hero() {
  const scrollY = useScrollY()
  const bgY = scrollY * 0.4
  const contentY = scrollY * 0.25

  return (
    <section className="relative h-screen overflow-hidden flex flex-col bg-[#0a0a0a]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero.jpg'), linear-gradient(160deg, #0d1b2a 0%, #1a3a5c 50%, #0d2137 100%)",
          transform: `translateY(${bgY}px)`,
          willChange: "transform",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/0 to-black/60" />

      <div
        aria-hidden
        className="absolute -bottom-5 -left-2 -right-2 font-display font-extrabold text-white whitespace-nowrap opacity-[0.07] select-none pointer-events-none leading-[0.85]"
        style={{
          fontSize: "clamp(100px, 22vw, 220px)",
          letterSpacing: "-4px",
          transform: `translateY(${bgY * 0.3}px)`,
        }}
      >
        ReelEstate
      </div>

      <div
        className="relative z-10 mt-auto px-10 pb-[72px]"
        style={{ transform: `translateY(${contentY}px)`, willChange: "transform" }}
      >
        <p className="text-[11px] tracking-[3px] uppercase text-sky-300 font-medium mb-5">
          ● Property Discovery, Reimagined
        </p>

        <h1
          className="font-display font-extrabold text-white leading-[1.0] max-w-[700px] mb-7"
          style={{ fontSize: "clamp(40px, 7vw, 80px)", letterSpacing: "-2px" }}
        >
          Find your home<br />
          in <span className="text-sky-300">60 seconds.</span>
        </h1>

        <p className="text-white/55 text-base leading-[1.75] max-w-[360px] mb-10 font-light">
          Short-form video tours that show you what photos never could. Scroll, fall in love, move in.
        </p>

        <div className="flex gap-4 items-center">
          <a href="/feed" className="bg-white text-[#0d1b2a] px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide no-underline">
            Browse Properties
          </a>
          <a href="#" className="text-white/65 text-sm flex items-center gap-2.5 no-underline">
            <span className="w-9 h-9 border border-white/30 rounded-full flex items-center justify-center text-xs">
              ▶
            </span>
            See how it works
          </a>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/35 text-[10px] tracking-[2px] uppercase z-10">
        <div className="w-px h-9 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        Scroll
      </div>
    </section>
  )
}

function Editorial() {
  const [ref, visible] = useFadeIn()
  return (
    <section
      ref={ref}
      className={`px-10 pt-[120px] pb-20 bg-[#F5F3EF] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end max-w-[1100px]">
        <h2
          className="font-display font-extrabold text-[#111] leading-[1.05]"
          style={{ fontSize: "clamp(36px, 5.5vw, 62px)", letterSpacing: "-2px" }}
        >
          Real estate that moves you — <em className="italic text-[#1e4976]">literally.</em>
        </h2>

        <div>
          <p className="text-[11px] tracking-[3px] uppercase text-gray-500 font-medium mb-5">
            ● Our Mission
          </p>
          <p className="text-base leading-[1.8] text-gray-600 font-light mb-8">
            Static photos lie. Video doesn't. ReelEstate puts short-form property videos at the centre of your search — so you feel the space before you ever step inside.
          </p>
          <a href="#" className="text-sm font-semibold text-[#111] no-underline tracking-wide">
            How it works →
          </a>
        </div>
      </div>
    </section>
  )
}

function StatsStrip() {
  const [ref, visible] = useFadeIn()
  const stats = [
    { num: "2,400+", label: "Video listings live" },
    { num: "18 sec", label: "Avg. time to shortlist" },
    { num: "94%", label: "Buyers say video helped" },
  ]
  return (
    <div
      ref={ref}
      className={`border-t border-b border-[#e0ddd6] px-10 py-12 flex bg-[#F5F3EF] transition-all duration-700 delay-100 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex-1 ${i < stats.length - 1 ? "border-r border-[#e0ddd6]" : ""} ${
            i === 0 ? "pr-10" : i === stats.length - 1 ? "pl-10" : "px-10"
          }`}
        >
          <div className="font-display font-extrabold text-[#111] leading-none" style={{ fontSize: 52, letterSpacing: "-2px" }}>
            {s.num}
          </div>
          <div className="text-sm text-gray-500 mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function Features() {
  const [ref, visible] = useFadeIn()
  const cards = [
    { n: "01", icon: "🎬", title: "Video-first listings", desc: "Every property has a short-form video tour. No more guessing from four blurry photos." },
    { n: "02", icon: "⚡", title: "Swipe for Detailed View", desc: "Scroll your feed, swipe right on what you love. Your shortlist builds itself as you browse." },
    { n: "03", icon: "📍", title: "Neighbourhood feel", desc: "Street-level clips show the area, the vibe, the walk to the café — not just the four walls." },
  ]

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden px-10 py-[100px] bg-[#111] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div aria-hidden className="absolute -bottom-7 -left-2 font-display font-extrabold text-white opacity-[0.03] whitespace-nowrap select-none" style={{ fontSize: 200, letterSpacing: "-6px" }}>
        Reel
      </div>

      <p className="text-[11px] tracking-[3px] uppercase text-sky-300 font-medium mb-6">
        ● What makes us different
      </p>
      <h2
        className="font-display font-extrabold text-white leading-[1.05] max-w-[560px] mb-16"
        style={{ fontSize: "clamp(32px, 4.5vw, 54px)", letterSpacing: "-1.5px" }}
      >
        Built for the way people actually <span className="text-sky-300">search.</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
        {cards.map((c, i) => (
          <div
            key={c.title}
            className={`bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] px-8 py-10 transition-colors ${
              i === 0 ? "md:rounded-l-xl" : i === 2 ? "md:rounded-r-xl" : ""
            }`}
          >
            <div className="text-xs text-white/20 font-bold mb-7">{c.n}</div>
            <div className="w-10 h-10 rounded-[10px] bg-sky-300/15 flex items-center justify-center mb-5 text-lg">
              {c.icon}
            </div>
            <div className="font-display font-bold text-xl text-white mb-2.5" style={{ letterSpacing: "-0.5px" }}>
              {c.title}
            </div>
            <div className="text-sm text-white/45 leading-[1.75] font-light">{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  const [ref, visible] = useFadeIn()
  return (
    <section
      ref={ref}
      className={`px-10 py-[140px] text-center bg-[#F5F3EF] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <h2
        className="font-display font-extrabold text-[#111] leading-[0.95] mb-10"
        style={{ fontSize: "clamp(48px, 8vw, 96px)", letterSpacing: "-3px" }}
      >
        Your next home<br />
        is a <span className="italic text-[#1e4976]">reel</span><br />
        away.
      </h2>
      <p className="text-base text-gray-500 max-w-[400px] mx-auto mb-12 leading-[1.75] font-light">
        Join thousands who found their place by watching, not scrolling through photos.
      </p>
      <a href="/feed" className="inline-block bg-[#111] text-white px-10 py-[18px] rounded-full text-[15px] font-semibold tracking-wide no-underline">
        Start Browsing Free
      </a>
    </section>
  )
}

const Home = () => (
  <>
    <Navbar />
    <Hero />
    <Editorial />
    <StatsStrip />
    <Features />
    <CTA />
    <Footer />
  </>
)

export default Home