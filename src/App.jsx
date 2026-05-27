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

// ─── Credit Card — Flip interactivo con cara frontal y trasera ──────
function CreditCard({ scale = 1, assemblyDelay = 0, interactive = false }) {
  const cardRef = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const reduced = useSafeReducedMotion()
  const [flipped, setFlipped] = useState(false)

  // tilt base desde mouse
  const tiltX = useTransform(my, [-0.5, 0.5], [12, -12])
  const tiltY = useTransform(mx, [-0.5, 0.5], [-12, 12])

  // flip base: 0 o 180
  const flipBase = useMotionValue(0)
  useEffect(() => {
    animate(flipBase, flipped ? 180 : 0, { duration: 0.75, ease: [0.76, 0, 0.24, 1] })
  }, [flipped, flipBase])

  const sTiltX = useSpring(tiltX, { stiffness: 200, damping: 26 })
  const sTiltY = useSpring(tiltY, { stiffness: 200, damping: 26 })
  // Combina flip + tilt: cuando está flipeado el tilt se desactiva
  const finalRotateY = useTransform(
    [flipBase, sTiltY],
    ([f, t]) => f + (f === 0 ? t : 0)
  )
  const finalRotateX = useTransform(
    [flipBase, sTiltX],
    ([f, t]) => f === 0 ? t : 0
  )

  // Shimmer holográfico — springs lentos para que vuelvan suavemente al centro
  const shimmerRawX = useTransform(mx, [-0.5, 0.5], [5, 95])
  const shimmerRawY = useTransform(my, [-0.5, 0.5], [5, 95])
  const shimmerX = useSpring(shimmerRawX, { stiffness: 60, damping: 18 })
  const shimmerY = useSpring(shimmerRawY, { stiffness: 60, damping: 18 })
  const shimmer1 = useMotionTemplate`radial-gradient(ellipse 70% 55% at ${shimmerX}% ${shimmerY}%, rgba(220,230,245,0.45) 0%, transparent 60%)`
  const shimmer2 = useMotionTemplate`radial-gradient(ellipse 40% 35% at ${shimmerX}% ${shimmerY}%, rgba(190,215,255,0.22) 0%, rgba(215,190,255,0.12) 40%, transparent 65%)`

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || flipped) return
    const r = cardRef.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }, [mx, my, flipped])

  const handleMouseLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])
  const handleClick = useCallback(() => { if (interactive) setFlipped(f => !f) }, [interactive])

  const w = Math.round(380 * scale)
  const h = Math.round(240 * scale)
  const p = Math.round(28 * scale)

  const part = (dx, dy, d) =>
    reduced ? {} : {
      initial: { opacity: 0, x: dx, y: dy, filter: 'blur(3px)' },
      animate: { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.75, delay: assemblyDelay + 0.5 + d, ease: expo },
    }

  // Cara frontal
  const CardFront = () => (
    <div
      className="absolute inset-0 rounded-[22px] overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #0D0B1F 0%, #16122E 30%, #1A1535 55%, #0E0B20 80%, #080714 100%)',
      }}
    >
      {/* Shimmer holográfico */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background: shimmer1 }} />
      <motion.div className="absolute inset-0 pointer-events-none mix-blend-screen" style={{ background: shimmer2 }} />

      {/* Textura diagonal sutil */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: 'repeating-linear-gradient(125deg, rgba(184,194,208,1) 0px, rgba(184,194,208,1) 1px, transparent 1px, transparent 28px)',
      }} />

      {/* Borde superior brillante */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(205,218,238,0.7) 30%, rgba(230,240,255,0.95) 50%, rgba(205,218,238,0.7) 70%, transparent 100%)',
      }} />
      {/* Borde izquierdo */}
      <div className="absolute top-0 left-0 bottom-0 w-px" style={{
        background: 'linear-gradient(180deg, rgba(220,232,250,0.5) 0%, rgba(184,194,208,0.15) 60%, transparent 100%)',
      }} />

      {/* Glow interno esquina superior derecha */}
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top right, rgba(184,200,230,0.18) 0%, transparent 65%)',
      }} />

      {/* Contenido */}
      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: p }}>
        {/* Fila superior */}
        <div className="flex items-start justify-between">
          <motion.div {...part(-16, 0, 0)}>
            <div style={{ fontSize: Math.round(18 * scale), letterSpacing: '0.06em', lineHeight: 1 }}>
              <span className="font-display font-semibold" style={{ color: 'rgba(238,233,224,0.92)' }}>FIN</span>
              <span className="font-display font-semibold" style={{ color: 'rgba(184,194,208,1)' }}>TECH</span>
            </div>
            <div style={{ fontSize: Math.round(8 * scale), letterSpacing: '0.3em', color: 'rgba(184,194,208,0.38)', fontFamily: 'sans-serif', marginTop: Math.round(3 * scale) }}>PLATINUM RESERVE</div>
          </motion.div>

          {/* Contactless icon */}
          <motion.div {...part(16, 0, 0.08)}>
            <svg width={Math.round(26 * scale)} height={Math.round(26 * scale)} viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(184,194,208,0.65)' }}>
              <path d="M12 4C16.97 4 21 8.03 21 13S16.97 22 12 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M12 7.5C15.17 7.5 17.75 10.08 17.75 13.25S15.17 19 12 19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M12 11C13.38 11 14.5 12.12 14.5 13.5S13.38 16 12 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </div>

        {/* Chip EMV */}
        <motion.div {...part(-12, -8, 0.16)} style={{ marginTop: Math.round(-4 * scale) }}>
          <div style={{
            width: Math.round(48 * scale), height: Math.round(36 * scale),
            borderRadius: Math.round(6 * scale),
            background: 'linear-gradient(135deg, #8A9BAC 0%, #D8E4F2 25%, #C8D6E8 45%, #B0C0D2 65%, #D4E0EE 80%, #9AAABB 100%)',
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 ${Math.round(2*scale)}px ${Math.round(6*scale)}px rgba(0,0,0,0.4)`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: Math.round(2.5 * scale), padding: Math.round(5 * scale) }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ backgroundColor: 'rgba(30,50,70,0.28)', borderRadius: Math.round(1.5 * scale) }} />
              ))}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(30,50,70,0.2)', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)' }} />
          </div>
        </motion.div>

        {/* Número + datos */}
        <div>
          <motion.div {...part(0, 12, 0.26)}>
            <div style={{
              fontFamily: 'monospace',
              letterSpacing: Math.round(3.5 * scale) + 'px',
              fontSize: Math.round(15 * scale),
              color: 'rgba(220,230,245,0.75)',
              marginBottom: Math.round(14 * scale),
              textShadow: '0 0 20px rgba(184,194,208,0.3)',
            }}>
              4289 •••• •••• 7741
            </div>
          </motion.div>
          <div className="flex justify-between items-end">
            <motion.div {...part(-10, 8, 0.34)}>
              <div style={{ fontSize: Math.round(8 * scale), letterSpacing: '0.28em', color: 'rgba(184,194,208,0.3)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: Math.round(3 * scale) }}>Titular</div>
              <div style={{ fontSize: Math.round(13 * scale), color: 'rgba(220,230,245,0.72)', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>ALEX MORGAN</div>
            </motion.div>
            <motion.div {...part(10, 8, 0.36)} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: Math.round(8 * scale), letterSpacing: '0.28em', color: 'rgba(184,194,208,0.3)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: Math.round(3 * scale) }}>Vence</div>
              <div style={{ fontSize: Math.round(13 * scale), color: 'rgba(220,230,245,0.72)', fontFamily: 'sans-serif' }}>12/29</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )

  // Cara trasera — shimmer siguiendo el mouse igual que el frente
  const CardBack = () => (
    <div
      className="absolute inset-0 rounded-[22px] overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        background: 'linear-gradient(160deg, #0E0B22 0%, #151130 35%, #1A1540 65%, #100D26 100%)',
      }}
    >
      {/* Shimmer dinámico — usa los mismos motion values que el frente, espejado */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background: shimmer1 }} />
      <motion.div className="absolute inset-0 pointer-events-none mix-blend-screen" style={{ background: shimmer2 }} />

      {/* Glow base fijo — da profundidad sin el mouse */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(125deg, transparent 20%, rgba(184,194,208,0.04) 45%, rgba(200,215,240,0.03) 55%, transparent 75%)',
      }} />

      {/* Bordes luminosos */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(184,194,208,0.55) 35%, rgba(210,225,250,0.8) 50%, rgba(184,194,208,0.55) 65%, transparent)',
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(184,194,208,0.2) 50%, transparent)',
      }} />
      <div className="absolute top-0 left-0 bottom-0 w-px" style={{
        background: 'linear-gradient(180deg, rgba(200,215,245,0.4) 0%, rgba(184,194,208,0.1) 60%, transparent 100%)',
      }} />

      {/* Banda magnética */}
      <div className="absolute left-0 right-0" style={{
        top: Math.round(36 * scale),
        height: Math.round(44 * scale),
        background: 'linear-gradient(180deg, #252525 0%, #111 50%, #1E1E1E 100%)',
        boxShadow: `0 ${Math.round(2*scale)}px ${Math.round(10*scale)}px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)`,
      }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)',
        }} />
      </div>

      {/* Firma + CVV */}
      <div className="absolute left-0 right-0" style={{ top: Math.round(104 * scale), padding: `0 ${p}px` }}>
        <div style={{
          height: Math.round(36 * scale),
          borderRadius: Math.round(3 * scale),
          background: 'linear-gradient(180deg, #EDEAE2 0%, #F5F0EA 50%, #E8E4DC 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: `0 ${Math.round(12 * scale)}px`,
          position: 'relative', overflow: 'hidden',
          boxShadow: `0 ${Math.round(2*scale)}px ${Math.round(6*scale)}px rgba(0,0,0,0.35)`,
        }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: Math.round(12*scale), right: Math.round(64*scale), height: 1, backgroundColor: 'rgba(80,80,80,0.15)', top: Math.round((6 + i * 4.2) * scale) }} />
          ))}
          <div style={{
            width: Math.round(46 * scale), height: Math.round(26 * scale),
            background: 'linear-gradient(145deg, #fff 0%, #f0f0f0 100%)',
            borderRadius: Math.round(3 * scale),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.15)',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: Math.round(12 * scale), color: '#1a1a2e', letterSpacing: '0.1em', fontWeight: 700 }}>737</span>
          </div>
        </div>
        <div style={{ fontSize: Math.round(7 * scale), color: 'rgba(184,194,208,0.28)', fontFamily: 'sans-serif', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: Math.round(5 * scale) }}>Código de seguridad (CVV)</div>
      </div>

      {/* Info inferior — logo red de pago derecha, datos izquierda */}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: `${Math.round(14*scale)}px ${p}px` }}>
        <div className="flex items-end justify-between">
          <div>
            <div style={{ fontSize: Math.round(6.5*scale), color: 'rgba(184,194,208,0.22)', fontFamily: 'sans-serif', lineHeight: 1.6, letterSpacing: '0.03em' }}>
              Válida hasta 12/29<br/>
              Propiedad de Fintech Inc.
            </div>
            <div style={{ marginTop: Math.round(5*scale), fontSize: Math.round(10*scale), color: 'rgba(184,194,208,0.42)', fontFamily: 'serif', letterSpacing: '0.14em', fontWeight: 300 }}>PLATINUM RESERVE</div>
          </div>
          {/* Dos círculos solapados — logo estilo Mastercard/red de pago */}
          <div style={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>
            <div style={{
              width: Math.round(26*scale), height: Math.round(26*scale), borderRadius: '50%',
              background: 'rgba(220,60,40,0.7)', marginRight: Math.round(-10*scale),
              boxShadow: `0 0 ${Math.round(6*scale)}px rgba(220,60,40,0.3)`,
            }} />
            <div style={{
              width: Math.round(26*scale), height: Math.round(26*scale), borderRadius: '50%',
              background: 'rgba(255,160,0,0.65)',
              boxShadow: `0 0 ${Math.round(6*scale)}px rgba(255,160,0,0.25)`,
            }} />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ perspective: '1400px', width: w, height: h }}
      className={`select-none ${interactive ? 'cursor-pointer' : ''}`}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.82, y: 24, rotateX: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.05, delay: assemblyDelay + 0.2, ease: expo }}
        style={{
          rotateX: reduced ? 0 : finalRotateX,
          rotateY: reduced ? 0 : finalRotateY,
          transformStyle: 'preserve-3d',
          width: w, height: h,
          position: 'relative',
          boxShadow: '0 50px 100px -20px rgba(0,0,0,0.95), 0 20px 40px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,194,208,0.18), 0 0 60px -20px rgba(184,194,208,0.12)',
          borderRadius: 22,
        }}
      >
        <CardFront />
        <CardBack />
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
        className="absolute inset-0"
        style={{ opacity: bgOpacity }}
      >
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(184,194,208,0.7) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </motion.div>

      {/* Líneas diagonales premium — muy sutiles */}
      <div className="absolute inset-0 opacity-[0.012]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(184,194,208,1) 0px, rgba(184,194,208,1) 1px, transparent 1px, transparent 60px)',
        }} />
      </div>

      {/* Radial vignette más profundo */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 20%, rgba(6,8,10,0.85) 75%, #06080A 100%)'
      }} />

      {/* Cursor spotlight — más intenso */}
      {!reduced && (
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: spotlight }} />
      )}

      {/* Ambient glow — triple capa */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[700px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,194,208,0.07) 0%, transparent 65%)' }} />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(130,150,200,0.04) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(184,194,208,0.04) 0%, transparent 70%)' }} />

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

          {/* Right — card con parallax */}
          <motion.div style={{ y: cardY }} className="relative flex flex-col items-center justify-center lg:justify-end gap-6">
            {/* Glow ambiente */}
            <div className="absolute w-[460px] h-[460px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(184,194,208,0.07)' }} />
            <div className="absolute w-[280px] h-[280px] rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(160,180,220,0.06)' }} />

            {/* Tarjeta flotante */}
            <div className="relative z-10">
              <motion.div
                animate={reduced ? {} : { y: [0, -12, 0] }}
                transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
              >
                <CreditCard scale={1.12} assemblyDelay={0} interactive={false} />
              </motion.div>
            </div>

            {/* Spec pills debajo — igual que en CardShowcase */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.5, ease: expo }}
              className="relative z-10 flex gap-3"
            >
              {[
                { label: 'Material', value: 'Metal' },
                { label: 'Cashback', value: '5%' },
                { label: 'Cuota anual', value: '$0' },
              ].map((spec, i) => (
                <SpecPill key={i} spec={spec} i={i} />
              ))}
            </motion.div>
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
    <div className="relative py-3.5 overflow-hidden border-y" style={{
      borderColor: 'rgba(184,194,208,0.1)',
      background: 'linear-gradient(180deg, rgba(14,12,28,0.95) 0%, rgba(10,8,20,0.98) 100%)',
    }}>
      {/* Fade masks en los bordes */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #06080A 0%, transparent 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(270deg, #06080A 0%, transparent 100%)' }} />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
        className="flex gap-12 whitespace-nowrap will-change-transform"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3.5 font-sans font-semibold tracking-[0.18em] uppercase"
            style={{ fontSize: 10, color: 'rgba(184,194,208,0.3)' }}>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(184,194,208,0.5)' }} />
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

function FeatureCard({ f, i, isActive, onClick }) {
  const reduced = useSafeReducedMotion()
  const xOffset = i % 2 === 0 ? -30 : 30
  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: i * 0.08, ease: expo }}
      onClick={onClick}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.985 }}
      className="relative border rounded-2xl p-8 cursor-pointer overflow-hidden"
      style={{
        background: isActive
          ? `linear-gradient(145deg, rgba(28,22,52,0.95), rgba(18,14,36,0.98))`
          : 'linear-gradient(145deg, rgba(22,18,42,0.7), rgba(14,12,28,0.9))',
        borderColor: isActive ? f.accent + '55' : 'rgba(238,233,224,0.06)',
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      {/* Glow de acento al activar */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(ellipse 60% 50% at 30% 30%, ${f.accent}18 0%, transparent 70%)` }}
      />

      {/* Ícono — escala al activar/hover */}
      <motion.div
        className="relative rounded-xl flex items-center justify-center mb-5"
        animate={{
          width: isActive ? 56 : 44,
          height: isActive ? 56 : 44,
          backgroundColor: isActive ? f.accent + '22' : f.bg,
          boxShadow: isActive ? `0 0 24px -4px ${f.accent}55` : 'none',
        }}
        transition={{ duration: 0.35, ease: expo }}
      >
        <motion.div
          animate={{ scale: isActive ? 1.3 : 1, rotate: isActive ? 8 : 0 }}
          transition={{ duration: 0.4, ease: expo }}
        >
          <f.Icon size={isActive ? 24 : 20} style={{ color: f.accent }} />
        </motion.div>
      </motion.div>

      <motion.div
        className="text-[11px] font-sans font-semibold tracking-[0.22em] uppercase mb-2"
        animate={{ opacity: isActive ? 1 : 0.6 }}
        style={{ color: f.accent }}
      >
        {f.eyebrow}
      </motion.div>

      <h3 className="font-display font-light text-sand leading-tight mb-4" style={{ fontSize: 'clamp(22px, 2.2vw, 28px)', whiteSpace: 'pre-line' }}>{f.title}</h3>

      {/* Descripción — aparece al activar */}
      <motion.p
        className="text-sm font-sans leading-relaxed max-w-xs"
        animate={{ opacity: isActive ? 1 : 0.45, height: 'auto' }}
        style={{ color: 'rgba(238,233,224,0.45)', marginBottom: 28 }}
      >
        {f.desc}
      </motion.p>

      <motion.div
        className="flex items-baseline gap-2.5 pt-6"
        style={{ borderTop: '1px solid rgba(238,233,224,0.06)' }}
      >
        <motion.span
          className="font-display font-light text-sand"
          animate={{ fontSize: isActive ? 'clamp(36px,4vw,48px)' : 'clamp(32px,3.5vw,42px)' }}
          transition={{ duration: 0.35, ease: expo }}
        >
          {f.stat}
        </motion.span>
        <span className="text-[11px] text-sand/28 font-sans tracking-widest uppercase">{f.statLabel}</span>
      </motion.div>

      {/* Indicador activo */}
      <motion.div
        className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full"
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ backgroundColor: f.accent }}
      />
    </motion.div>
  )
}

