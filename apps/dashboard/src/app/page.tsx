'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  Link2,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

const platforms = [
  { name: 'Hermes', icon: '🧠', status: 'Local adapter observed' },
  { name: 'Codex', icon: '⌘', status: 'Local adapter observed' },
  { name: 'Antigravity', icon: '✦', status: 'Local adapter observed' },
  { name: 'Claude Code', icon: '⌨️', status: 'Certification pending' },
  { name: 'Gemini CLI', icon: '✨', status: 'Certification pending' },
  { name: 'ReMe', icon: '📝', status: 'Optional projection' },
];

const features = [
  {
    icon: Brain,
    title: 'Inspectable Avatar',
    desc: 'A schema for identity, communication, rules, privacy and scope. Sensitive fields remain optional and private by default.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Shield,
    title: 'Evidence-Gated Conformance',
    desc: 'Local fixtures and hosted MCP checks are tested separately from behavioural fidelity and host acceptance.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Code2,
    title: 'Target Adapters',
    desc: 'Compile approved context for a named host, with unsupported fields and release limits made visible.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Terminal,
    title: 'CLI and No-Code Paths',
    desc: 'Developers can script the CLI; non-technical users use the guided desktop flow without editing configuration.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: Settings,
    title: 'Reversible Changes',
    desc: 'Preview, backup, reload verification and rollback are part of the product contract—not hidden side effects.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Link2,
    title: 'Optional Memory Projections',
    desc: 'SQLite + FTS5 remains canonical. ReMe and future providers are explicit, rebuildable projections.',
    color: 'from-indigo-500 to-violet-500',
  },
];

const steps = [
  {
    num: '01',
    icon: Terminal,
    title: 'Init',
    desc: 'pnpm exec naavos init\nCreates ~/.naavos/avatar.json',
  },
  {
    num: '02',
    icon: Settings,
    title: 'Configure',
    desc: 'Edit avatar.json\nIdentity, rules, adapters, privacy',
  },
  {
    num: '03',
    icon: Link2,
    title: 'Compile & Install',
    desc: 'naavos compile --target hermes\nnaavos install --target hermes',
  },
];

export default function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const t1 = gsap.fromTo(
      '.hero-title',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }
    );
    const t2 = gsap.fromTo(
      '.hero-badge',
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.15, ease: 'back.out(1.7)' }
    );
    const t3 = gsap.fromTo(
      '.terminal-preview',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: 'power2.out' }
    );
    const t4 = gsap.fromTo(
      '.feature-card',
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
      }
    );

    return () => {
      t1.kill();
      t2.kill();
      t3.kill();
      t4.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 inset-x-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                NAAvOS
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                How it works
              </a>
              <a
                href="#release"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Release status
              </a>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden bg-zinc-950 border-b border-white/5">
              <div className="px-4 py-4 space-y-3">
                <a
                  href="#features"
                  className="block text-sm text-zinc-400 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="block text-sm text-zinc-400 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it works
                </a>
                <a
                  href="#release"
                  className="block text-sm text-zinc-400 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Release status
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-sm text-violet-400 font-medium">
              Controlled development release — public gate in progress
            </span>
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Give Every AI
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Brain
            </span>
          </h1>

          <p className="hero-title text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            NAAvOS helps you define an inspectable, user-owned Avatar package and compile approved
            context for supported AI hosts — from a single{' '}
            <span className="text-white font-mono text-sm">avatar.json</span>.
          </p>

          <div className="terminal-preview max-w-3xl mx-auto rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-violet-500/10 text-left">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-zinc-800/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-4 text-xs text-zinc-500 font-mono">~/naavos</span>
            </div>
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm">
              <p className="text-zinc-500">$ pnpm install</p>
              <p className="text-zinc-500 mt-1">$ pnpm exec naavos init</p>
              <p className="text-violet-400 mt-3 sm:mt-4">
                ✓ Avatar Source Package created at ~/.naavos/avatar.json
              </p>
              <p className="text-zinc-500 mt-2">$ pnpm exec naavos compile --target hermes</p>
              <p className="text-cyan-400 mt-1">
                ✓ Compiled → hermes (SOUL.md, SKILL.md, memories/)
              </p>
              <p className="text-zinc-500 mt-2">$ pnpm exec naavos compile --target claude-code</p>
              <p className="text-cyan-400 mt-1">✓ Compiled → claude-code (CLAUDE.md)</p>
              <p className="text-zinc-500 mt-2">$ pnpm exec naavos compile --target cursor</p>
              <p className="text-cyan-400 mt-1">✓ Compiled → cursor (.cursorrules)</p>
              <p className="text-zinc-500 mt-2">$ pnpm exec naavos install --target hermes</p>
              <p className="text-emerald-400 mt-1">✓ Backup created. Files installed.</p>
            </div>
          </div>

          <div className="hero-title flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="#release"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium"
            >
              See release status
            </a>
            <a
              href="#how-it-works"
              className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 font-medium flex items-center gap-2"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-zinc-500" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Local
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 mt-2">First-class privacy</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                MIT
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 mt-2">License</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                MCP
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 mt-2">Hosted protocol surface</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ESM
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 mt-2">Module system</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-12 sm:mb-16">
            Sound familiar?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <span className="text-red-400 font-mono text-xs sm:text-sm">WITHOUT NAAvOS</span>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  'Every new Claude session: re-explain your rules.',
                  'Context resets. History lost.',
                  'Every agent needs its own config file.',
                  'No way to verify agents actually follow your rules.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm sm:text-base">
                    <span className="text-red-400 mt-1">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <span className="text-emerald-400 font-mono text-xs sm:text-sm">WITH NAAvOS</span>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  'One avatar.json. Every agent knows you.',
                  'Rules, style, history — always loaded.',
                  'Update once. Compile everywhere.',
                  'Conformance tests prove agents follow your rules.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm sm:text-base">
                    <span className="text-emerald-400 mt-1">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        ref={featuresRef}
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-400">Core Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">What it does</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card p-4 sm:p-6 rounded-2xl border border-white/10 bg-zinc-900/50 hover:border-violet-500/30 transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-zinc-400 text-sm sm:text-base">Three steps. No fluff.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-zinc-900/50"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 sm:mb-6">
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-4xl sm:text-5xl font-bold text-zinc-800/30">{step.num}</span>
                <h3 className="text-lg sm:text-xl font-semibold mt-2 mb-3">{step.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-mono whitespace-pre-line">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Targets */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Supported targets</h2>
            <p className="text-zinc-400 text-sm sm:text-base">Compile once. Install anywhere.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="p-3 sm:p-4 rounded-xl border border-white/10 bg-zinc-900/50 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">{platform.icon}</span>
                <span className="font-medium text-xs sm:text-sm text-center">{platform.name}</span>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-mono">
                  {platform.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="release"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-transparent to-violet-500/5"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Open development.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Public release in progress.
            </span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg mb-8 sm:mb-10">
            The product is being prepared for a verified open-source release. Local-first storage
            and telemetry-off defaults are already part of the design; source publication and signed
            distribution remain release gates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a
              href="mailto:hello@naavos.radoss.agency?subject=NAAvOS%20public%20preview"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium"
            >
              Request the public preview
            </a>
            <a
              href="#how-it-works"
              className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 font-medium"
            >
              Read the product path
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              NAAvOS
            </span>
            <span className="text-zinc-500 text-xs sm:text-sm ml-2">Development release</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-zinc-500">
            <a href="#release" className="hover:text-white transition-colors">
              Release status
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Product path
            </a>
            <a
              href="mailto:hello@naavos.radoss.agency"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
