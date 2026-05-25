import {
  motion,
  useMotionValue,
  useTransform,
  useInView,
  useSpring,
  useMotionTemplate,
  useScroll,
  useReducedMotion,
  animate,
} from 'framer-motion'
import { useRef, useEffect, useState, useCallback } from 'react'
import {
  RiShieldCheckFill,
  RiSmartphoneLine,
  RiGlobalLine,
  RiArrowRightLine,
  RiMenuLine,
  RiCloseLine,
  RiStarFill,
  RiCheckLine,
  RiAppleLine,
  RiGooglePlayLine,
  RiLock2Line,
  RiBarChartLine,
  RiCustomerService2Line,
  RiLightbulbLine,
  RiPlantLine,
} from 'react-icons/ri'

const expo    = [0.16, 1, 0.3, 1]
const cinematic = [0.76, 0, 0.24, 1]

// ─── Reduced motion ──────────────────────────────────────────────
function useSafeReducedMotion() {
  const prefersReduced = useReducedMotion()
  return prefersReduced ?? false
}

// ─── Scroll Progress Bar ─────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduced = useSafeReducedMotion()
  if (reduced) return null
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-px z-[100] origin-left"
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, rgba(184,194,208,0.3) 0%, rgba(205,214,228,0.9) 50%, rgba(226,232,242,1) 100%)',
      }}
    />
  )
}

// ─── Masked Line Reveal ───────────────────────────────────────────
// Each line slides up from behind an overflow-hidden mask.
// Pass `inView` from parent to sync timing across multiple lines.
function MaskedLine({ children, delay = 0, inView, className = '' }) {
  const reduced = useSafeReducedMotion()
  return (
    <span className={`block overflow-hidden leading-[1.08] pb-[0.06em] ${className}`}>
      <motion.span
        className="block"
        initial={reduced ? false : { y: '108%', opacity: 0 }}
        animate={inView ? { y: '0%', opacity: 1 } : {}}
        transition={{ duration: 0.9, delay, ease: expo }}
      >
        {children}
      </motion.span>
    </span>
  )
}

// ─── Eyebrow draw animation ───────────────────────────────────────
function EyebrowReveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useSafeReducedMotion()
  return (
    <div ref={ref} className="flex items-center gap-3 mb-5">
      <motion.div
        className="h-px bg-platinum/40"
        initial={reduced ? false : { width: 0, opacity: 0 }}
        animate={inView ? { width: 24, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay, ease: cinematic }}
      />
      <motion.div
        initial={reduced ? false : { opacity: 0, x: -8 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.55, delay: delay + 0.15, ease: expo }}
        className="text-[11px] font-sans font-semibold tracking-[0.28em] uppercase text-platinum/50"
      >
        {children}
      </motion.div>
    </div>
  )
}

// ─── Section Heading with masked lines ───────────────────────────
function SectionHeading({ lines, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <h2
      ref={ref}
      className={`font-display font-light text-sand leading-[0.95] ${className}`}
      style={{ fontSize: 'clamp(38px, 5vw, 58px)' }}
    >
      {lines.map((line, i) => (
        <MaskedLine key={i} delay={delay + i * 0.12} inView={inView} className={line.className}>
          {line.text}
        </MaskedLine>
      ))}
    </h2>
  )
}

// ─── Reveal (generic) ────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', y = 20 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useSafeReducedMotion()
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: expo }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated Counter ────────────────────────────────────────────
function AnimatedCounter({ to, prefix = '', suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const nodeRef = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView || !nodeRef.current) return
    const node = nodeRef.current
    const ctrl = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { node.textContent = prefix + Math.round(v).toLocaleString() + suffix },
    })
    return () => ctrl.stop()
  }, [inView, to, prefix, suffix, duration])

  return <span ref={ref}><span ref={nodeRef}>{prefix}0{suffix}</span></span>
}