function Features() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-50px' })
  const [activeFeature, setActiveFeature] = useState(0)

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
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={i} f={f} i={i}
              isActive={activeFeature === i}
              onClick={() => setActiveFeature(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────
const STATS_DATA = [
  { to: 0, prefix: '$', suffix: '', label: 'Cuota anual', special: 'Cero', accent: '#B8C2D0' },
  { to: 5, prefix: '', suffix: '%', label: 'Cashback promedio', accent: '#7ABFA0' },
  { to: 195, prefix: '', suffix: '', label: 'Países aceptados', accent: '#8AAACE' },
  { to: 50000, prefix: '', suffix: '+', label: 'Clientes satisfechos', accent: '#C4A898' },
]

function StatItem({ s, i }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const nodeRef = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-40px' })

  useEffect(() => {
    if ((!inView && !hovered) || !nodeRef.current || s.special) return
    const ctrl = animate(0, s.to, {
      duration: hovered ? 1.2 : 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { if (nodeRef.current) nodeRef.current.textContent = s.prefix + Math.round(v).toLocaleString() + s.suffix },
    })
    return () => ctrl.stop()
  }, [inView, hovered, s.to, s.prefix, s.suffix, s.special])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: i * 0.1, ease: expo }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative cursor-default group"
    >
      {/* Línea de acento que aparece al hover */}
      <motion.div
        className="absolute -top-4 left-0 h-px"
        animate={{ width: hovered ? 40 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: expo }}
        style={{ backgroundColor: s.accent }}
      />
      <motion.div
        className="font-display font-light mb-2"
        animate={{
          color: hovered ? s.accent : '#CDD6E4',
          scale: hovered ? 1.06 : 1,
          x: hovered ? 4 : 0,
        }}
        transition={{ duration: 0.3, ease: expo }}
        style={{ fontSize: 'clamp(44px, 5vw, 64px)', transformOrigin: 'left center' }}
      >
        {s.special
          ? <span>{s.special}</span>
          : <span ref={nodeRef}>{s.prefix}0{s.suffix}</span>}
      </motion.div>
      <motion.div
        className="font-sans text-sm tracking-wide"
        animate={{ opacity: hovered ? 0.7 : 0.35, x: hovered ? 4 : 0 }}
        transition={{ duration: 0.3, ease: expo }}
        style={{ color: '#EEE9E0' }}
      >
        {s.label}
      </motion.div>
    </motion.div>
  )
}

