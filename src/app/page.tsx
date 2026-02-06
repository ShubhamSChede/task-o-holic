// app/page.tsx
'use client';

import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Check, Zap, Shield, Users, BarChart3, Clock, Target, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="relative overflow-hidden">
      {/* Animated background */}
      <BackgroundEffects mousePosition={mousePosition} />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection scrollY={scrollY} />
      
      {/* Testimonials Carousel */}
      <TestimonialsCarousel />
      
      {/* About Us Section */}
      <AboutSection />
      
      {/* Features Carousel */}
      <FeaturesCarousel />
      
      {/* Use Cases Section */}
      <UseCasesSection />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* FAQs Section */}
      <FAQsSection />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}

function BackgroundEffects({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  return (
    <div className="fixed inset-0 -z-10">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(56, 189, 248, 0.3) 0%, transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(52, 211, 153, 0.25) 0%, transparent 50%),
            radial-gradient(circle at ${mousePosition.x * 0.7}% ${mousePosition.y * 0.7}%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)
          `,
          filter: 'blur(100px)',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.95)_0%,_rgba(15,23,42,1)_100%)]" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
          }}
        />
      </div>
      
      {/* Floating orbs with enhanced animations */}
      <motion.div
        className="absolute top-20 left-10 h-[500px] w-[500px] rounded-full bg-cyan-400/5 blur-3xl"
        animate={{
          x: [0, 150, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-[600px] w-[600px] rounded-full bg-emerald-400/5 blur-3xl"
        animate={{
          x: [0, -120, 0],
          y: [0, -80, 0],
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 z-50 w-full transition-all ${
        scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8 lg:px-16">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent font-[var(--font-playfair)]"
        >
          Task-o-holic
        </motion.div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-slate-300 hover:text-cyan-400 transition-colors font-[var(--font-space)]">Features</a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-cyan-400 transition-colors font-[var(--font-space)]">Pricing</a>
          <a href="#faqs" className="text-sm text-slate-300 hover:text-cyan-400 transition-colors font-[var(--font-space)]">FAQs</a>
          <Link href="/login" className="text-sm text-slate-300 hover:text-cyan-400 transition-colors font-[var(--font-space)]">Sign in</Link>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950 font-[var(--font-space)]"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection({ scrollY }: { scrollY: ReturnType<typeof useScroll>['scrollY'] }) {
  // Create a fallback motion value that always returns 0
  const fallbackScrollY = useMotionValue(0);
  // Use scrollY if available, otherwise use fallback - hooks must be called unconditionally
  const activeScrollY = scrollY || fallbackScrollY;
  
  const y1 = useTransform(activeScrollY, [0, 500], [0, 200]);
  const opacity = useTransform(activeScrollY, [0, 500], [1, 0]);
  
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 sm:px-8 lg:px-16 pt-32">
      <motion.div
        style={{ y: y1, opacity }}
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2"
      >
        {/* Left: Hero content */}
        <div className="space-y-10 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex h-10 items-center rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 via-cyan-400/5 to-transparent px-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-sm font-[var(--font-space)]"
            >
              Enterprise-grade productivity
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl font-[var(--font-playfair)]"
          >
            <motion.span 
              className="block"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Transform
            </motion.span>
            <span className="relative inline-block">
              <motion.span
                className="block bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                chaos into clarity
              </motion.span>
              <motion.div
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl font-[var(--font-space)]"
          >
            The next-generation task management platform engineered for{' '}
            <span className="font-semibold text-cyan-300">high-performance teams</span> and{' '}
            <span className="font-semibold text-emerald-300">ambitious individuals</span>.
            Execute with precision, collaborate seamlessly, achieve mastery.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-8 py-4 text-base font-bold text-slate-950 shadow-[0_20px_60px_rgba(56,189,248,0.4)] transition-all duration-300 font-[var(--font-space)]"
              >
                <span className="relative z-10">Start free trial</span>
                <motion.span
                  className="relative z-10"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>

            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center rounded-2xl border-2 border-slate-700/50 bg-slate-900/40 px-6 py-4 text-base font-semibold text-slate-100 backdrop-blur-sm transition-all hover:border-cyan-400/50 hover:bg-slate-800/60 font-[var(--font-space)]"
              >
                Sign in
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Interactive preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative"
        >
          <InteractiveDashboardPreview />
        </motion.div>
      </motion.div>
    </section>
  );
}

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, TechStart Inc.',
      content: 'Task-o-holic transformed how our team collaborates. We&apos;ve seen a 40% increase in productivity since switching.',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager',
      content: 'The best task manager I&apos;ve used. Clean interface, powerful features, and it just works. Highly recommend!',
      avatar: '👨‍💻',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Freelance Designer',
      content: 'As a solo entrepreneur, Task-o-holic keeps me organized and focused. The frequent task templates are a game-changer.',
      avatar: '👩‍🎨',
      rating: 5,
    },
    {
      name: 'David Kim',
      role: 'Engineering Lead',
      content: 'Our engineering team loves the organization features. It&apos;s become essential to our workflow.',
      avatar: '👨‍🔧',
      rating: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={ref} className="relative py-32 px-4 sm:px-8 lg:px-16 bg-slate-950/30">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-50 mb-4 sm:text-5xl font-[var(--font-playfair)]">
            Loved by <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">thousands</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-[var(--font-space)]">
            See what our users are saying about Task-o-holic
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl border border-slate-800/50 bg-slate-900/40 p-12 backdrop-blur-sm"
            >
              <Quote className="h-12 w-12 text-cyan-400/50 mb-6" />
              <p className="text-2xl text-slate-100 mb-8 font-[var(--font-space)] leading-relaxed">
                &ldquo;{testimonials[currentIndex].content}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{testimonials[currentIndex].avatar}</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-50 font-[var(--font-playfair)]">{testimonials[currentIndex].name}</h4>
                    <p className="text-slate-400 font-[var(--font-space)]">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="rounded-full border border-slate-700 bg-slate-900/50 p-3 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="rounded-full border border-slate-700 bg-slate-900/50 p-3 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="about" className="relative py-32 px-4 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-50 mb-4 sm:text-5xl font-[var(--font-playfair)]">
            Built for <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">excellence</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-[var(--font-space)]">
            Task-o-holic isn&apos;t just another task manager. It&apos;s a comprehensive productivity ecosystem designed for teams and individuals who refuse to settle for mediocrity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: 'Mission-Driven',
              description: 'Every feature is designed with one goal: helping you achieve more with less friction.',
              gradient: 'from-cyan-400 to-cyan-300',
            },
            {
              icon: Sparkles,
              title: 'Innovation First',
              description: 'We continuously evolve based on real user feedback and cutting-edge productivity research.',
              gradient: 'from-emerald-400 to-emerald-300',
            },
            {
              icon: Users,
              title: 'Community Focused',
              description: 'Built by productivity enthusiasts, for productivity enthusiasts. Your success is our success.',
              gradient: 'from-amber-400 to-amber-300',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
              className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-8 backdrop-blur-sm"
            >
              <motion.div
                className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${item.gradient} mb-4`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <item.icon className="h-8 w-8 text-slate-950" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-50 mb-3 font-[var(--font-playfair)]">{item.title}</h3>
              <p className="text-slate-300 font-[var(--font-space)]">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built for speed. Every interaction is optimized for instant feedback and seamless performance.',
      gradient: 'from-cyan-400 to-cyan-300',
      image: '⚡',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security protocols. Your data is protected with industry-leading standards.',
      gradient: 'from-emerald-400 to-emerald-300',
      image: '🔒',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Organizations, shared workspaces, and real-time collaboration. Work together, achieve together.',
      gradient: 'from-amber-400 to-amber-300',
      image: '👥',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your productivity trends, completion rates, and performance metrics with detailed insights.',
      gradient: 'from-cyan-400 to-emerald-400',
      image: '📊',
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'Intelligent due dates, recurring tasks, and frequent task templates. Automate your workflow.',
      gradient: 'from-emerald-400 to-amber-400',
      image: '⏰',
    },
    {
      icon: Target,
      title: 'Priority Management',
      description: 'Focus on what matters. Advanced priority systems help you tackle high-impact work first.',
      gradient: 'from-amber-400 to-cyan-400',
      image: '🎯',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % features.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);

  return (
    <section ref={ref} id="features" className="relative py-32 px-4 sm:px-8 lg:px-16 bg-slate-950/50">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-50 mb-4 sm:text-5xl font-[var(--font-playfair)]">
            Powerful <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">features</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-[var(--font-space)]">
            Everything you need to manage tasks, collaborate with teams, and achieve your goals.
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {features.slice(currentIndex, currentIndex + 3).map((feature, i) => (
                <motion.div
                  key={`${currentIndex}-${i}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group rounded-2xl border border-slate-800/50 bg-slate-900/30 p-8 backdrop-blur-sm transition-all hover:border-cyan-400/50"
                >
                  <div className="text-6xl mb-4">{feature.image}</div>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                    <feature.icon className="h-6 w-6 text-slate-950" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-50 mb-3 font-[var(--font-playfair)]">{feature.title}</h3>
                  <p className="text-slate-300 font-[var(--font-space)]">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="rounded-full border border-slate-700 bg-slate-900/50 p-3 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(features.length / 3) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 3)}
                  className={`h-2 rounded-full transition-all ${
                    Math.floor(currentIndex / 3) === i ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="rounded-full border border-slate-700 bg-slate-900/50 p-3 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const useCases = [
    {
      title: 'Solo Entrepreneurs',
      description: 'Manage your entire business from one place. Track projects, deadlines, and priorities without the overhead.',
      image: '🚀',
      color: 'cyan',
    },
    {
      title: 'Development Teams',
      description: 'Organize sprints, track features, and collaborate seamlessly. Perfect for agile workflows and remote teams.',
      image: '💻',
      color: 'emerald',
    },
    {
      title: 'Creative Agencies',
      description: 'Keep client projects organized, track deliverables, and ensure nothing falls through the cracks.',
      image: '🎨',
      color: 'amber',
    },
    {
      title: 'Students & Researchers',
      description: 'Organize coursework, research tasks, and deadlines. Stay on top of your academic journey.',
      image: '📚',
      color: 'cyan',
    },
  ];

  return (
    <section ref={ref} className="relative py-32 px-4 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-50 mb-4 sm:text-5xl font-[var(--font-playfair)]">
            Perfect for <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">everyone</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-[var(--font-space)]">
            Whether you&apos;re a solo founder or part of a large team, Task-o-holic adapts to your workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, i) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50, rotateY: i % 2 === 0 ? -10 : 10 }}
              animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              whileHover={{ scale: 1.02, y: -8, rotateY: 0 }}
              className="relative rounded-2xl border border-slate-800/50 bg-slate-900/30 p-8 backdrop-blur-sm overflow-hidden group"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r from-${useCase.color}-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <motion.div
                className="text-7xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              >
                {useCase.image}
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-50 mb-3 relative z-10 font-[var(--font-playfair)]">{useCase.title}</h3>
              <p className="text-slate-300 text-lg relative z-10 font-[var(--font-space)]">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals getting started',
      features: [
        'Unlimited personal tasks',
        'Basic organization features',
        'Up to 3 organizations',
        'Standard support',
      ],
      cta: 'Get Started',
      popular: false,
      gradient: 'from-slate-800 to-slate-900',
    },
    {
      name: 'Pro',
      price: '$12',
      period: 'per month',
      description: 'For power users and small teams',
      features: [
        'Everything in Free',
        'Unlimited organizations',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'Team collaboration tools',
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-cyan-400 to-emerald-400',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom deployment options',
        'Advanced security features',
        'SLA guarantee',
        'Training & onboarding',
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-emerald-400 to-amber-400',
    },
  ];

  return (
    <section ref={ref} id="pricing" className="relative py-32 px-4 sm:px-8 lg:px-16 bg-slate-950/50">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-50 mb-4 sm:text-5xl font-[var(--font-playfair)]">
            Simple <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">pricing</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-[var(--font-space)]">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: plan.popular ? 1.05 : 1 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              whileHover={{ scale: plan.popular ? 1.08 : 1.05, y: -8 }}
              className={`relative rounded-2xl border p-8 backdrop-blur-sm ${
                plan.popular
                  ? 'border-cyan-400/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90'
                  : 'border-slate-800/50 bg-slate-900/30'
              }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  <span className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-1 text-xs font-semibold text-slate-950">
                    Most Popular
                  </span>
                </motion.div>
              )}
              <h3 className="text-2xl font-bold text-slate-50 mb-2 font-[var(--font-playfair)]">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-slate-50 font-[var(--font-playfair)]">{plan.price}</span>
                <span className="text-slate-400 ml-2 font-[var(--font-space)]">{plan.period}</span>
              </div>
              <p className="text-slate-300 mb-6 font-[var(--font-space)]">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 font-[var(--font-space)]">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              <Link href={plan.name === 'Enterprise' ? 'mailto:sales@taskoholic.com' : '/register'}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full rounded-xl py-3 font-semibold transition-all font-[var(--font-space)] ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950'
                      : 'border-2 border-slate-700 bg-slate-900/50 text-slate-100 hover:border-cyan-400/50'
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All plans come with a 14-day free trial. No credit card required.',
    },
    {
      question: 'Can I change plans later?',
      answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'Your data remains accessible for 30 days after cancellation. You can export everything before then.',
    },
    {
      question: 'Do you offer team discounts?',
      answer: 'Yes! Teams of 10+ members get a 20% discount. Contact us for enterprise pricing.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption, regular security audits, and comply with industry standards.',
    },
    {
      question: 'Can I use Task-o-holic offline?',
      answer: 'Currently, Task-o-holic requires an internet connection. Offline mode is coming in Q2 2025.',
    },
  ];

  return (
    <section ref={ref} id="faqs" className="relative py-32 px-4 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-50 mb-4 sm:text-5xl font-[var(--font-playfair)]">
            Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold text-slate-50 font-[var(--font-playfair)]">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === i ? 'auto' : 0,
                  opacity: openIndex === i ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-slate-300 font-[var(--font-space)]">{faq.answer}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-slate-800/50 bg-slate-950/80 py-16 px-4 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4 font-[var(--font-playfair)]">
              Task-o-holic
            </h3>
            <p className="text-slate-400 text-sm font-[var(--font-space)]">
              The next-generation task management platform for high-performance teams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-50 mb-4 font-[var(--font-playfair)]">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400 font-[var(--font-space)]">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
              <li><a href="#faqs" className="hover:text-cyan-400 transition-colors">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-50 mb-4 font-[var(--font-playfair)]">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400 font-[var(--font-space)]">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-50 mb-4 font-[var(--font-playfair)]">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400 font-[var(--font-space)]">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm font-[var(--font-space)]">© 2025 Task-o-holic. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-[var(--font-space)]">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-[var(--font-space)]">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InteractiveDashboardPreview() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-emerald-400/20 to-amber-400/20 blur-2xl" />
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.9)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-center justify-between border-b border-slate-800/50 pb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
            />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 font-[var(--font-space)]">
              Mission Control
            </span>
          </div>
          <motion.span
            whileHover={{ scale: 1.1 }}
            className="rounded-full bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 px-3 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-sm font-[var(--font-space)]"
          >
            Active
          </motion.span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-4 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500 font-[var(--font-space)]">Tasks</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300 font-[var(--font-playfair)]">247</p>
            <p className="mt-1 text-xs text-emerald-400 font-[var(--font-space)]">+12% this week</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-4 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500 font-[var(--font-space)]">Completion</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300 font-[var(--font-playfair)]">94%</p>
            <p className="mt-1 text-xs text-cyan-400 font-[var(--font-space)]">All-time high</p>
          </motion.div>
        </div>

        <div className="space-y-3">
          {[
            { title: 'Ship v2.0 features', team: 'Engineering', progress: 85, gradient: 'from-cyan-400 to-cyan-300' },
            { title: 'Q4 planning session', team: 'Strategy', progress: 60, gradient: 'from-emerald-400 to-emerald-300' },
            { title: 'Client presentation', team: 'Sales', progress: 100, gradient: 'from-amber-400 to-amber-300' },
          ].map((task, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              onHoverStart={() => setHoveredCard(i)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`group relative overflow-hidden rounded-xl border ${
                hoveredCard === i
                  ? 'border-cyan-400/50 bg-slate-900/60'
                  : 'border-slate-800/50 bg-slate-900/30'
              } p-4 backdrop-blur-sm transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-100 font-[var(--font-playfair)]">{task.title}</h4>
                  <p className="mt-1 text-xs text-slate-400 font-[var(--font-space)]">{task.team}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                      className={`h-full bg-gradient-to-r ${task.gradient}`}
                    />
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: hoveredCard === i ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="ml-4 text-2xl"
                >
                  {task.progress === 100 ? '✓' : '→'}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