// ─── Credit Card — assembled with staggered parts ─────────────────
function CreditCard({ scale = 1, assemblyDelay = 0 }) {
  const cardRef = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const reduced = useSafeReducedMotion()

  const rotateX = useTransform(my, [-0.5, 0.5], [14, -14])
  const rotateY = useTransform(mx, [-0.5, 0.5], [-14, 14])
  const sx = useSpring(rotateX, { stiffness: 180, damping: 22 })
  const sy = useSpring(rotateY, { stiffness: 180, damping: 22 })

  const shimmerX = useTransform(mx, [-0.5, 0.5], [10, 90])
  const shimmerY = useTransform(my, [-0.5, 0.5], [10, 90])
  const shimmer = useMotionTemplate`radial-gradient(ellipse at ${shimmerX}% ${shimmerY}%, rgba(200,212,228,0.38) 0%, transparent 58%)`

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }, [mx, my])

  const handleMouseLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  const w = Math.round(320 * scale)
  const h = Math.round(200 * scale)
  const p = Math.round(24 * scale)

  // Each part has its own assembly offset
  const part = (dx, dy, d) =>
    reduced ? {} : {
      initial: { opacity: 0, x: dx, y: dy, filter: 'blur(2px)' },
      animate: { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.7, delay: assemblyDelay + 0.55 + d, ease: expo },
    }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1100px', width: w, height: h }}
      className="select-none"
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.86, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.95, delay: assemblyDelay + 0.3, ease: expo }}
        style={{
          rotateX: reduced ? 0 : sx,
          rotateY: reduced ? 0 : sy,
          transformStyle: 'preserve-3d',
          width: w, height: h,
          background: 'linear-gradient(145deg, #0A0818 0%, #130F28 50%, #0C0A1C 100%)',
          boxShadow: '0 40px 80px -16px rgba(0,0,0,0.9), 0 0 0 1px rgba(184,194,208,0.2), inset 0 1px 0 rgba(200,212,228,0.12)',
        }}
        className="rounded-[20px] relative overflow-hidden cursor-pointer"
      >
        {/* Shimmer overlay */}
        <motion.div className="absolute inset-0" style={{ background: shimmer }} />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(184,194,208,1) 1px, transparent 1px), linear-gradient(90deg, rgba(184,194,208,1) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
        }} />

        {/* Top edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-platinum/50 to-transparent" />

        {/* Content layer */}
        <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: p }}>

          {/* Top row */}
          <div className="flex items-start justify-between">
            {/* Logo */}
            <motion.div {...part(-14, 0, 0)}>
              <span className="font-display font-semibold text-sand/90" style={{ fontSize: Math.round(16 * scale), letterSpacing: '0.04em' }}>Fin</span>
              <span className="font-display font-semibold text-platinum" style={{ fontSize: Math.round(16 * scale), letterSpacing: '0.04em' }}>tech</span>
            </motion.div>

            {/* Contactless */}
            <motion.div {...part(14, 0, 0.08)}>
              <svg width={Math.round(22 * scale)} height={Math.round(22 * scale)} viewBox="0 0 22 22" fill="none" style={{ color: 'rgba(184,194,208,0.7)', marginTop: 2 }}>
                <path d="M11 3.5C15.69 3.5 19.5 7.31 19.5 12S15.69 20.5 11 20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M11 7C13.76 7 16 9.24 16 12S13.76 17 11 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M11 10.5C12.38 10.5 13.5 11.62 13.5 13S12.38 15.5 11 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </motion.div>
          </div>

          {/* Chip */}
          <motion.div {...part(-10, -6, 0.18)}>
            <div style={{
              width: Math.round(40 * scale), height: Math.round(30 * scale),
              borderRadius: Math.round(5 * scale),
              background: 'linear-gradient(135deg, #7A8898 0%, #CDD6E4 35%, #B8C2D0 65%, #8A9AAA 100%)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 4 }}>
                {[...Array(6)].map((_, i) => <div key={i} style={{ backgroundColor: 'rgba(40,60,80,0.35)', borderRadius: 1 }} />)}
              </div>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(40,60,80,0.25)', transform: 'translateY(-50%)' }} />
            </div>
          </motion.div>

          {/* Bottom: number + name/expiry */}
          <div>
            <motion.div {...part(0, 10, 0.28)}>
              <div className="text-sand/70 font-sans tracking-[0.22em] mb-3" style={{ fontSize: Math.round(13 * scale) }}>
                4289 •••• •••• 7741
              </div>
            </motion.div>
            <div className="flex justify-between items-end">
              <motion.div {...part(-8, 6, 0.36)}>
                <div className="text-sand/30 uppercase tracking-widest mb-0.5 font-sans" style={{ fontSize: Math.round(9 * scale) }}>Titular</div>
                <div className="text-sand/70 font-sans" style={{ fontSize: Math.round(12 * scale) }}>Alex Morgan</div>
              </motion.div>
              <motion.div {...part(8, 6, 0.38)}>
                <div className="text-sand/30 uppercase tracking-widest mb-0.5 font-sans text-right" style={{ fontSize: Math.round(9 * scale) }}>Vence</div>
                <div className="text-sand/70 font-sans" style={{ fontSize: Math.round(12 * scale) }}>12/29</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Características', 'Precios', 'Nosotros', 'Carreras']

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: expo }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-night/95 backdrop-blur-md border-b border-platinum/10' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-display text-[22px] font-semibold tracking-tight">
          Fin<span className="text-platinum">tech</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href="#" className="text-sm text-sand/40 hover:text-sand transition-colors duration-200 font-sans">{l}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <a href="#" className="text-sm text-sand/40 hover:text-sand transition-colors font-sans">Iniciar sesión</a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="bg-platinum text-night text-sm font-sans font-semibold px-5 py-2.5 rounded-full hover:bg-platinum-light transition-colors"
          >
            Obtén tu tarjeta →
          </motion.a>
        </div>
        <button className="md:hidden text-sand/60 p-1" onClick={() => setOpen(!open)}>
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {open ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
          </motion.div>
        </button>
      </div>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: expo }}
        className="md:hidden overflow-hidden bg-night-mid border-b border-platinum/10"
      >
        <div className="px-6 py-5 flex flex-col gap-4">
          {links.map((l) => <a key={l} href="#" className="text-sm text-sand/55 font-sans py-1">{l}</a>)}
          <a href="#" className="bg-platinum text-night text-sm font-sans font-semibold px-5 py-3 rounded-full text-center mt-1">
            Obtén tu tarjeta →
          </a>
        </div>
      </motion.div>
    </motion.header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const reduced = useSafeReducedMotion()

  // Parallax: card moves up faster than text
  const cardY    = useTransform(scrollYProgress, [0, 1], reduced ? [0,0] : [0, -120])
  const textY    = useTransform(scrollYProgress, [0, 1], reduced ? [0,0] : [0, -60])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  // Cursor spotlight
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const spotlight = useMotionTemplate`radial-gradient(700px circle at ${mouseX}px ${mouseY}px, rgba(184,194,208,0.045) 0%, transparent 75%)`

  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }, [mouseX, mouseY])

  // Trigger for hero text (fires immediately)
  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t) }, [])

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-night overflow-hidden flex items-center pt-16"
      onMouseMove={handleMouseMove}
    >
      {/* Dot grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.14]"
        style={{ opacity: bgOpacity }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(184,194,208,0.6) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
        }} />
      </motion.div>

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#06080A_80%)] pointer-events-none" />

      {/* Cursor spotlight */}
      {!reduced && (
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: spotlight }} />
      )}

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[600px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,194,208,0.06) 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-[1fr_500px] gap-12 items-center">

          {/* Left — text with parallax */}
          <motion.div style={{ y: textY }} className="max-w-xl">
            {/* Eyebrow badge */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: expo }}
              className="inline-flex items-center gap-2.5 border border-platinum/20 text-platinum text-xs font-sans font-semibold tracking-[0.18em] uppercase px-4 py-2 rounded-full mb-10 bg-platinum/5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-platinum animate-pulse" />
              Solicitudes abiertas ahora
            </motion.div>

            {/* Main headline — masked line reveal */}
            <h1
              className="font-display font-light leading-[0.93] tracking-tight text-sand mb-7"
              style={{ fontSize: 'clamp(52px, 7vw, 90px)' }}
            >
              {[
                { text: 'El dinero se mueve', cls: '' },
                { text: 'a la velocidad', cls: 'text-platinum' },
                { text: 'del pensamiento.', cls: '' },
              ].map((line, i) => (
                <span key={i} className="block overflow-hidden leading-[1.05] pb-[0.04em]">
                  <motion.span
                    className={`block ${line.cls}`}
                    initial={reduced ? false : { y: '110%', opacity: 0 }}
                    animate={heroVisible ? { y: '0%', opacity: 1 } : {}}
                    transition={{ duration: 1, delay: 0.2 + i * 0.13, ease: expo }}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: expo }}
              className="text-[17px] text-sand/45 font-sans leading-relaxed max-w-md mb-10"
            >
              Una nueva clase de tarjeta de crédito diseñada para la forma en que realmente vives.
              Sin cuota anual. Sin cargos por divisas. Sin sorpresas.
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: expo }}
              className="flex flex-wrap items-center gap-3 mb-12"
            >
              <motion.a
                href="#"
                whileHover={{ scale: 1.03, boxShadow: '0 0 32px -4px rgba(184,194,208,0.35)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="group flex items-center gap-2 bg-platinum text-night font-sans font-semibold px-8 py-4 rounded-full text-sm hover:bg-platinum-light transition-colors"
              >
                Solicitar ahora
                <RiArrowRightLine size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                className="text-sand/45 hover:text-sand font-sans text-sm px-6 py-4 rounded-full border border-sand/10 hover:border-sand/22 transition-all"
              >
                Cómo funciona
              </motion.a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex items-center gap-3.5"
            >
              <div className="flex -space-x-2.5">
                {['#4A5278','#3A3A6A','#5A3A7A','#6A4A70','#3A3878'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-night flex items-center justify-center text-white text-[10px] font-sans font-bold" style={{ backgroundColor: c }}>
                    {['A','J','M','P','S'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <RiStarFill key={i} size={11} className="text-platinum" />)}
                </div>
                <div className="text-xs text-sand/35 font-sans">Con la confianza de más de 50,000 clientes</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — card with parallax */}
          <motion.div style={{ y: cardY }} className="relative flex items-center justify-center lg:justify-end">
            <div className="absolute w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(184,194,208,0.06)' }} />

            <div className="relative z-10">
              {/* Float loop wraps assembled card */}
              <motion.div
                animate={reduced ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
              >
                <CreditCard scale={1.05} assemblyDelay={0} />

                {/* Badge: seguridad */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 1.4, ease: expo }}
                  className="absolute -left-4 top-6 bg-night-lift border border-platinum/15 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-platinum/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <RiShieldCheckFill size={16} className="text-platinum" />
                  </div>
                  <div>
                    <div className="text-[11px] font-sans font-semibold text-sand leading-none mb-0.5">Nivel bancario</div>
                    <div className="text-[10px] text-sand/35 font-sans">Cifrado 256-bit</div>
                  </div>
                </motion.div>

                {/* Badge: cashback */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 1.55, ease: expo }}
                  className="absolute -right-2 bottom-10 bg-night-lift border border-platinum/15 rounded-2xl shadow-xl px-4 py-3 min-w-[120px]"
                >
                  <div className="text-[10px] text-sand/35 font-sans mb-1">Cashback ganado</div>
                  <div className="font-display text-xl font-semibold text-sand leading-none mb-1">$124.50</div>
                  <div className="text-[10px] text-emerald-400 font-sans font-medium">↑ +5.2% este mes</div>
                </motion.div>

                {/* Badge: transfer */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 1.65, ease: expo }}
                  className="absolute -bottom-5 left-10 bg-platinum rounded-2xl px-4 py-3 shadow-lg"
                  style={{ boxShadow: '0 8px 32px -4px rgba(184,194,208,0.22)' }}
                >
                  <div className="text-[10px] text-night/55 font-sans mb-0.5">Transferencia instantánea</div>
                  <div className="text-[13px] font-sans font-semibold text-night">$2,400.00 enviado ✓</div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-platinum/25 to-transparent mx-auto"
        />
      </motion.div>
    </section>
  )
}