function Stats() {
  return (
    <section className="py-28 bg-night-lift border-y border-platinum/8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {STATS_DATA.map((s, i) => <StatItem key={i} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}

// ─── ShowcaseFeatureRow & SpecPill ────────────────────────────────
function ShowcaseFeatureRow({ Icon, text, i }) {
  const [h, setH] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: i * 0.09, ease: expo }}
      onHoverStart={() => setH(true)}
      onHoverEnd={() => setH(false)}
      whileHover={{ x: 6 }}
      className="flex items-center gap-3.5 cursor-default rounded-xl px-3 py-2"
      style={{ background: h ? 'rgba(184,194,208,0.05)' : 'transparent', transition: 'background 0.2s' }}
    >
      <motion.div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        animate={{
          width: h ? 36 : 32, height: h ? 36 : 32,
          background: h ? 'rgba(184,194,208,0.15)' : 'rgba(184,194,208,0.08)',
          boxShadow: h ? '0 0 16px -4px rgba(184,194,208,0.4)' : 'none',
        }}
        transition={{ duration: 0.25, ease: expo }}
        style={{ border: '1px solid rgba(184,194,208,0.12)' }}
      >
        <motion.div animate={{ scale: h ? 1.35 : 1, rotate: h ? -10 : 0 }} transition={{ duration: 0.28, ease: expo }}>
          <Icon size={h ? 16 : 14} style={{ color: 'rgba(184,194,208,1)' }} />
        </motion.div>
      </motion.div>
      <motion.span
        className="text-sm font-sans"
        animate={{ color: h ? 'rgba(238,233,224,0.82)' : 'rgba(238,233,224,0.52)' }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
    </motion.div>
  )
}

