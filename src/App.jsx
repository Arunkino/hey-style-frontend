import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Smartphone, Star, Clock, Calendar, CheckCircle, Loader2, Sparkles, Shield, Users, MapPin, ChevronDown, Play, Instagram, Twitter, Linkedin, Mail, Phone, Scissors, Heart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CustomCursor from './components/CustomCursor';
import MagneticButton from './components/MagneticButton';
import AnimatedCounter from './components/AnimatedCounter';
import TextReveal from './components/TextReveal';
import ParallaxSection from './components/ParallaxSection';
import MascotSwing from './components/MascotSwing';

const FloatingMascot = React.lazy(() => import('./components/FloatingMascot'));

gsap.registerPlugin(ScrollTrigger);

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1UTrUdEFVexDV6prtTEqo8N_c5B_HkvGXIuIiW8Bl4VrddHJC7lvmGKst0A-PU6Bz/exec";

// Smooth Scroll Setup
function useSmoothScroll() {
    useEffect(() => {
        let lenis;
        (async () => {
            const Lenis = (await import('lenis')).default;
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smooth: true,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        })();

        return () => lenis?.destroy();
    }, []);
}

// Scroll Progress Bar
function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-purple-400 to-secondary z-[100] origin-left"
            style={{ scaleX }}
        />
    );
}