// ─── Ticker ───────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Sin cuota anual','Notificaciones instantáneas','5% cashback',
  'Aceptación global','Sin cargos por divisas','Bloqueo al instante',
  'Presupuesto inteligente','Aprobación en 30 segundos','Soporte 24/7','Tarjeta metal disponible',
]

function Ticker() {
  return (
    <div className="py-4 overflow-hidden border-y border-platinum/10 bg-night-mid">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
        className="flex gap-10 whitespace-nowrap will-change-transform"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 text-sm font-sans font-medium text-sand/32 tracking-wide">
            <span className="w-1 h-1 rounded-full bg-platinum/55 flex-shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────
const FEATURES = [
  { Icon: RiLightbulbLine, eyebrow: 'Transferencias instantáneas', title: 'Envía dinero antes de\nque el pensamiento se vaya.', desc: 'Transfiere fondos a cualquier persona, en cualquier lugar del mundo, en menos de tres segundos. Sin esperas, sin horarios de corte.', stat: '< 3s', statLabel: 'tiempo de transferencia', accent: '#B8C2D0', bg: 'rgba(184,194,208,0.07)' },
  { Icon: RiBarChartLine, eyebrow: 'Análisis inteligente', title: 'Tu dinero,\nfinalmente legible.', desc: 'Categorización automática, resúmenes semanales y alertas proactivas que te ayudan a gastar con más inteligencia, sin esfuerzo.', stat: '100%', statLabel: 'seguimiento automatizado', accent: '#7ABFA0', bg: 'rgba(122,191,160,0.07)' },
  { Icon: RiGlobalLine, eyebrow: 'Cobertura mundial', title: 'Sin fronteras\npara tu ambición.', desc: 'Aceptada en 195 países. Sin cargos por transacciones extranjeras. Tipos de cambio reales, sin comisiones ocultas, nunca.', stat: '195', statLabel: 'países aceptados', accent: '#8AAACE', bg: 'rgba(138,170,206,0.07)' },
  { Icon: RiCustomerService2Line, eyebrow: 'Siempre disponible', title: 'Un concierge\nen tu bolsillo.', desc: 'Personas reales, disponibles 24/7, por chat, teléfono o video. Sin bots, sin scripts, sin música de espera.', stat: '24/7', statLabel: 'soporte humano', accent: '#C4A898', bg: 'rgba(196,168,152,0.07)' },
]

function Features() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-50px' })

  return (
    <section className="py-32 bg-night" id="características">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headingRef} className="mb-20">
          <EyebrowReveal>Por qué Fintech</EyebrowReveal>
          <h2
            className="font-display font-light text-sand leading-[0.95] max-w-lg"
            style={{ fontSize: 'clamp(38px, 5vw, 58px)' }}
          >
            {['Diseñada sin', 'compromisos.'].map((line, i) => (
              <MaskedLine key={i} delay={0.1 + i * 0.13} inView={headingInView} className={i === 1 ? 'text-platinum' : ''}>
                {line}
              </MaskedLine>
            ))}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => {
            // Alternate: even cards from left, odd from right
            const xOffset = i % 2 === 0 ? -30 : 30
            return (
              <Reveal key={i} delay={i * 0.07} y={0}>
                <motion.div
                  initial={{ opacity: 0, x: xOffset, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, delay: i * 0.07, ease: expo }}
                  whileHover={{ y: -6, borderColor: 'rgba(184,194,208,0.22)' }}
                  className="border border-sand/6 rounded-2xl p-8 transition-colors duration-300 cursor-default"
                  style={{ background: 'linear-gradient(145deg, rgba(22,18,42,0.7), rgba(14,12,28,0.9))' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: f.bg }}>
                    <f.Icon size={20} style={{ color: f.accent }} />
                  </div>
                  <div className="text-[11px] font-sans font-semibold tracking-[0.22em] uppercase mb-2" style={{ color: f.accent }}>{f.eyebrow}</div>
                  <h3 className="font-display font-light text-sand leading-tight mb-4" style={{ fontSize: 'clamp(22px, 2.2vw, 28px)', whiteSpace: 'pre-line' }}>{f.title}</h3>
                  <p className="text-sm text-sand/42 font-sans leading-relaxed mb-7 max-w-xs">{f.desc}</p>
                  <div className="flex items-baseline gap-2.5 pt-6 border-t border-sand/6">
                    <span className="font-display font-light text-sand" style={{ fontSize: 'clamp(32px, 3.5vw, 42px)' }}>{f.stat}</span>
                    <span className="text-[11px] text-sand/28 font-sans tracking-widest uppercase">{f.statLabel}</span>
                  </div>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────
function Stats() {
  const STATS = [
    { to: 0, prefix: '$', suffix: '', label: 'Cuota anual', special: 'Cero' },
    { to: 5, prefix: '', suffix: '%', label: 'Cashback promedio' },
    { to: 195, prefix: '', suffix: '', label: 'Países aceptados' },
    { to: 50000, prefix: '', suffix: '+', label: 'Clientes satisfechos' },
  ]

  return (
    <section className="py-28 bg-night-lift border-y border-platinum/8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div>
                <div className="font-display font-light mb-2" style={{ fontSize: 'clamp(44px, 5vw, 64px)', color: '#CDD6E4' }}>
                  {s.special
                    ? <span>{s.special}</span>
                    : <AnimatedCounter to={s.to} prefix={s.prefix} suffix={s.suffix} />}
                </div>
                <div className="text-sand/35 font-sans text-sm tracking-wide">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Card Showcase — scroll-driven card presentation ───────────────
function CardShowcase() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] })
  const reduced = useSafeReducedMotion()

  // Card "presents itself": enters angled, straightens as you scroll into view
  const cardRotateX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [18, 0])
  const cardRotateY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-22, 0])
  const cardScale   = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.88, 1])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-50px' })

  return (
    <section ref={sectionRef} className="py-32 bg-night-mid overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div ref={headingRef}>
            <EyebrowReveal>La tarjeta</EyebrowReveal>
            <h2
              className="font-display font-light text-sand leading-[0.95] mb-6"
              style={{ fontSize: 'clamp(38px, 5vw, 58px)' }}
            >
              {['La tarjeta en sí', 'es una declaración.'].map((line, i) => (
                <MaskedLine key={i} delay={i * 0.13} inView={headingInView} className={i === 1 ? 'text-platinum' : ''}>
                  {line}
                </MaskedLine>
              ))}
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease: expo }}
              className="text-[15px] text-sand/45 font-sans leading-relaxed mb-10 max-w-md"
            >
              Verde bosque mate. Detalles grabados con láser. Fabricada con un 85% de materiales reciclados.
              Diseñada para sentirse tan bien en la mano como funciona en tu cartera.
            </motion.p>
            <div className="space-y-5">
              {[
                { Icon: RiShieldCheckFill, text: 'Chip EMV + sin contacto + tarjeta virtual incluida' },
                { Icon: RiLock2Line, text: 'Congela y descongela al instante desde la app' },
                { Icon: RiSmartphoneLine, text: 'Apple Pay y Google Pay desde el primer día' },
                { Icon: RiPlantLine, text: '85% materiales reciclados, envío carbono neutral' },
              ].map(({ Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: expo }}
                  className="flex items-center gap-3.5"
                >
                  <div className="w-8 h-8 bg-platinum/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-platinum" />
                  </div>
                  <span className="text-sm text-sand/50 font-sans">{text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scroll-driven card presentation */}
          <div className="flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-72 h-72 rounded-full blur-[90px]"
                style={{ background: 'rgba(184,194,208,0.06)' }}
              />
            </div>
            <div style={{ perspective: '1200px' }}>
              <motion.div
                style={{
                  rotateX: cardRotateX,
                  rotateY: cardRotateY,
                  scale: cardScale,
                  opacity: cardOpacity,
                }}
              >
                <motion.div
                  animate={reduced ? {} : { y: [0, -8, 0], rotate: [-0.8, 0.8, -0.8] }}
                  transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
                >
                  <CreditCard scale={1.15} assemblyDelay={0.4} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────
const PLANS = [
  { name: 'Starter', price: 'Gratis', period: '', tagline: 'Comienza a construir crédito, gana cashback, sin cuotas.', features: ['1% cashback en todas las compras','Tarjeta virtual al instante','Análisis de gastos básico','Soporte estándar por email','Bloqueo / desbloqueo de tarjeta'], cta: 'Comenzar gratis', highlight: false },
  { name: 'Black', price: '$15', period: '/mes', tagline: 'Para el financieramente intencional. Sin compromisos.', features: ['3% cashback en todo','Transferencias prioritarias al instante','Análisis avanzado de gastos','Concierge 24/7','Acceso a sala VIP (4×/año)','Sin cargos por divisas'], cta: 'Solicitar Black', highlight: true },
  { name: 'Elite', price: '$29', period: '/mes', tagline: 'Cuando el dinero es una herramienta, no una preocupación.', features: ['5% cashback ilimitado','Gestor de cuenta dedicado','Acceso ilimitado a salas VIP','Upgrades en hoteles y vuelos','Línea directa concierge 24/7','Tarjeta de metal grabada'], cta: 'Solicitar Elite', highlight: false },
]

function Pricing() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-50px' })

  return (
    <section className="py-32 bg-night" id="precios">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headingRef} className="mb-16 max-w-2xl">
          <EyebrowReveal>Precios</EyebrowReveal>
          <h2 className="font-display font-light text-sand leading-[0.95]" style={{ fontSize: 'clamp(38px, 5vw, 58px)' }}>
            {['Precios simples.', 'Sin nada oculto.'].map((line, i) => (
              <MaskedLine key={i} delay={i * 0.13} inView={headingInView} className={i === 1 ? 'text-platinum' : ''}>
                {line}
              </MaskedLine>
            ))}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.75, delay: i * 0.1, ease: expo }}
              whileHover={{ y: -10 }}
              className="relative rounded-3xl p-8 h-full flex flex-col border transition-all duration-300"
              style={plan.highlight ? {
                borderColor: 'rgba(184,194,208,0.3)',
                background: 'linear-gradient(145deg, #1A1530, #120F22)',
                boxShadow: '0 0 60px -10px rgba(184,194,208,0.1), inset 0 1px 0 rgba(184,194,208,0.08)',
              } : {
                borderColor: 'rgba(238,233,224,0.06)',
                background: 'linear-gradient(145deg, #120F22, #0E0C18)',
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="bg-platinum text-night text-[11px] font-sans font-bold px-4 py-1.5 rounded-full tracking-wide">Más popular</div>
                </div>
              )}
              <div className="mb-7">
                <div className={`text-[11px] font-sans font-semibold tracking-[0.25em] uppercase mb-3 ${plan.highlight ? 'text-platinum/60' : 'text-sand/28'}`}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`font-display font-light ${plan.highlight ? 'text-platinum-light' : 'text-sand'}`} style={{ fontSize: 'clamp(40px, 4vw, 52px)' }}>{plan.price}</span>
                  {plan.period && <span className="text-sm font-sans text-sand/30">{plan.period}</span>}
                </div>
                <p className="text-sm font-sans leading-relaxed text-sand/38">{plan.tagline}</p>
              </div>
              <div className="space-y-3 flex-1 mb-8">
                {plan.features.map((feat, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <RiCheckLine size={15} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-platinum' : 'text-sand/35'}`} />
                    <span className="text-sm font-sans leading-snug text-sand/50">{feat}</span>
                  </div>
                ))}
              </div>
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className={`block text-center text-sm font-sans font-semibold py-3.5 rounded-full transition-all ${
                  plan.highlight
                    ? 'bg-platinum text-night hover:bg-platinum-light'
                    : 'border border-sand/12 text-sand/50 hover:border-platinum/30 hover:text-platinum'
                }`}
              >
                {plan.cta}
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: 'Por fin una tarjeta que no me trata como un riesgo. Solo el cashback ya me ha pagado tres meses de suscripciones.', name: 'Sarah Chen', title: 'Diseñadora, San Francisco', color: '#4A5E78', initial: 'S' },
  { quote: 'Viajo constantemente por trabajo. No tener que pensar en cargos por divisas ni llamar para desbloquear la tarjeta es un cambio de vida.', name: 'Marcos Webb', title: 'Consultor, Londres', color: '#3A3A7A', initial: 'M' },
  { quote: 'El análisis de gastos me hizo ver que pagaba $400 al mes en suscripciones olvidadas. Cancelé ocho esa misma noche.', name: 'Priya Nair', title: 'Ingeniera de software, Bangalore', color: '#5A4870', initial: 'P' },
]