function SpecPill({ spec, i }) {
  const [ph, setPh] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 1.0 + i * 0.12, ease: expo }}
      onHoverStart={() => setPh(true)}
      onHoverEnd={() => setPh(false)}
      whileHover={{ x: -4, scale: 1.06 }}
      style={{
        background: ph ? 'rgba(22,18,42,0.98)' : 'rgba(14,12,28,0.9)',
        border: `1px solid ${ph ? 'rgba(184,194,208,0.28)' : 'rgba(184,194,208,0.12)'}`,
        borderRadius: 10, padding: '8px 14px',
        backdropFilter: 'blur(10px)',
        boxShadow: ph ? '0 12px 32px -4px rgba(0,0,0,0.6), 0 0 20px -8px rgba(184,194,208,0.2)' : '0 8px 24px -4px rgba(0,0,0,0.5)',
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 8, color: ph ? 'rgba(184,194,208,0.55)' : 'rgba(184,194,208,0.35)', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: 2, transition: 'color 0.2s' }}>
        {spec.label}
      </div>
      <motion.div
        animate={{ color: ph ? 'rgba(238,233,224,1)' : 'rgba(220,230,245,0.85)' }}
        transition={{ duration: 0.2 }}
        style={{ fontSize: 14, fontFamily: 'serif', fontWeight: 300 }}
      >
        {spec.value}
      </motion.div>
    </motion.div>
  )
}

