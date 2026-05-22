import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">N-A-A-S</span>
            <span className="text-xs text-gray-500 ml-2">v1.0</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How it works</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
            <a href="https://github.com" className="text-sm text-gray-400 hover:text-white transition">GitHub</a>
            <Link href="/demo" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="text-sm text-purple-400">Open Source — MIT Licensed</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Give Every AI</span>
            <br />
            <span className="text-white">Your Brain</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Stop re-explaining your work style to every AI agent. 
            N-A-A-S installs your cognitive profile across Claude Code, Gemini, Cursor, and every other AI tool you use — instantly.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-16">
            <code className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono">
              npm install -g naass
            </code>
            <span className="text-gray-500">then</span>
            <code className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono">
              naass init
            </code>
          </div>

          {/* Terminal Preview */}
          <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#0d0d12] overflow-hidden glow-purple">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-4 text-sm text-gray-500">~/naass</span>
            </div>
            <div className="p-6 font-mono text-sm text-left">
              <p className="text-gray-500">$ naass init</p>
              <p className="text-purple-400 mt-2">✓ Avatar initialized</p>
              <p className="text-gray-400 mt-1">Enter your name: <span className="text-white">Uchenna</span></p>
              <p className="text-gray-400 mt-1">MBTI: <span className="text-white">ENTP-A</span></p>
              <p className="text-cyan-400 mt-4">✓ Connected to Claude Code</p>
              <p className="text-cyan-400">✓ Connected to Gemini CLI</p>
              <p className="text-cyan-400">✓ Connected to Cursor</p>
              <p className="text-green-400 mt-4">🎯 You are now set up. Every AI knows you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text">18</div>
              <div className="text-sm text-gray-500 mt-1">Agents synced</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">70%</div>
              <div className="text-sm text-gray-500 mt-1">Faster execution</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">0</div>
              <div className="text-sm text-gray-500 mt-1">Context loss</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">15min</div>
              <div className="text-sm text-gray-500 mt-1">Setup time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Sound familiar?</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
              <div className="text-red-400 font-mono text-sm mb-4">❌ WITHOUT N-A-A-S</div>
              <ul className="space-y-3 text-gray-400">
                <li>→ Every new Claude session: "I'm a direct, fast worker..."</li>
                <li>→ Cursor needs reminding about your stack preferences</li>
                <li>→ Gemini keeps asking questions you've answered 50 times</li>
                <li>→ Context resets. History lost. Start from zero.</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5">
              <div className="text-green-400 font-mono text-sm mb-4">✓ WITH N-A-A-S</div>
              <ul className="space-y-3 text-gray-300">
                <li>→ One install. Every AI knows you instantly.</li>
                <li>→ Your rules, your style, your history — always loaded.</li>
                <li>→ Update once, propagate everywhere.</li>
                <li>→ Zero re-explanation. Pure execution.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400">Three steps. Forever.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Install</h3>
              <p className="text-gray-400 text-sm">
                npm install -g naass<br />
                Then run naass init
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-cyan-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Configure</h3>
              <p className="text-gray-400 text-sm">
                Define your cognitive profile.<br />
                Set your rules. Your stack.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-pink-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-gray-400 text-sm">
                Link your AI tools.<br />
                They load you automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Works with your stack</h2>
            <p className="text-gray-400">Connect every AI tool you use</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Claude Code", icon: "⌨️", status: "stable" },
              { name: "Gemini CLI", icon: "✨", status: "stable" },
              { name: "Cursor", icon: "⊕", status: "stable" },
              { name: "Mavis", icon: "🤖", status: "stable" },
              { name: "OpenClaw", icon: "🦞", status: "stable" },
              { name: "Codex CLI", icon: "⚡", status: "beta" },
              { name: "Warp AI", icon: "⚔️", status: "soon" },
              { name: "Copilot", icon: "💬", status: "soon" }
            ].map((platform) => (
              <div key={platform.name} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-2xl">{platform.icon}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{platform.name}</span>
                  {platform.status === "stable" && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                  {platform.status === "beta" && (
                    <span className="text-xs text-yellow-400">beta</span>
                  )}
                  {platform.status === "soon" && (
                    <span className="text-xs text-gray-500">soon</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple pricing</h2>
            <p className="text-gray-400">Start free. Scale as you grow.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-gray-400 font-medium mb-2">Free</div>
              <div className="text-5xl font-bold mb-6">$0</div>
              <ul className="space-y-3 text-sm text-gray-400 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 1 Knowledge Base</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 3 Agent connections</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Local-only storage</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Community support</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 transition">
                Get Started
              </button>
            </div>
            
            {/* Pro */}
            <div className="p-8 rounded-2xl border border-purple-500 bg-purple-500/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-purple-500 text-xs font-medium">
                Popular
              </div>
              <div className="text-purple-400 font-medium mb-2">Pro</div>
              <div className="text-5xl font-bold mb-6">$9<span className="text-lg text-gray-400">/mo</span></div>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited KBs</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 10 Agent connections</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Cloudflare hosted</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority support</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Real-time sync</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-medium transition">
                Start Free Trial
              </button>
            </div>
            
            {/* Team */}
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-gray-400 font-medium mb-2">Team</div>
              <div className="text-5xl font-bold mb-6">$29<span className="text-lg text-gray-400">/mo</span></div>
              <ul className="space-y-3 text-sm text-gray-400 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Everything in Pro</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited agents</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Team KB sharing</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> MCP marketplace</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Dedicated support</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 transition">
                Contact Sales
              </button>
            </div>
          </div>
          
          <p className="text-center text-gray-500 mt-8">
            Enterprise pricing available. <a href="mailto:hello@naass.io" className="text-purple-400 hover:underline">Contact us</a>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Your AI tools should know you.
            <br />
            <span className="gradient-text">Make it happen.</span>
          </h2>
          <p className="text-gray-400 mb-10">
            15 minutes to set up. Years of seamless context.
          </p>
          <div className="flex items-center justify-center gap-4">
            <code className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 font-mono">
              npm install -g naass
            </code>
            <a href="https://github.com" className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-medium transition">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">N-A-A-S</span>
            <span className="text-gray-500 text-sm">MIT License</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="https://github.com" className="hover:text-white transition">GitHub</a>
            <a href="/docs" className="hover:text-white transition">Docs</a>
            <a href="/api" className="hover:text-white transition">API</a>
            <a href="mailto:hello@naass.io" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}