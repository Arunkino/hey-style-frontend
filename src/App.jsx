import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ArrowUp, Smartphone, Star, Clock, Calendar, CheckCircle, Loader2, Sparkles, Shield, Users, MapPin, ChevronDown, Play, Instagram, Twitter, Linkedin, Mail, Phone, Heart, Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import MagneticButton from './components/MagneticButton';
import AnimatedCounter from './components/AnimatedCounter';
import TextReveal from './components/TextReveal';
import MascotSwing from './components/MascotSwing';

gsap.registerPlugin(ScrollTrigger);

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1UTrUdEFVexDV6prtTEqo8N_c5B_HkvGXIuIiW8Bl4VrddHJC7lvmGKst0A-PU6Bz/exec";

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth Scroll Setup
function useSmoothScroll() {
    useEffect(() => {
        // Hijacking the scrollbar is exactly what this preference asks us not to do.
        if (prefersReducedMotion()) return;

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
                    <span key={i} className="text-zinc-300 text-lg font-medium flex items-center gap-2">
                        <Sparkles size={14} className="text-primary/70" />
                        {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

// Country code + number, digits only — the format wa.me expects.
const WHATSAPP_NUMBER = '917994960606';

// Indian mobile: 10 digits starting 6-9. A leading +91 / 91 is stripped before checking.
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

const normalisePhone = (value) =>
    value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

function validateForm({ name, email, phone, message }) {
    const errors = {};

    if (!name.trim()) errors.name = 'Please enter your name.';

    const digits = normalisePhone(phone);
    if (!digits) errors.phone = 'Please enter your phone number.';
    else if (!PHONE_RE.test(digits)) errors.phone = 'Enter a valid 10-digit mobile number.';

    // Email is optional — only validated when the visitor actually fills it in.
    if (email.trim() && !EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';

    if (!message.trim()) errors.message = 'Let us know how we can help.';

    return errors;
}

// lucide-react dropped brand icons, so the WhatsApp glyph is inlined.
function WhatsAppIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.464 3.49" />
        </svg>
    );
}

// Defined outside Form so React keeps the same element across renders — otherwise
// the enter animation replays on every keystroke and the exit animation never runs.
function FieldError({ name, errors }) {
    return (
        <AnimatePresence>
            {errors[name] && (
                <motion.p
                    id={`${name}-error`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 text-sm text-red-400"
                >
                    {errors[name]}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

// Form Component
function Form() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle');
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear the error as soon as they start correcting it, rather than nagging on every keystroke.
        setErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };

    const handleBlur = (e) => {
        setFocusedField(null);
        const { name } = e.target;
        const fieldError = validateForm(formData)[name];
        if (fieldError) setErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nextErrors = validateForm(formData);
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            document.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
            return;
        }

        setStatus('submitting');
        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify({ ...formData, phone: normalisePhone(formData.phone) }),
                mode: "no-cors"
            });
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
            setErrors({});
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

    // Carries whatever they have already typed into the chat, so nothing is retyped.
    // Phone is deliberately left out — WhatsApp already reveals the sender's number.
    const whatsappHref = (() => {
        const lines = ['Hi HeyStyle, I would like to make an enquiry.'];
        if (formData.name.trim()) lines.push(`Name: ${formData.name.trim()}`);
        if (formData.email.trim()) lines.push(`Email: ${formData.email.trim()}`);
        if (formData.message.trim()) lines.push('', formData.message.trim());
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    })();

    const inputClass = (name) => {
        const state = errors[name]
            ? 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.08)]'
            : focusedField === name
                ? 'border-primary/50 shadow-[0_0_20px_rgba(142,110,232,0.1)]'
                : 'border-white/[0.06] hover:border-white/10';
        return `w-full p-4 bg-white/[0.03] border rounded-xl text-white outline-none transition-all duration-300 placeholder:text-zinc-600 ${state}`;
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {[
                { label: 'Your Name', name: 'name', type: 'text', placeholder: 'Arjun Kumar', autoComplete: 'name', inputMode: 'text' },
                // WhatsApp is a nudge, not a rule — any reachable number validates fine.
                { label: 'Phone', name: 'phone', type: 'tel', placeholder: '98765 43210', autoComplete: 'tel', inputMode: 'numeric', whatsapp: true, hint: 'WhatsApp number preferred — it is how we usually reply' },
                // Email stays optional in validateForm — just not advertised as such in the UI.
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'arjun@example.com', autoComplete: 'email', inputMode: 'email' },
            ].map((field) => (
                <div key={field.name}>
                    <label htmlFor={field.name} className="block mb-2 text-sm font-medium text-gray-400">
                        {field.label}
                    </label>
                    <div className="relative">
                        <input
                            id={field.name}
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            onFocus={() => setFocusedField(field.name)}
                            onBlur={handleBlur}
                            autoComplete={field.autoComplete}
                            inputMode={field.inputMode}
                            aria-invalid={!!errors[field.name]}
                            aria-describedby={[
                                field.hint ? `${field.name}-hint` : null,
                                errors[field.name] ? `${field.name}-error` : null,
                            ].filter(Boolean).join(' ') || undefined}
                            className={`${inputClass(field.name)} ${field.whatsapp ? 'pr-12' : ''}`}
                            placeholder={field.placeholder}
                        />
                        {field.whatsapp && (
                            <WhatsAppIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#25D366]" />
                        )}
                    </div>
                    {field.hint && (
                        <p id={`${field.name}-hint`} className="mt-2 text-xs text-zinc-500">
                            {field.hint}
                        </p>
                    )}
                    <FieldError name={field.name} errors={errors} />
                </div>
            ))}
            <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-400">Message</label>
                <textarea
                    id="message"
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={inputClass('message')}
                    placeholder="How can we help?"
                />
                <FieldError name="message" errors={errors} />
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

            <div className="flex items-center gap-4" aria-hidden="true">
                <span className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-xs uppercase tracking-wider text-zinc-600">or</span>
                <span className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[#25D366]/25 bg-[#25D366]/[0.07] px-5 py-4 text-base font-semibold text-[#25D366] transition-all duration-300 hover:bg-[#25D366]/[0.13] hover:border-[#25D366]/50 hover:shadow-[0_0_30px_rgba(37,211,102,0.12)]"
            >
                <WhatsAppIcon className="w-5 h-5" />
                Chat on WhatsApp
            </a>

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
        desc: 'Choose how you pay. Settle at the shop with no extra charges, or pay online securely.',
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
        name: 'Aravind K Suresh',
        role: 'Regular User',
        text: "Absolutely love this app! No more waiting at the salon. I book my slot and walk right in. The stylists are incredible too!",
        avatar: '\u{1F468}\u{1F3FB}',
        rating: 5,
    },
    {
        name: 'Rahul KS',
        role: 'Premium Member',
        text: "HeyStyle changed how I get groomed. The scheduling is seamless, and the quality of service is consistently top-notch.",
        avatar: '\u{1F468}\u{1F3FD}',
        rating: 5,
    },
    {
        name: 'Vishnu Anilkumar',
        role: 'Salon Partner',
        text: "As a salon owner, this platform has increased our bookings by 3x. The interface is beautiful and our clients love it.",
        avatar: '\u{1F468}\u{1F3FE}',
        rating: 5,
    },
];

const marqueeItems = [
    'Haircut', 'Beard Trim', 'Hair Coloring', 'Keratin Treatment', 'Bridal Makeup',
    'Waxing', 'Threading', 'Hair Spa', 'Clean Shave', 'Styling', 'Bleaching',
    'Facial', 'Highlights', 'Smoothening', 'Head Massage', 'Scalp Treatment'
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [navVisible, setNavVisible] = useState(true);
    const lastScrollY = useRef(0);

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
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setNavScrolled(currentScrollY > 50);
            setShowBackToTop(currentScrollY > window.innerHeight);

            // Mobile: hide on scroll down, show on scroll up
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setNavVisible(false);
                setMobileMenuOpen(false);
            } else {
                setNavVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
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
        setMobileMenuOpen(false);
        // Small delay to let menu close before scrolling
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }, 100);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Mascot preload
    const [mascotLoaded, setMascotLoaded] = useState(false);
    useEffect(() => {
        const img = new Image();
        img.src = './mascot_sitting_salon_chair.webp';
        img.onload = () => setMascotLoaded(true);
    }, []);

    // Testimonials auto-scroll
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const testimonialInterval = useRef(null);
    const testimonialContainerRef = useRef(null);
    const testimonialResetting = useRef(false);

    // Features auto-scroll (mobile)
    const [activeFeature, setActiveFeature] = useState(0);
    const featureInterval = useRef(null);
    const featureContainerRef = useRef(null);
    const featureResetting = useRef(false);

    // Helper: scroll a container to a specific child index
    const scrollContainerToIdx = useCallback((containerRef, idx, instant = false) => {
        const container = containerRef.current;
        if (!container) return;
        const card = container.children[idx];
        if (!card) return;
        const scrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
        if (instant) {
            container.scrollLeft = scrollLeft;
        } else {
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, []);

    // Feature auto-scroll with infinite loop
    const startFeatureAutoScroll = useCallback(() => {
        clearInterval(featureInterval.current);
        featureInterval.current = setInterval(() => {
            if (featureResetting.current) return;
            setActiveFeature(prev => {
                const next = (prev + 1) % features.length;
                if (prev === features.length - 1) {
                    // Scroll to the cloned first item (index = features.length) then silently reset
                    featureResetting.current = true;
                    scrollContainerToIdx(featureContainerRef, features.length, false);
                    setTimeout(() => {
                        scrollContainerToIdx(featureContainerRef, 0, true);
                        featureResetting.current = false;
                    }, 550);
                } else {
                    scrollContainerToIdx(featureContainerRef, next, false);
                }
                return next;
            });
        }, 3500);
    }, [scrollContainerToIdx]);

    useEffect(() => {
        startFeatureAutoScroll();
        return () => clearInterval(featureInterval.current);
    }, [startFeatureAutoScroll]);

    // Scroll listener to update feature dots on manual swipe
    useEffect(() => {
        const container = featureContainerRef.current;
        if (!container) return;
        let debounce;
        const handleScroll = () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                if (featureResetting.current) return;
                const center = container.scrollLeft + container.offsetWidth / 2;
                let closest = 0;
                let minDist = Infinity;
                // Scan original items (first half of doubled list)
                Array.from(container.children).slice(0, features.length).forEach((child, i) => {
                    const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
                    if (dist < minDist) { minDist = dist; closest = i; }
                });
                // If user scrolled into the cloned region, silently reset
                const cloneStart = container.children[features.length];
                if (cloneStart && container.scrollLeft >= cloneStart.offsetLeft - container.offsetWidth / 2) {
                    featureResetting.current = true;
                    container.scrollLeft = container.children[closest].offsetLeft - container.offsetWidth / 2 + container.children[closest].offsetWidth / 2;
                    featureResetting.current = false;
                }
                setActiveFeature(closest);
            }, 80);
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => { container.removeEventListener('scroll', handleScroll); clearTimeout(debounce); };
    }, []);

    const handleFeatureInteraction = () => {
        clearInterval(featureInterval.current);
        startFeatureAutoScroll();
    };

    // Testimonial auto-scroll with infinite loop
    const startTestimonialAutoScroll = useCallback(() => {
        clearInterval(testimonialInterval.current);
        testimonialInterval.current = setInterval(() => {
            if (testimonialResetting.current) return;
            setActiveTestimonial(prev => {
                const next = (prev + 1) % testimonials.length;
                if (prev === testimonials.length - 1) {
                    testimonialResetting.current = true;
                    scrollContainerToIdx(testimonialContainerRef, testimonials.length, false);
                    setTimeout(() => {
                        scrollContainerToIdx(testimonialContainerRef, 0, true);
                        testimonialResetting.current = false;
                    }, 550);
                } else {
                    scrollContainerToIdx(testimonialContainerRef, next, false);
                }
                return next;
            });
        }, 4000);
    }, [scrollContainerToIdx]);

    useEffect(() => {
        startTestimonialAutoScroll();
        return () => clearInterval(testimonialInterval.current);
    }, [startTestimonialAutoScroll]);

    // Scroll listener to update testimonial dots on manual swipe
    useEffect(() => {
        const container = testimonialContainerRef.current;
        if (!container) return;
        let debounce;
        const handleScroll = () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                if (testimonialResetting.current) return;
                const center = container.scrollLeft + container.offsetWidth / 2;
                let closest = 0;
                let minDist = Infinity;
                Array.from(container.children).slice(0, testimonials.length).forEach((child, i) => {
                    const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
                    if (dist < minDist) { minDist = dist; closest = i; }
                });
                const cloneStart = container.children[testimonials.length];
                if (cloneStart && container.scrollLeft >= cloneStart.offsetLeft - container.offsetWidth / 2) {
                    testimonialResetting.current = true;
                    container.scrollLeft = container.children[closest].offsetLeft - container.offsetWidth / 2 + container.children[closest].offsetWidth / 2;
                    testimonialResetting.current = false;
                }
                setActiveTestimonial(closest);
            }, 80);
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => { container.removeEventListener('scroll', handleScroll); clearTimeout(debounce); };
    }, []);

    const handleTestimonialInteraction = () => {
        clearInterval(testimonialInterval.current);
        startTestimonialAutoScroll();
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-white overflow-x-hidden">
            <a href="#main" className="skip-link">Skip to content</a>
            <ScrollProgress />

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: navVisible ? 0 : -100 }}
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
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
                            <img src="/icon_4.png" alt="" aria-hidden="true" width="32" height="32" decoding="async" className="w-full h-full object-contain scale-[3]" />
                        </motion.div>
                        <img src="/HeyStyle_White.svg" alt="HeyStyle" width="97" height="96" decoding="async" className="h-[6rem] w-auto" />
                        {/* <span className="text-xl font-bold tracking-tight">
                            Hey<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Style</span>
                        </span> */}
                    </a>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Reviews', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className="text-base text-gray-400 hover:text-white transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
                            </button>
                        ))}
                    </div>

                    {/* Desktop: Get Early Access */}
                    <MagneticButton
                        onClick={() => scrollToSection('contact')}
                        className="hidden md:inline-flex text-sm font-medium px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
                    >
                        Get Early Access
                    </MagneticButton>

                    {/* Mobile: Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08] text-white"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile dropdown menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden"
                        >
                            <div className="px-6 py-4 space-y-1">
                                {[
                                    { label: 'Features', id: 'features' },
                                    { label: 'Reviews', id: 'reviews' },
                                    { label: 'Contact', id: 'contact' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className="block w-full text-left text-base text-gray-300 hover:text-white hover:bg-white/[0.04] px-4 py-3 rounded-xl transition-all"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="block w-full text-left text-base text-primary font-medium px-4 py-3 rounded-xl hover:bg-primary/10 transition-all"
                                >
                                    Get Early Access
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Hero Section */}
            <section id="main" ref={heroRef} onPointerMove={handleHeroPointerMove} onPointerLeave={handleHeroPointerLeave} className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
                            {/* <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 mb-6"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Now available for early access
                            </motion.div> */}

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
                                className="text-base md:text-lg text-gray-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                            >
                                Your all-in-one beauty & grooming app. Book effortlessly, skip the queue, and enjoy premium styling at your fingertips.
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
                            {/* <motion.div
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
                                <div className="text-sm md:text-base">
                                    <div className="flex items-center gap-1 text-primary">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <span className="text-gray-400">Loved by <span className="text-white font-medium">2,000+</span> users</span>
                                </div>
                            </motion.div> */}
                        </motion.div>

                        {/* Right: 3D Mascot */}
                        <motion.div
                            initial={{ opacity: 0, scale: 1.15 }}
                            animate={mascotLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.15 }}
                            transition={{ delay: 0.3, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="relative flex items-center justify-center order-first lg:order-last"
                        >
                            {/* Glow behind mascot */}
                            <div className="absolute inset-0 -z-10 flex items-center justify-center">
                                <div className="w-72 h-72 bg-primary/20 blur-[100px] rounded-full" />
                            </div>

                            <div className="w-[85vw] max-w-[360px] sm:max-w-[400px] lg:max-w-[460px] mx-auto">
                                <MascotSwing src="./mascot_sitting_salon_chair.webp" width={460} />
                            </div>

                            {/* Floating badges */}
                            {/* <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-10 right-4 sm:right-10 glass-card px-4 py-2 flex items-center gap-2 !rounded-full"
                            >
                                <Clock size={14} className="text-primary" />
                                <span className="text-sm font-medium">0 min wait</span>
                            </motion.div> */}

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute bottom-20 left-4 sm:left-5 glass-card px-2.5 py-1 flex items-center gap-1.5 !rounded-full"
                            >
                                <Star size={11} className="text-yellow-400" fill="currentColor" />
                                <span className="text-xs font-medium">4.9 Rating</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute bottom-8 right-4 sm:right-16 glass-card px-2.5 py-1 flex items-center gap-1.5 !rounded-full"
                            >
                                <Heart size={11} className="text-rose-400" fill="currentColor" />
                                <span className="text-xs font-medium">2K+ Happy Users</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                {/* <motion.div
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
                </motion.div> */}
            </section>

            {/* Marquee */}
            <div className="border-y border-white/[0.04] py-2 bg-white/[0.01]">
                <Marquee items={marqueeItems} speed={40} />
            </div>

            {/* Stats Section */}
            <section className="py-10 md:py-20 relative">
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
                                    <p className="text-sm md:text-base text-gray-500">{stat.label}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-12 md:py-24 relative">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full" />
                </div>

                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection className="text-center mb-16">
                        <span className="inline-block text-primary text-sm md:text-base font-medium tracking-wider uppercase mb-4">Features</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Everything you need,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                nothing you don't
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                            Built for people who value their time. Every feature designed to make your beauty journey effortless.
                        </p>
                    </RevealSection>

                    {/* Desktop: grid layout */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <RevealSection key={i} delay={i * 0.08}>
                                <TiltCard className="h-full">
                                    <GlassCard hover={false} className="h-full p-8 group cursor-default">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                        <p className="text-gray-400 leading-relaxed text-base">{feature.desc}</p>
                                    </GlassCard>
                                </TiltCard>
                            </RevealSection>
                        ))}
                    </div>

                    {/* Mobile: horizontal scroll with auto-scroll */}
                    <div
                        ref={featureContainerRef}
                        onTouchStart={handleFeatureInteraction}
                        onMouseDown={handleFeatureInteraction}
                        className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-hide scroll-smooth"
                    >
                        {[...features, ...features].map((feature, i) => (
                            <div key={i} className={`snap-center shrink-0 w-[80vw] max-w-[320px] transition-all duration-300 ${activeFeature === i % features.length ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-70'}`}>
                                <GlassCard hover={false} className="h-full p-6 group cursor-default">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon size={22} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-base">{feature.desc}</p>
                                </GlassCard>
                            </div>
                        ))}
                    </div>
                    {/* Dots indicator for mobile */}
                    <div className="md:hidden flex justify-center mt-4 gap-2">
                        {features.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setActiveFeature(i); scrollContainerToIdx(featureContainerRef, i, false); handleFeatureInteraction(); }}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeFeature === i ? 'bg-primary w-5' : 'bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-12 md:py-24 relative">
                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection className="text-center mb-16">
                        <span className="inline-block text-primary text-sm md:text-base font-medium tracking-wider uppercase mb-4">How it works</span>
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
                                    <p className="text-gray-400 text-base leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="reviews" className="py-12 md:py-24 relative">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
                </div>

                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection className="text-center mb-12">
                        <span className="inline-block text-primary text-sm md:text-base font-medium tracking-wider uppercase mb-4">Testimonials</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            What people are{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                saying
                            </span>
                        </h2>
                    </RevealSection>

                    {/* Swipable testimonial cards */}
                    <div
                        ref={testimonialContainerRef}
                        onTouchStart={handleTestimonialInteraction}
                        onMouseDown={handleTestimonialInteraction}
                        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-hide scroll-smooth"
                    >
                        {[...testimonials, ...testimonials].map((t, i) => (
                            <div key={i} className={`snap-center shrink-0 w-[85vw] md:w-[400px] transition-all duration-300 ${activeTestimonial === i % testimonials.length ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-70'}`}>
                                <GlassCard className="p-8 h-full flex flex-col">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(t.rating)].map((_, j) => (
                                            <Star key={j} size={16} className="text-yellow-400" fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 text-base leading-relaxed flex-1 mb-6">"{t.text}"</p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-white">{t.name}</p>
                                            <p className="text-sm text-gray-500">{t.role}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        ))}
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center mt-6 gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setActiveTestimonial(i); scrollContainerToIdx(testimonialContainerRef, i, false); handleTestimonialInteraction(); }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTestimonial === i ? 'bg-primary w-6' : 'bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 md:py-24 relative">
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
                                    <img src="/icon_4.png" alt="" aria-hidden="true" width="32" height="32" decoding="async" className="w-full h-full object-contain scale-[3]" />
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
            <section id="contact" className="py-12 md:py-24 relative">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
                </div>

                <div className="max-w-screen-xl mx-auto px-6">
                    <RevealSection className="text-center mb-16">
                        <span className="inline-block text-primary text-sm md:text-base font-medium tracking-wider uppercase mb-4">Contact</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Let's build something{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                amazing together
                            </span>
                        </h2>
                    </RevealSection>

                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left info */}
                        <RevealSection>
                            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                                Interested in partnering or have questions? We'd love to hear from you. Fill out the form and our team will get back to you within 24 hours.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: Mail, label: 'Email us', value: 'officialheystyle@gmail.com', href: 'mailto:officialheystyle@gmail.com' },
                                    { icon: Phone, label: 'Call us', value: '+91 79949 60606', href: 'tel:+917994960606' },
                                    { icon: MapPin, label: 'Location', value: 'Bengaluru, India', href: null },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                            <item.icon size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-0.5">{item.label}</p>
                                            {item.href ? (
                                                <a href={item.href} className="text-base text-gray-300 hover:text-primary transition-colors">{item.value}</a>
                                            ) : (
                                                <p className="text-base text-gray-300">{item.value}</p>
                                            )}
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
                <div className="max-w-screen-xl mx-auto px-6 py-8 md:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-8 md:mb-12">
                        {/* Brand */}
                        <div className="col-span-2 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                                    <img src="/icon_4.png" alt="" aria-hidden="true" width="32" height="32" decoding="async" className="w-full h-full object-contain scale-[3]" />
                                </div>
                                <img src="/HeyStyle_White.svg" alt="HeyStyle" width="97" height="96" decoding="async" className="h-[6rem] w-auto" />
                                {/* <span className="text-xl font-bold tracking-tight">
                                    Hey<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Style</span>
                                </span> */}
                            </div>
                            <p className="text-gray-500 text-base max-w-sm leading-relaxed mb-6">
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
                            <h4 className="text-base font-semibold mb-4 text-gray-300">Product</h4>
                            <ul className="space-y-2.5">
                                {['Features', 'Pricing', 'For Salons', 'For Stylists'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-base font-semibold mb-4 text-gray-300">Company</h4>
                            <ul className="space-y-2.5">
                                {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-sm md:text-base">&copy; {new Date().getFullYear()} HeyStyle. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="/privacy-policy" className="text-sm text-gray-600 hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-[9999] w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-white flex items-center justify-center shadow-[0_0_20px_rgba(142,110,232,0.3)] hover:shadow-[0_0_30px_rgba(142,110,232,0.5)] transition-all backdrop-blur-sm"
                        aria-label="Back to top"
                    >
                        <ArrowUp size={20} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