// ─── Card Showcase — Momento protagonista con flip interactivo ──────
function CardShowcase() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center 55%'] })
  const reduced = useSafeReducedMotion()

  const cardRotateX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [20, 0])
  const cardRotateY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-28, 0])
  const cardScale   = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.84, 1])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1])

  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-50px' })

  return (
    <section ref={sectionRef} className="relative py-36 overflow-hidden" style={{ background: 'linear-gradient(180deg, #08061A 0%, #0A0820 40%, #080616 100%)' }}>

      {/* Fondo con glow masivo centrado */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[600px] rounded-full blur-[180px]" style={{ background: 'radial-gradient(ellipse, rgba(184,194,208,0.055) 0%, rgba(130,160,210,0.025) 50%, transparent 70%)' }} />
      </div>
      {/* Líneas decorativas de lujo */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(184,194,208,1) 0px, rgba(184,194,208,1) 1px, transparent 1px, transparent 120px)',
      }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          {/* Texto */}
          <div ref={headingRef}>
            <EyebrowReveal>La tarjeta</EyebrowReveal>
            <h2
              className="font-display font-light text-sand leading-[0.93] mb-7"
              style={{ fontSize: 'clamp(40px, 5.2vw, 62px)' }}
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
              Metal grabado con láser. Acabado platino mate. Fabricada con 85% de materiales reciclados.
              Diseñada para sentirse tan bien en la mano como funciona en cualquier país del mundo.
            </motion.p>

            {/* Features list — cada fila es interactiva */}
            <div className="space-y-3 mb-10">
              {[
                { Icon: RiShieldCheckFill, text: 'Chip EMV + sin contacto + tarjeta virtual' },
                { Icon: RiLock2Line, text: 'Congela y descongela al instante desde la app' },
                { Icon: RiSmartphoneLine, text: 'Apple Pay y Google Pay desde el primer día' },
                { Icon: RiPlantLine, text: '85% materiales reciclados, envío carbono neutral' },
              ].map(({ Icon, text }, i) => (
                <ShowcaseFeatureRow key={i} Icon={Icon} text={text} i={i} />
              ))}
            </div>

            {/* Pill de disponibilidad */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5, ease: expo }}
              className="inline-flex items-center gap-2.5 text-[11px] font-sans font-semibold tracking-[0.2em] uppercase"
              style={{ color: 'rgba(184,194,208,0.45)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Disponible para envío en 72h
            </motion.div>
          </div>

          {/* Tarjeta — grande, centrada, flip interactivo */}
          <div className="flex flex-col items-center justify-center relative">
            {/* Glow detrás de la tarjeta */}
            <div className="absolute w-[500px] h-[400px] rounded-full blur-[100px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(184,194,208,0.09) 0%, transparent 65%)' }} />
            <div className="absolute w-[300px] h-[250px] rounded-full blur-[50px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(150,180,230,0.06) 0%, transparent 65%)' }} />

            <div style={{ perspective: '1400px' }}>
              <motion.div
                style={{
                  rotateX: cardRotateX,
                  rotateY: cardRotateY,
                  scale: cardScale,
                  opacity: cardOpacity,
                }}
              >
                <motion.div
                  animate={reduced ? {} : { y: [0, -10, 0], rotate: [-0.5, 0.5, -0.5] }}
                  transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}
                >
                  <CreditCard scale={1.3} assemblyDelay={0.35} interactive={true} />
                </motion.div>
              </motion.div>
            </div>

            {/* Hint + Specs en fila debajo de la tarjeta */}
            <div className="mt-7 flex flex-col items-center gap-4 w-full">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 1.2, ease: expo }}
                className="flex items-center gap-2"
                style={{ color: 'rgba(184,194,208,0.32)', fontSize: 11, fontFamily: 'sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase' }}
              >
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}>↺</motion.span>
                Haz clic para girar
              </motion.div>

              {/* Specs en fila horizontal */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 1.0, ease: expo }}
                className="flex gap-3"
              >
                {[
                  { label: 'Material', value: 'Metal' },
                  { label: 'Límite', value: 'Sin tope' },
                  { label: 'Cashback', value: '5%' },
                ].map((spec, i) => (
                  <SpecPill key={i} spec={spec} i={i} />
                ))}
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