function Testimonials() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-50px' })

  return (
    <section className="py-32 bg-night-lift border-t border-platinum/8">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headingRef} className="mb-16">
          <EyebrowReveal>Lo que dicen</EyebrowReveal>
          <h2 className="font-display font-light text-sand leading-[0.95]" style={{ fontSize: 'clamp(38px, 5vw, 56px)' }}>
            {['Personas reales.', 'Resultados reales.'].map((line, i) => (
              <MaskedLine key={i} delay={i * 0.13} inView={headingInView} className={i === 1 ? 'text-platinum' : ''}>
                {line}
              </MaskedLine>
            ))}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: i * 0.13, ease: expo }}
              whileHover={{ y: -5, borderColor: 'rgba(184,194,208,0.18)' }}
              className="flex flex-col h-full border border-sand/6 rounded-2xl p-7 transition-all cursor-default"
              style={{ background: 'linear-gradient(145deg, rgba(22,18,42,0.8), rgba(14,12,28,0.95))' }}
            >
              <div className="flex gap-0.5 mb-6">
                {[...Array(5)].map((_, j) => <RiStarFill key={j} size={13} className="text-platinum/65" />)}
              </div>
              <blockquote className="font-display font-light text-sand/75 leading-snug mb-8 flex-1" style={{ fontSize: 'clamp(17px, 1.7vw, 21px)' }}>
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3.5 pt-6 border-t border-sand/8">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-sans font-bold flex-shrink-0" style={{ backgroundColor: t.color }}>
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-sans font-medium text-sand leading-none mb-1">{t.name}</div>
                  <div className="text-xs font-sans text-sand/30">{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────
const FAQS = [
  { q: '¿Cómo solicito la tarjeta?', a: 'Toca "Solicitar ahora", ingresa tu email e información básica, y recibirás una decisión en menos de 30 segundos. Sin consulta de crédito dura para la verificación inicial.' },
  { q: '¿De verdad no tiene cuota anual?', a: 'Correcto. El plan Starter es gratis para siempre. Black y Elite tienen cuota mensual, pero cero cuota anual, cero cargos ocultos y cero sorpresas en tu estado de cuenta.' },
  { q: '¿Cómo funciona el 5% de cashback?', a: 'Los titulares Elite ganan 5% en cada compra, acreditado mensualmente sin límite, sin categorías rotativas y sin mínimo de canje.' },
  { q: '¿Puedo usarla en el extranjero?', a: 'Sí, aceptada en 195 países con cero cargos por transacciones extranjeras y tipos de cambio reales. Bloquea o desbloquea remotamente en cualquier momento.' },
  { q: '¿Cuánto tarda en llegar la tarjeta física?', a: 'La tarjeta virtual está disponible de inmediato. La tarjeta física llega en 3 a 5 días hábiles, con envío express para titulares Elite.' },
]

function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section className="py-28 bg-night-mid border-t border-platinum/8">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal className="mb-12">
          <h2 className="font-display font-light text-sand leading-tight" style={{ fontSize: 'clamp(34px, 4vw, 48px)' }}>
            Preguntas frecuentes.
          </h2>
        </Reveal>
        <div>
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="border-t border-sand/7 last:border-b last:border-sand/7">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between py-6 text-left group">
                  <span className="font-sans font-medium text-sand/65 text-[15px] pr-8 group-hover:text-platinum transition-colors duration-200">{faq.q}</span>
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.25, ease: expo }} className="text-platinum/50 flex-shrink-0 text-2xl leading-none">+</motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ gridTemplateRows: open === i ? '1fr' : '0fr', opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: expo }}
                  style={{ display: 'grid' }}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-sand/42 font-sans leading-relaxed pb-6 pr-12">{faq.a}</p>
                  </div>
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────
function CTA() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-50px' })
  const reduced = useSafeReducedMotion()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSent(true)
    setTimeout(() => setSent(false), 3500)
    setEmail('')
  }

  return (
    <section className="py-32 bg-night relative overflow-hidden border-t border-platinum/8">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(184,194,208,0.055) 0%, transparent 70%)' }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-10">
          <motion.div
            animate={reduced ? {} : { y: [0, -6, 0], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
          >
            <CreditCard scale={0.85} assemblyDelay={0.2} />
          </motion.div>
        </div>

        <div ref={headingRef}>
          <h2
            className="font-display font-light text-sand leading-[0.93] mb-5"
            style={{ fontSize: 'clamp(42px, 6vw, 80px)' }}
          >
            {['¿Listo para repensar', 'tus finanzas?'].map((line, i) => (
              <MaskedLine key={i} delay={i * 0.15} inView={headingInView} className={i === 1 ? 'text-platinum' : ''}>
                {line}
              </MaskedLine>
            ))}
          </h2>
        </div>

        <Reveal delay={0.3}>
          <p className="text-[16px] text-sand/42 font-sans mb-12 max-w-lg mx-auto leading-relaxed">
            Únete a más de 50,000 personas que ya hicieron el cambio. Solicitar toma menos de 30 segundos.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-10">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex-1 bg-night-lift border border-sand/10 rounded-full px-6 py-3.5 text-sm font-sans text-sand placeholder:text-sand/22 outline-none focus:border-platinum/35 focus:ring-2 focus:ring-platinum/8 transition-all"
            />
            <motion.button
              type="submit" whileHover={{ scale: 1.02, boxShadow: '0 0 28px -4px rgba(184,194,208,0.28)' }} whileTap={{ scale: 0.97 }}
              className="bg-platinum text-night text-sm font-sans font-semibold px-8 py-3.5 rounded-full hover:bg-platinum-light transition-colors whitespace-nowrap"
            >
              {sent ? '✓ Ya estás en la lista' : 'Acceso anticipado'}
            </motion.button>
          </form>
          <div className="flex items-center justify-center gap-6">
            <motion.a href="#" whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-sand/30 hover:text-sand/65 transition-colors font-sans text-sm">
              <RiAppleLine size={18} /> App Store
            </motion.a>
            <div className="w-px h-3.5 bg-sand/10" />
            <motion.a href="#" whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-sand/30 hover:text-sand/65 transition-colors font-sans text-sm">
              <RiGooglePlayLine size={18} /> Google Play
            </motion.a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Producto: ['Características','Precios','Seguridad','Hoja de ruta','Novedades'],
    Empresa:  ['Nosotros','Blog','Carreras','Prensa','Socios'],
    Soporte:  ['Centro de ayuda','Contáctanos','Estado del servicio','Términos','Privacidad'],
  }
  return (
    <footer className="text-sand py-20 border-t border-platinum/8" style={{ backgroundColor: '#040608' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-2xl font-semibold mb-3 tracking-tight">
              Fin<span className="text-platinum">tech</span>
            </div>
            <p className="text-sm text-sand/28 font-sans leading-relaxed max-w-[200px]">
              La tarjeta construida para el futuro. Solicítala en 30 segundos.
            </p>
          </div>
          {Object.entries(cols).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-[11px] font-sans font-semibold tracking-[0.25em] uppercase text-platinum/35 mb-5">{cat}</div>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-sand/30 hover:text-sand/70 font-sans transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-platinum/8 flex flex-col md:flex-row justify-between gap-3">
          <div className="text-xs text-sand/18 font-sans">© 2026 Fintech Inc. Asegurado por FDIC. Todos los derechos reservados.</div>
          <div className="text-xs text-sand/18 font-sans">Hecho con intención.</div>
        </div>
      </div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="antialiased">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Ticker />
      <Features />
      <Stats />
      <CardShowcase />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