// Animated Section Wrapper
function RevealSection({ children, className = '', delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Glassmorphism Card
function GlassCard({ children, className = '', hover = true }) {
    return (
        <motion.div
            whileHover={hover ? { y: -8, scale: 1.02 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`glass-card ${className}`}
        >
            {children}
        </motion.div>
    );
}

// Tilt Card
function TiltCard({ children, className = '' }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (card) card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`tilt-card ${className}`}
            style={{ transition: 'transform 0.15s ease-out' }}
        >
            {children}
        </div>
    );
}

// Marquee
function Marquee({ items, direction = 'left', speed = 30 }) {
    return (
        <div className="overflow-hidden whitespace-nowrap py-4">
            <motion.div
                className="inline-flex gap-8"
                animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
                transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
            >
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="text-zinc-600 text-lg font-medium flex items-center gap-2">
                        <Sparkles size={14} className="text-primary/40" />
                        {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

// Form Component
function Form() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState('idle');
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(formData),
                mode: "no-cors"
            });
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error("Error submitting form", error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-10 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="flex justify-center mb-6"
                >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="text-green-400 w-10 h-10" />
                    </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                <p className="text-gray-400 mb-6">Thanks for reaching out. We will get back to you shortly.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="text-sm text-primary hover:text-white transition-colors underline underline-offset-4"
                >
                    Send another message
                </button>
            </motion.div>
        );
    }

    const inputClass = (name) =>
        `w-full p-4 bg-white/[0.03] border rounded-xl text-white outline-none transition-all duration-300 placeholder:text-zinc-600 ${focusedField === name ? 'border-primary/50 shadow-[0_0_20px_rgba(142,110,232,0.1)]' : 'border-white/[0.06] hover:border-white/10'}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {[
                { label: 'Your Name', name: 'name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+1 234 567 890' },
            ].map((field) => (
                <div key={field.name}>
                    <label className="block mb-2 text-sm font-medium text-gray-400">{field.label}</label>
                    <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(field.name)}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={inputClass(field.name)}
                        placeholder={field.placeholder}
                    />
                </div>
            ))}
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-400">Message</label>
                <textarea
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={inputClass('message')}
                    placeholder="How can we help?"
                />
            </div>
            <MagneticButton
                type="submit"
                disabled={status === 'submitting'}
                className="w-full text-black bg-gradient-to-r from-primary to-purple-400 hover:shadow-[0_0_30px_rgba(142,110,232,0.3)] font-semibold rounded-xl text-lg px-5 py-4 text-center transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {status === 'submitting' ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Sending...
                    </>
                ) : (
                    <>
                        Send Enquiry
                        <ArrowRight size={18} />
                    </>
                )}
            </MagneticButton>
            <AnimatePresence>
                {status === 'error' && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm text-center"
                    >
                        Something went wrong. Please try again.
                    </motion.p>
                )}
            </AnimatePresence>
        </form>
    );
}

// Features Data
const features = [
    {
        icon: Clock,
        title: 'Skip the Queue',
        desc: 'Pre-book your slot and arrive exactly when it\u2019s your turn. No more sitting around waiting.',
        gradient: 'from-purple-500/20 to-violet-600/10',
    },
    {
        icon: Calendar,
        title: 'Smart Scheduling',
        desc: 'AI-powered scheduling that adapts to your routine and preferences.',
        gradient: 'from-blue-500/20 to-cyan-600/10',
    },
    {
        icon: Star,
        title: 'Premium Stylists',
        desc: 'Handpicked, verified professionals rated by thousands of customers.',
        gradient: 'from-amber-500/20 to-orange-600/10',
    },
    {
        icon: Shield,
        title: 'Flexible Payments',
        desc: 'Choose how you pay — settle at the shop with no extra charges, or pay online securely.',
        gradient: 'from-emerald-500/20 to-green-600/10',
    },
    {
        icon: MapPin,
        title: 'Nearby Salons',
        desc: 'Discover top-rated salons in your area with real-time availability.',
        gradient: 'from-rose-500/20 to-pink-600/10',
    },
    {
        icon: CheckCircle,
        title: 'Instant Confirmations',
        desc: 'Get real-time booking confirmations and timely reminders so you never miss your appointment.',
        gradient: 'from-indigo-500/20 to-blue-600/10',
    },
];

const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'Regular User',
        text: "Absolutely love this app! No more waiting at the salon. I book my slot and walk right in. The stylists are incredible too!",
        avatar: '\u{1F469}\u{1F3FB}',
        rating: 5,
    },
    {
        name: 'Rahul Menon',
        role: 'Premium Member',
        text: "HeyStyle changed how I get groomed. The scheduling is seamless, and the quality of service is consistently top-notch.",
        avatar: '\u{1F468}\u{1F3FD}',
        rating: 5,
    },
    {
        name: 'Anita Desai',
        role: 'Salon Partner',
        text: "As a salon owner, this platform has increased our bookings by 3x. The interface is beautiful and our clients love it.",
        avatar: '\u{1F469}\u{1F3FD}',
        rating: 5,
    },
];

const marqueeItems = [
    'Haircut', 'Beard Trim', 'Facial', 'Hair Coloring', 'Manicure', 'Pedicure',
    'Spa Treatment', 'Keratin', 'Bridal Makeup', 'Massage', 'Waxing', 'Threading',
    'Hair Spa', 'Shaving', 'Styling', 'Bleaching'
];

// Interactive Particle with cursor repulsion
function InteractiveParticle({ top, left, right, size, delay: d, dur, opacity: op, mouseX, mouseY }) {
    const ref = useRef(null);
    const repelX = useMotionValue(0);
    const repelY = useMotionValue(0);
    const springX = useSpring(repelX, { stiffness: 120, damping: 15 });
    const springY = useSpring(repelY, { stiffness: 120, damping: 15 });

    useEffect(() => {
        const unsub = mouseX.on('change', () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const px = rect.left + rect.width / 2 - springX.get();
            const py = rect.top + rect.height / 2 - springY.get();
            const mx = mouseX.get();
            const my = mouseY.get();
            const dx = px - mx;
            const dy = py - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 120;
            if (dist < radius && dist > 0) {
                const force = ((radius - dist) / radius) * 60;
                repelX.set((dx / dist) * force);
                repelY.set((dy / dist) * force);
            } else {
                repelX.set(0);
                repelY.set(0);
            }
        });
        return unsub;
    }, [mouseX, mouseY, repelX, repelY, springX, springY]);

    return (
        <motion.div
            ref={ref}
            className="absolute pointer-events-none z-[1]"
            style={{ top, left, right, x: springX, y: springY }}
        >
            <motion.div
                animate={{
                    y: [0, -18, 6, -12, 0],
                    opacity: [op * 0.7, op, op * 0.8, op, op * 0.7],
                }}
                transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: d }}
                className="rounded-full bg-primary"
                style={{ width: size, height: size }}
            />
        </motion.div>
    );
}

// Main App
function App() {
    useSmoothScroll();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const [navScrolled, setNavScrolled] = useState(false);

    // Cursor tracking for particle repulsion
    const heroMouseX = useMotionValue(-1000);
    const heroMouseY = useMotionValue(-1000);
    const handleHeroPointerMove = (e) => {
        heroMouseX.set(e.clientX);
        heroMouseY.set(e.clientY);
    };
    const handleHeroPointerLeave = () => {
        heroMouseX.set(-1000);
        heroMouseY.set(-1000);
    };

    useEffect(() => {
        const handleScroll = () => setNavScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // GSAP scroll-triggered animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray('.gsap-reveal').forEach((el) => {
                gsap.fromTo(el,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                    }
                );
            });
        });
        return () => ctx.revert();
    }, []);

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-white overflow-x-hidden">
            <ScrollProgress />

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className={`fixed w-full z-50 top-0 transition-all duration-500 ${navScrolled
                    ? 'bg-black/70 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-screen-xl flex items-center justify-between mx-auto px-6 py-4">
                    <a href="#" className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ rotate: 10 }}
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center"
                        >
                            <Scissors size={16} className="text-white" />
                        </motion.div>
                        <span className="text-xl font-bold tracking-tight">
                            Hey<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Style</span>
                        </span>
                    </a>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Reviews', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className="text-sm text-gray-400 hover:text-white transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
                            </button>
                        ))}
                    </div>

                    <MagneticButton
                        onClick={() => scrollToSection('contact')}
                        className="text-sm font-medium px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
                    >
                        Get Early Access
                    </MagneticButton>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section ref={heroRef} onPointerMove={handleHeroPointerMove} onPointerLeave={handleHeroPointerLeave} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 blur-[150px] rounded-full" />
                    <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-violet-500/8 blur-[120px] rounded-full" />
                    {/* Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(142,110,232,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(142,110,232,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                {/* Floating glow orbs — spread across full hero */}
                <motion.div
                    animate={{ x: [0, 100, -50, 0], y: [0, -60, 40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[10%] right-[8%] w-20 h-20 rounded-full bg-primary/20 blur-[40px] pointer-events-none z-[1]"
                />
                <motion.div
                    animate={{ x: [0, -70, 50, 0], y: [0, 50, -40, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[15%] left-[6%] w-16 h-16 rounded-full bg-violet-300/25 blur-[35px] pointer-events-none z-[1]"
                />
                <motion.div
                    animate={{ x: [0, 60, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[45%] left-[3%] w-14 h-14 rounded-full bg-purple-400/18 blur-[30px] pointer-events-none z-[1]"
                />
                <motion.div
                    animate={{ x: [0, -40, 30, 0], y: [0, -50, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute top-[20%] left-[15%] w-12 h-12 rounded-full bg-primary/12 blur-[25px] pointer-events-none z-[1]"
                />
                <motion.div
                    animate={{ x: [0, 50, -60, 0], y: [0, 30, -40, 0] }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    className="absolute bottom-[30%] right-[12%] w-10 h-10 rounded-full bg-violet-400/15 blur-[22px] pointer-events-none z-[1]"
                />
                {/* Outer edge orbs — dimmer & smaller */}
                <motion.div
                    animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute top-[5%] left-[2%] w-8 h-8 rounded-full bg-primary/8 blur-[18px] pointer-events-none z-[1]"
                />
                <motion.div
                    animate={{ x: [0, -25, 35, 0], y: [0, 20, -30, 0] }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                    className="absolute bottom-[5%] right-[3%] w-8 h-8 rounded-full bg-violet-300/8 blur-[18px] pointer-events-none z-[1]"
                />

                {/* Floating particles — 76 total, more intense near mascot, cursor-interactive */}
                {[
                    /* Near mascot (right-center) — brightest & largest */
                    { top: '25%', left: '55%', size: 5, delay: 0, dur: 8, opacity: 0.7 },
                    { top: '30%', right: '30%', size: 5, delay: 1, dur: 10, opacity: 0.7 },
                    { top: '25%', left: '45%', size: 5, delay: 2, dur: 12, opacity: 0.7 },
                    { top: '35%', right: '35%', size: 5, delay: 0.5, dur: 9, opacity: 0.65 },
                    { top: '20%', left: '60%', size: 5, delay: 3, dur: 11, opacity: 0.7 },
                    { top: '12%', right: '28%', size: 5, delay: 1.5, dur: 9, opacity: 0.7 },
                    { top: '18%', left: '28%', size: 4, delay: 0.8, dur: 10, opacity: 0.65 },
                    { top: '32%', right: '22%', size: 5, delay: 2.2, dur: 11, opacity: 0.7 },
                    { top: '38%', left: '52%', size: 4, delay: 3.5, dur: 8, opacity: 0.65 },
                    { top: '58%', right: '38%', size: 4, delay: 1.8, dur: 12, opacity: 0.6 },
                    /* Near mascot — second set (offset positions & delays) */
                    { top: '36%', left: '57%', size: 5, delay: 0.4, dur: 9, opacity: 0.68 },
                    { top: '51%', right: '31%', size: 4, delay: 1.6, dur: 11, opacity: 0.68 },
                    { top: '46%', left: '47%', size: 5, delay: 2.4, dur: 10, opacity: 0.7 },
                    { top: '54%', right: '33%', size: 5, delay: 0.9, dur: 8, opacity: 0.65 },
                    { top: '41%', left: '62%', size: 4, delay: 3.3, dur: 12, opacity: 0.68 },
                    { top: '43%', right: '26%', size: 5, delay: 1.1, dur: 10, opacity: 0.7 },
                    { top: '49%', left: '56%', size: 5, delay: 1.2, dur: 9, opacity: 0.65 },
                    { top: '53%', right: '34%', size: 4, delay: 2.7, dur: 12, opacity: 0.68 },
                    { top: '37%', left: '54%', size: 5, delay: 4.0, dur: 9, opacity: 0.63 },
                    { top: '57%', right: '36%', size: 4, delay: 2.3, dur: 11, opacity: 0.62 },
                    /* Mid distance — medium */
                    { top: '20%', right: '20%', size: 4, delay: 1.5, dur: 13, opacity: 0.45 },
                    { top: '70%', left: '25%', size: 3, delay: 4, dur: 10, opacity: 0.4 },
                    { top: '25%', left: '30%', size: 3, delay: 2.5, dur: 14, opacity: 0.45 },
                    { top: '65%', right: '22%', size: 4, delay: 0.8, dur: 9, opacity: 0.4 },
                    { top: '30%', right: '40%', size: 3, delay: 3.5, dur: 11, opacity: 0.45 },
                    { top: '75%', left: '50%', size: 3, delay: 1.2, dur: 8, opacity: 0.4 },
                    { top: '22%', left: '42%', size: 3, delay: 2.8, dur: 12, opacity: 0.45 },
                    { top: '68%', right: '25%', size: 3, delay: 5, dur: 11, opacity: 0.4 },
                    { top: '28%', right: '15%', size: 4, delay: 3.2, dur: 10, opacity: 0.42 },
                    { top: '72%', left: '35%', size: 3, delay: 0.6, dur: 13, opacity: 0.38 },
                    { top: '18%', left: '50%', size: 3, delay: 4.5, dur: 9, opacity: 0.42 },
                    { top: '60%', left: '18%', size: 3, delay: 1.8, dur: 14, opacity: 0.38 },
                    /* Mid distance — second set */
                    { top: '21%', right: '23%', size: 3, delay: 2.0, dur: 12, opacity: 0.43 },
                    { top: '71%', left: '28%', size: 4, delay: 4.5, dur: 11, opacity: 0.4 },
                    { top: '26%', left: '33%', size: 3, delay: 3.0, dur: 13, opacity: 0.44 },
                    { top: '64%', right: '24%', size: 3, delay: 1.3, dur: 10, opacity: 0.42 },
                    { top: '31%', right: '42%', size: 4, delay: 4.0, dur: 12, opacity: 0.43 },
                    { top: '74%', left: '52%', size: 3, delay: 1.7, dur: 9, opacity: 0.38 },
                    { top: '23%', left: '44%', size: 3, delay: 3.3, dur: 13, opacity: 0.43 },
                    { top: '67%', right: '27%', size: 4, delay: 5.5, dur: 12, opacity: 0.4 },
                    { top: '29%', right: '17%', size: 3, delay: 3.7, dur: 11, opacity: 0.4 },
                    { top: '73%', left: '37%', size: 3, delay: 1.1, dur: 14, opacity: 0.37 },
                    { top: '19%', left: '48%', size: 4, delay: 5.0, dur: 10, opacity: 0.4 },
                    { top: '61%', left: '20%', size: 3, delay: 2.3, dur: 13, opacity: 0.37 },
                    /* Far edges — dimmer & smaller */
                    { top: '8%', left: '8%', size: 3, delay: 5, dur: 15, opacity: 0.25 },
                    { top: '10%', right: '5%', size: 2, delay: 2, dur: 12, opacity: 0.2 },
                    { top: '85%', left: '10%', size: 3, delay: 6, dur: 14, opacity: 0.25 },
                    { top: '90%', right: '8%', size: 2, delay: 3, dur: 13, opacity: 0.2 },
                    { top: '15%', left: '3%', size: 2, delay: 4.5, dur: 16, opacity: 0.18 },
                    { top: '80%', right: '3%', size: 2, delay: 1, dur: 17, opacity: 0.18 },
                    { top: '5%', left: '40%', size: 2, delay: 7, dur: 11, opacity: 0.2 },
                    { top: '95%', right: '45%', size: 2, delay: 5.5, dur: 10, opacity: 0.2 },
                    { top: '3%', right: '15%', size: 2, delay: 3.5, dur: 14, opacity: 0.22 },
                    { top: '92%', left: '5%', size: 2, delay: 6.5, dur: 13, opacity: 0.18 },
                    { top: '7%', left: '20%', size: 2, delay: 2.5, dur: 15, opacity: 0.2 },
                    { top: '88%', right: '18%', size: 3, delay: 4, dur: 12, opacity: 0.22 },
                    { top: '12%', left: '70%', size: 2, delay: 7.5, dur: 16, opacity: 0.18 },
                    { top: '82%', left: '65%', size: 2, delay: 1.5, dur: 11, opacity: 0.2 },
                    { top: '96%', left: '25%', size: 2, delay: 8, dur: 14, opacity: 0.18 },
                    { top: '2%', right: '35%', size: 2, delay: 5, dur: 15, opacity: 0.2 },
                    /* Far edges — second set */
                    { top: '9%', left: '12%', size: 2, delay: 5.5, dur: 16, opacity: 0.23 },
                    { top: '11%', right: '7%', size: 3, delay: 2.5, dur: 13, opacity: 0.2 },
                    { top: '84%', left: '13%', size: 2, delay: 6.5, dur: 15, opacity: 0.23 },
                    { top: '91%', right: '10%', size: 3, delay: 3.5, dur: 14, opacity: 0.2 },
                    { top: '16%', left: '5%', size: 2, delay: 5.0, dur: 17, opacity: 0.18 },
                    { top: '79%', right: '5%', size: 2, delay: 1.5, dur: 16, opacity: 0.18 },
                    { top: '6%', left: '38%', size: 2, delay: 7.5, dur: 12, opacity: 0.2 },
                    { top: '94%', right: '43%', size: 2, delay: 6.0, dur: 11, opacity: 0.2 },
                    { top: '4%', right: '13%', size: 2, delay: 4.0, dur: 15, opacity: 0.22 },
                    { top: '93%', left: '7%', size: 2, delay: 7.0, dur: 14, opacity: 0.18 },
                    { top: '6%', left: '22%', size: 2, delay: 3.0, dur: 16, opacity: 0.2 },
                    { top: '87%', right: '20%', size: 2, delay: 4.5, dur: 13, opacity: 0.22 },
                    { top: '13%', left: '72%', size: 3, delay: 8.0, dur: 17, opacity: 0.18 },
                    { top: '83%', left: '63%', size: 2, delay: 2.0, dur: 12, opacity: 0.2 },
                    { top: '97%', left: '27%', size: 2, delay: 8.5, dur: 15, opacity: 0.18 },
                    { top: '1%', right: '37%', size: 2, delay: 5.5, dur: 16, opacity: 0.2 },
                ].map((p, i) => (
                    <InteractiveParticle
                        key={`particle-${i}`}
                        top={p.top}
                        left={p.left}
                        right={p.right}
                        size={p.size}
                        delay={p.delay}
                        dur={p.dur}
                        opacity={p.opacity}
                        mouseX={heroMouseX}
                        mouseY={heroMouseY}
                    />
                ))}

                <motion.div
                    style={{ y: heroY }}
                    className="max-w-screen-xl mx-auto px-6 w-full relative z-[2]"
                >
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center min-h-[80vh] pt-20 lg:pt-24 pb-10 lg:pb-0">
                        {/* Left: Text */}
                        <motion.div className="text-center lg:text-left z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-gray-400 mb-8"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                Now available for early access
                            </motion.div>

                            <TextReveal
                                text="No Waiting"
                                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight !justify-start max-lg:!justify-center mb-2"
                            />
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8"
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
                                    Just Styling
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="text-lg text-gray-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                            >
                                Your all-in-one beauty & grooming app. Experience effortless booking — no queues, no delays, just premium styling at your fingertips.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <MagneticButton
                                    onClick={() => scrollToSection('contact')}
                                    className="group flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-purple-400 text-white font-semibold rounded-full text-base px-8 py-4 transition-all hover:shadow-[0_0_40px_rgba(142,110,232,0.3)]"
                                >
                                    <Smartphone size={18} />
                                    Get the App
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </MagneticButton>

                                <MagneticButton
                                    onClick={() => scrollToSection('features')}
                                    className="flex items-center justify-center gap-2 text-white border border-white/10 hover:bg-white/[0.04] font-medium rounded-full text-base px-8 py-4 transition-all"
                                >
                                    Explore Features
                                    <ChevronDown size={16} />
                                </MagneticButton>
                            </motion.div>

                            {/* Social proof */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.3 }}
                                className="flex items-center gap-6 mt-12 justify-center lg:justify-start"
                            >
                                <div className="flex -space-x-3">
                                    {['\u{1F469}\u{1F3FB}', '\u{1F468}\u{1F3FD}', '\u{1F469}\u{1F3FC}', '\u{1F468}\u{1F3FB}'].map((emoji, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-lg">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="flex items-center gap-1 text-primary">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                    </div>
                                    <span className="text-gray-400">Loved by <span className="text-white font-medium">2,000+</span> users</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: 3D Mascot */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                            className="relative flex items-center justify-center order-first lg:order-last"
                        >
                            {/* Glow behind mascot */}
                            <div className="absolute inset-0 -z-10 flex items-center justify-center">
                                <div className="w-72 h-72 bg-primary/20 blur-[100px] rounded-full" />
                            </div>

                            <div className="w-[65vw] max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] mx-auto">
                                <MascotSwing src="./mascot_sitting_salon_chair.png" width={420} />
                            </div>

                            {/* Floating badges */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-10 right-4 sm:right-10 glass-card px-4 py-2 flex items-center gap-2 !rounded-full"
                            >
                                <Clock size={14} className="text-primary" />
                                <span className="text-xs font-medium">0 min wait</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute bottom-20 left-4 sm:left-5 glass-card px-4 py-2 flex items-center gap-2 !rounded-full"
                            >
                                <Star size={14} className="text-yellow-400" fill="currentColor" />
                                <span className="text-xs font-medium">4.9 Rating</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute bottom-8 right-4 sm:right-16 glass-card px-4 py-2 flex items-center gap-2 !rounded-full"
                            >
                                <Heart size={14} className="text-rose-400" fill="currentColor" />
                                <span className="text-xs font-medium">2K+ Happy Users</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5"
                    >
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Marquee */}
            <div className="border-y border-white/[0.04] py-2 bg-white/[0.01]">
                <Marquee items={marqueeItems} speed={40} />
            </div>

            {/* Stats Section */}
            <section className="py-20 relative">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: 2000, suffix: '+', label: 'Happy Users' },
                            { value: 300, suffix: '+', label: 'Partner Salons' },
                            { value: 25000, suffix: '+', label: 'Bookings Done' },
                            { value: 5, suffix: '+', label: 'Cities' },
                        ].map((stat, i) => (
                            <RevealSection key={i} delay={i * 0.1}>
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full" />
                </div>

                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection className="text-center mb-16">
                        <span className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4">Features</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Everything you need,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                nothing you don't
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Built for people who value their time. Every feature designed to make your beauty journey effortless.
                        </p>
                    </RevealSection>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <RevealSection key={i} delay={i * 0.08}>
                                <TiltCard className="h-full">
                                    <GlassCard hover={false} className="h-full p-8 group cursor-default">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                        <p className="text-gray-400 leading-relaxed text-[15px]">{feature.desc}</p>
                                    </GlassCard>
                                </TiltCard>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 relative">
                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection className="text-center mb-16">
                        <span className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4">How it works</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Three steps to{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                perfect styling
                            </span>
                        </h2>
                    </RevealSection>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                        {[
                            { step: '01', title: 'Choose Your Service', desc: 'Browse services and pick what you need. Filter by location, price, or ratings.', icon: Sparkles },
                            { step: '02', title: 'Book Your Slot', desc: 'Select your preferred time. Our smart system ensures zero waiting.', icon: Calendar },
                            { step: '03', title: 'Get Styled', desc: 'Walk in at your time and enjoy premium service from top professionals.', icon: CheckCircle },
                        ].map((item, i) => (
                            <RevealSection key={i} delay={i * 0.15}>
                                <div className="text-center relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_30px_rgba(142,110,232,0.2)]">
                                        <span className="text-white font-bold text-sm">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                    <p className="text-gray-400 text-[15px] leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="reviews" className="py-24 relative">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
                </div>

                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection className="text-center mb-16">
                        <span className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4">Testimonials</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            What people are{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                saying
                            </span>
                        </h2>
                    </RevealSection>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <RevealSection key={i} delay={i * 0.1}>
                                <GlassCard className="p-8 h-full flex flex-col">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(t.rating)].map((_, j) => (
                                            <Star key={j} size={14} className="text-yellow-400" fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 text-[15px] leading-relaxed flex-1 mb-6">"{t.text}"</p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{t.name}</p>
                                            <p className="text-xs text-gray-500">{t.role}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative">
                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection>
                        <div className="relative rounded-3xl overflow-hidden">
                            {/* Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-900/30 to-black" />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(142,110,232,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(142,110,232,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                            <div className="relative px-8 md:px-16 py-16 md:py-20 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(142,110,232,0.3)]"
                                >
                                    <Scissors size={32} className="text-white" />
                                </motion.div>

                                <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to skip the queue?</h2>
                                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                                    Join thousands of users who have already transformed their grooming experience.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <MagneticButton
                                        onClick={() => scrollToSection('contact')}
                                        className="group flex items-center justify-center gap-3 bg-white text-black font-semibold rounded-full text-base px-8 py-4 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                                    >
                                        Get Started Free
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </MagneticButton>

                                    <MagneticButton
                                        className="flex items-center justify-center gap-2 text-white border border-white/10 hover:bg-white/[0.04] font-medium rounded-full text-base px-8 py-4 transition-all"
                                    >
                                        <Play size={16} fill="white" />
                                        Watch Demo
                                    </MagneticButton>
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* Enquiry / Contact */}
            <section id="contact" className="py-24 relative">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
                </div>

                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left info */}
                        <RevealSection>
                            <span className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4">Contact</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Let's build something{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                    amazing together
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                                Interested in partnering or have questions? We'd love to hear from you. Fill out the form and our team will get back to you within 24 hours.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: Mail, label: 'Email us', value: 'officialheystyle@gmail.com' },
                                    { icon: Phone, label: 'Call us', value: '+91 79949 60606' },
                                    { icon: MapPin, label: 'Location', value: 'Bengaluru, India' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                            <item.icon size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                                            <p className="text-sm text-gray-300">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </RevealSection>

                        {/* Right form */}
                        <RevealSection delay={0.2}>
                            <GlassCard hover={false} className="p-8">
                                <Form />
                            </GlassCard>
                        </RevealSection>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] bg-white/[0.01]">
                <div className="max-w-screen-xl mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                                    <Scissors size={16} className="text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight">
                                    Hey<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Style</span>
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
                                Transforming how India books beauty and grooming services. No waiting, just styling.
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { Icon: Instagram, url: 'https://www.instagram.com/hey_style_india' },
                                    { Icon: Twitter, url: '#' },
                                    { Icon: Linkedin, url: '#' },
                                ].map(({ Icon, url }, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all">
                                        <Icon size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4 text-gray-300">Product</h4>
                            <ul className="space-y-2.5">
                                {['Features', 'Pricing', 'For Salons', 'For Stylists'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-4 text-gray-300">Company</h4>
                            <ul className="space-y-2.5">
                                {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} HeyStyle. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="text-xs text-gray-600 hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="text-xs text-gray-600 hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