function PricingCard({ plan, i }) {
  const [hovered, setHovered] = useState(false)
  const [featHover, setFeatHover] = useState(null)

  return (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.75, delay: i * 0.1, ease: expo }}
      whileHover={{ y: -12 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-3xl p-8 h-full flex flex-col border"
      style={plan.highlight ? {
        borderColor: hovered ? 'rgba(184,194,208,0.45)' : 'rgba(184,194,208,0.3)',
        background: 'linear-gradient(145deg, #1A1530, #120F22)',
        boxShadow: hovered
          ? '0 0 80px -10px rgba(184,194,208,0.18), inset 0 1px 0 rgba(184,194,208,0.12)'
          : '0 0 60px -10px rgba(184,194,208,0.1), inset 0 1px 0 rgba(184,194,208,0.08)',
        transition: 'box-shadow 0.4s, border-color 0.3s',
      } : {
        borderColor: hovered ? 'rgba(238,233,224,0.12)' : 'rgba(238,233,224,0.06)',
        background: 'linear-gradient(145deg, #120F22, #0E0C18)',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Shimmer sweep al hover en el plan highlight */}
      {plan.highlight && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ x: hovered ? ['-120%', '220%'] : '-120%' }}
          transition={{ duration: 0.9, ease: cinematic }}
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(184,194,208,0.07) 50%, transparent 70%)',
            transform: 'skewX(-15deg)',
          }}
        />
      )}

      {plan.highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            className="bg-platinum text-night text-[11px] font-sans font-bold px-4 py-1.5 rounded-full tracking-wide"
          >
            Más popular
          </motion.div>
        </div>
      )}

      <div className="mb-7">
        <div className={`text-[11px] font-sans font-semibold tracking-[0.25em] uppercase mb-3 ${plan.highlight ? 'text-platinum/60' : 'text-sand/28'}`}>{plan.name}</div>
        <motion.div
          className="flex items-baseline gap-1 mb-3"
          animate={{ x: hovered ? 3 : 0 }}
          transition={{ duration: 0.3, ease: expo }}
        >
          <span className={`font-display font-light ${plan.highlight ? 'text-platinum-light' : 'text-sand'}`} style={{ fontSize: 'clamp(40px, 4vw, 52px)' }}>{plan.price}</span>
          {plan.period && <span className="text-sm font-sans text-sand/30">{plan.period}</span>}
        </motion.div>
        <p className="text-sm font-sans leading-relaxed text-sand/38">{plan.tagline}</p>
      </div>

      <div className="space-y-2.5 flex-1 mb-8">
        {plan.features.map((feat, j) => (
          <motion.div
            key={j}
            className="flex items-start gap-3 rounded-lg px-2 py-1.5 cursor-default"
            onHoverStart={() => setFeatHover(j)}
            onHoverEnd={() => setFeatHover(null)}
            animate={{
              backgroundColor: featHover === j ? 'rgba(184,194,208,0.05)' : 'rgba(0,0,0,0)',
              x: featHover === j ? 4 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{
                scale: featHover === j ? 1.4 : 1,
                rotate: featHover === j ? 10 : 0,
              }}
              transition={{ duration: 0.25, ease: expo }}
              className="flex-shrink-0 mt-0.5"
            >
              <RiCheckLine size={15} style={{ color: plan.highlight ? 'rgba(184,194,208,1)' : featHover === j ? 'rgba(184,194,208,0.7)' : 'rgba(238,233,224,0.35)' }} />
            </motion.div>
            <motion.span
              className="text-sm font-sans leading-snug"
              animate={{ color: featHover === j ? 'rgba(238,233,224,0.8)' : 'rgba(238,233,224,0.5)' }}
              transition={{ duration: 0.2 }}
            >
              {feat}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <motion.a
        href="#"
        whileHover={{ scale: 1.03, boxShadow: plan.highlight ? '0 0 28px -4px rgba(184,194,208,0.3)' : 'none' }}
        whileTap={{ scale: 0.96 }}
        className={`block text-center text-sm font-sans font-semibold py-3.5 rounded-full transition-colors ${
          plan.highlight
            ? 'bg-platinum text-night hover:bg-platinum-light'
            : 'border border-sand/12 text-sand/50 hover:border-platinum/30 hover:text-platinum'
        }`}
      >
        {plan.cta}
      </motion.a>
    </motion.div>
  )
}

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
          {PLANS.map((plan, i) => <PricingCard key={i} plan={plan} i={i} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonial Card ─────────────────────────────────────────────
function TestimonialCard({ t, i }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: i * 0.13, ease: expo }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex flex-col h-full border rounded-2xl p-7 cursor-default overflow-hidden relative"
      style={{
        background: 'linear-gradient(145deg, rgba(22,18,42,0.8), rgba(14,12,28,0.95))',
        borderColor: hovered ? 'rgba(184,194,208,0.2)' : 'rgba(238,233,224,0.06)',
        transition: 'border-color 0.3s',
      }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${t.color}22 0%, transparent 65%)` }}
      />
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, j) => (
          <motion.div
            key={j}
            animate={{ scale: hovered ? [1, 1.5, 1] : 1, rotate: hovered ? [0, 15, 0] : 0 }}
            transition={{ duration: 0.4, delay: hovered ? j * 0.07 : 0, ease: expo }}
          >
            <RiStarFill size={13} style={{ color: hovered ? 'rgba(184,194,208,0.95)' : 'rgba(184,194,208,0.65)' }} />
          </motion.div>
        ))}
      </div>
      <motion.blockquote
        className="font-display font-light leading-snug mb-8 flex-1"
        animate={{ color: hovered ? 'rgba(238,233,224,0.92)' : 'rgba(238,233,224,0.75)' }}
        transition={{ duration: 0.3 }}
        style={{ fontSize: 'clamp(17px, 1.7vw, 21px)' }}
      >
        "{t.quote}"
      </motion.blockquote>
      <div className="flex items-center gap-3.5 pt-6 border-t border-sand/8">
        <motion.div
          className="rounded-full flex items-center justify-center text-white text-sm font-sans font-bold flex-shrink-0"
          animate={{
            width: hovered ? 44 : 40, height: hovered ? 44 : 40,
            boxShadow: hovered ? `0 0 20px -4px ${t.color}` : 'none',
          }}
          transition={{ duration: 0.3, ease: expo }}
          style={{ backgroundColor: t.color }}
        >
          {t.initial}
        </motion.div>
        <div>
          <motion.div
            className="font-sans font-medium leading-none mb-1"
            animate={{ color: hovered ? 'rgba(238,233,224,1)' : 'rgba(238,233,224,0.85)' }}
            style={{ fontSize: 14 }}
          >
            {t.name}
          </motion.div>
          <div className="text-xs font-sans text-sand/30">{t.title}</div>
        </div>
      </div>
    </motion.div>
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
            <TestimonialCard key={i} t={t} i={i} />
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
  const [hoveredItem, setHoveredItem] = useState(null)

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
              <motion.div
                className="border-t border-sand/7 last:border-b last:border-sand/7 relative"
                onHoverStart={() => setHoveredItem(i)}
                onHoverEnd={() => setHoveredItem(null)}
              >
                {/* Barra izquierda al hover/open */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-px"
                  animate={{
                    opacity: open === i ? 1 : hoveredItem === i ? 0.4 : 0,
                    scaleY: open === i || hoveredItem === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: expo }}
                  style={{
                    background: 'linear-gradient(180deg, transparent, rgba(184,194,208,0.8), transparent)',
                    transformOrigin: 'center',
                  }}
                />
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left pl-4"
                >
                  <motion.span
                    className="font-sans font-medium text-[15px] pr-8"
                    animate={{
                      color: open === i
                        ? 'rgba(184,194,208,1)'
                        : hoveredItem === i
                          ? 'rgba(238,233,224,0.85)'
                          : 'rgba(238,233,224,0.65)',
                      x: open === i ? 4 : 0,
                    }}
                    transition={{ duration: 0.25, ease: expo }}
                  >
                    {faq.q}
                  </motion.span>
                  <motion.div
                    animate={{
                      rotate: open === i ? 45 : 0,
                      scale: open === i ? 1.15 : hoveredItem === i ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.28, ease: expo }}
                    className="flex-shrink-0 text-2xl leading-none font-light"
                    style={{ color: open === i ? 'rgba(184,194,208,1)' : 'rgba(184,194,208,0.5)' }}
                  >
                    +
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ gridTemplateRows: open === i ? '1fr' : '0fr', opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.38, ease: expo }}
                  style={{ display: 'grid' }}
                >
                  <div className="overflow-hidden">
                    <motion.p
                      className="text-sm font-sans leading-relaxed pb-6 pr-12 pl-4"
                      animate={{ y: open === i ? 0 : 8 }}
                      transition={{ duration: 0.35, ease: expo }}
                      style={{ color: 'rgba(238,233,224,0.42)' }}
                    >
                      {faq.a}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
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
            animate={reduced ? {} : { y: [0, -8, 0], rotate: [-0.8, 0.8, -0.8] }}
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
          >
            <CreditCard scale={0.95} assemblyDelay={0.2} interactive={true} />
          </motion.div>
        </div>
        <div ref={headingRef}>
          <h2
            className="font-display font-light text-sand leading-[0.93] mb-5"
            style={{ fontSize: 'clamp(42px, 6vw, 80px)' }}
          >
            {['Listo para repensar', 'tus finanzas?'].map((line, i) => (
              <MaskedLine key={i} delay={i * 0.15} inView={headingInView} className={i === 1 ? 'text-platinum' : ''}>
                {line}
              </MaskedLine>
            ))}
          </h2>
        </div>
        <Reveal delay={0.3}>
          <p className="text-[16px] text-sand/42 font-sans mb-12 max-w-lg mx-auto leading-relaxed">
            Unete a mas de 50,000 personas que ya hicieron el cambio. Solicitar toma menos de 30 segundos.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-10">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex-1 bg-night-lift border border-sand/10 rounded-full px-6 py-3.5 text-sm font-sans text-sand placeholder:text-sand/22 outline-none focus:border-platinum/35 focus:ring-2 focus:ring-platinum/8 transition-all"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: '0 0 28px -4px rgba(184,194,208,0.28)' }}
              whileTap={{ scale: 0.97 }}
              className="bg-platinum text-night text-sm font-sans font-semibold px-8 py-3.5 rounded-full hover:bg-platinum-light transition-colors whitespace-nowrap"
            >
              {sent ? 'Ya estas en la lista' : 'Acceso anticipado'}
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
    Producto: ['Caracteristicas','Precios','Seguridad','Hoja de ruta','Novedades'],
    Empresa:  ['Nosotros','Blog','Carreras','Prensa','Socios'],
    Soporte:  ['Centro de ayuda','Contactanos','Estado del servicio','Terminos','Privacidad'],
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
              La tarjeta construida para el futuro. Solicitala en 30 segundos.
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
          <div className="text-xs text-sand/18 font-sans">2026 Fintech Inc. Asegurado por FDIC. Todos los derechos reservados.</div>
          <div className="text-xs text-sand/18 font-sans">Hecho con intencion.</div>
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
