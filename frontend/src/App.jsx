// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

/* ---------- Reusable random users ---------- */
const USERS = [
  { name: "Riya", color: "#8b5cf6", initial: "R" },
  { name: "Karan", color: "#3b82f6", initial: "K" },
  { name: "Meera", color: "#10b981", initial: "M" },
  { name: "Arjun", color: "#ec4899", initial: "A" },
  { name: "Sana", color: "#f59e0b", initial: "S" },
];

function Lines({ n = 3 }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded bg-slate-200 ${i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-4/5" : "w-3/5"}`} />
      ))}
    </div>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-32 md:pt-40">
      {/* Mesh Gradient Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-white">
        <div className="absolute left-1/2 top-[-240px] h-[540px] w-[1100px] -translate-x-1/2 rounded-full bg-brand/45 blur-[130px]" />
        <div className="absolute left-[-200px] top-[220px] h-[440px] w-[540px] rounded-full bg-sky-300/50 blur-[120px]" />
        <div className="absolute right-[-180px] top-[240px] h-[480px] w-[580px] rounded-full bg-pink/35 blur-[120px]" />
        <div className="absolute bottom-[-140px] left-1/2 h-[380px] w-[950px] -translate-x-1/2 rounded-full bg-pink/25 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-canvas" />
      </div>

      <div className="mx-auto max-w-6xl px-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-pink shadow-sm backdrop-blur">
          ✨ Real-time collaboration for teams
        </span>

        <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tighter text-ink sm:text-6xl md:text-7xl">
          Everything your team creates, <span className="text-brand">together.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
          Create documents, reports, and presentations. Collaborate in real time and bring every project into one beautiful workspace.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={() => navigate("/signup")} className="w-full rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand/30 transition-all hover:-translate-y-0.5 hover:bg-brand-deep sm:w-auto">
            Start Creating
          </button>
          <a href="#templates" className="w-full rounded-xl border border-white/80 bg-white/70 px-7 py-3.5 text-sm font-semibold text-ink shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white sm:w-auto text-center">
            Explore Templates
          </a>
        </div>
        <p className="mt-5 text-xs font-medium text-slate-500">Free for students · No credit card</p>
      </div>

      {/* Product Mockup */}
      <div className="relative mx-auto mt-16 max-w-5xl px-5">
        <div className="rounded-[1.75rem] bg-white/40 p-2 shadow-2xl shadow-brand/15 ring-1 ring-white/70 backdrop-blur-sm md:p-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {/* Browser bar */}
            <div className="flex items-center gap-2 border-b border-line bg-canvas px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="ml-4 hidden rounded-md bg-white px-3 py-1 text-[11px] text-muted sm:block">app.docsyne.com/dashboard</span>
            </div>

            <div className="flex min-h-[340px] text-left">
              {/* Mock Sidebar */}
              <aside className="hidden w-44 shrink-0 border-r border-line bg-canvas p-4 sm:block">
                <div className="space-y-1 text-xs font-medium text-muted">
                  <div className="flex items-center gap-2 rounded-lg bg-brand-light px-3 py-2 text-brand">🏠 Overview</div>
                  <div className="flex items-center gap-2 px-3 py-2">📄 My Documents</div>
                  <div className="flex items-center gap-2 px-3 py-2">👥 Shared</div>
                  <div className="flex items-center gap-2 px-3 py-2">⭐ Favorites</div>
                  <div className="flex items-center gap-2 px-3 py-2">📋 Templates</div>
                </div>
              </aside>

              {/* Mock Main */}
              <div className="flex-1 p-5 md:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Good morning, Team!</p>
                    <p className="text-xs text-muted">What are we creating today?</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                    </span>
                    <div className="flex -space-x-2">
                      {USERS.slice(0, 3).map((u) => (
                        <span key={u.name} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white" style={{ background: u.color }}>{u.initial}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { title: "Q3 Product Roadmap", tag: "Doc", color: "bg-brand/60" },
                    { title: "Startup Pitch Deck", tag: "Deck", color: "bg-pink/60" },
                    { title: "Design System v2.0", tag: "Doc", color: "bg-brand/60" },
                  ].map((doc) => (
                    <div key={doc.title} className="rounded-xl border border-line bg-white p-4">
                      <div className="mb-3 space-y-1.5 rounded-lg bg-canvas p-3">
                        <div className={`h-2 w-2/3 rounded ${doc.color}`} />
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="h-1.5 w-4/5 rounded bg-slate-200" />
                      </div>
                      <p className="text-xs font-semibold leading-snug text-ink">{doc.title}</p>
                      <p className="text-[11px] text-muted">{doc.tag} · Edited 2h ago</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating side cards */}
        <div className="absolute -bottom-10 left-2 hidden w-48 rounded-2xl border border-white/80 bg-white p-3 shadow-xl shadow-slate-900/10 md:block lg:-left-6">
          <div className="grid aspect-video place-items-center rounded-lg bg-gradient-to-br from-brand to-pink text-[10px] font-bold text-white">Pitch Deck</div>
          <p className="mt-2 text-[11px] font-semibold">Startup Pitch Deck</p>
          <p className="text-[10px] text-muted">12 slides</p>
        </div>
        <div className="absolute -bottom-10 right-2 hidden w-56 rounded-2xl border border-white/80 bg-white p-3 shadow-xl shadow-slate-900/10 md:block lg:-right-6">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-pink text-[9px] font-bold text-white">R</span>
            <p className="text-[11px] font-semibold">Riya</p>
            <span className="ml-auto text-muted">💬</span>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted">Can we add the system architecture diagram here?</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- NEW FEATURES ---------- */
function NewFeatures() {
  const features = [
    { emoji: "👥", title: "Real-Time Collaboration", text: "Edit together and see every change as it happens." },
    { emoji: "📐", title: "Smart Templates", text: "Start from ready-made reports, decks, and docs.", accent: true },
    { emoji: "🎯", title: "Reports & Presentations", text: "Write the report and build the slides in one place." },
    { emoji: "🔗", title: "Document Sharing", text: "Invite people as viewers or editors with one link." },
    { emoji: "🕘", title: "Version History", text: "Look back at any version and restore it in a click." },
    { emoji: "📁", title: "Project Workspaces", text: "Keep every file for a project together." },
  ];

  return (
    <section id="features" className="relative isolate scroll-mt-16 overflow-hidden bg-canvas py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 -z-10 h-80 w-80 rounded-full bg-pink/10 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-80 w-80 rounded-full bg-brand/10 blur-[100px]" />

      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Everything you need to create together.</h2>
          <p className="mt-4 text-slate-600">One place for writing, presenting, and keeping your team on the same page.</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-line bg-white/80 p-7 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-xl hover:shadow-brand/10">
              <span className={`grid h-12 w-12 place-items-center rounded-xl text-2xl ${f.accent ? "bg-pink-soft" : "bg-brand-light"}`}>
                {f.emoji}
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- NEW TEMPLATES SHOWCASE ---------- */
function TemplatesShowcase() {
  const templates = [
    {
      title: "College Project Report",
      tag: "Academic Report",
      thumb: (
        <div className="h-full rounded-md bg-white p-4 shadow-sm">
          <div className="mb-3 h-2.5 w-3/4 rounded bg-brand" />
          <div className="mb-4 h-1.5 w-1/3 rounded bg-slate-300" />
          <Lines n={5} />
        </div>
      ),
    },
    {
      title: "Startup Pitch Deck",
      tag: "Presentation",
      popular: true,
      thumb: (
        <div className="grid h-full place-items-center rounded-md bg-gradient-to-br from-brand to-pink p-4 text-center shadow-sm">
          <div>
            <div className="mx-auto h-2.5 w-24 rounded bg-white" />
            <div className="mx-auto mt-2 h-1.5 w-16 rounded bg-white/60" />
          </div>
        </div>
      ),
    },
    {
      title: "Software Documentation",
      tag: "Documentation",
      thumb: (
        <div className="flex h-full gap-3 rounded-md bg-white p-4 shadow-sm">
          <div className="w-1/4 space-y-1.5">
            <div className="h-1.5 rounded bg-brand/50" />
            <div className="h-1.5 rounded bg-slate-200" />
            <div className="h-1.5 rounded bg-slate-200" />
          </div>
          <div className="flex-1">
            <div className="mb-3 h-2.5 w-2/3 rounded bg-slate-800" />
            <div className="mb-2 h-8 rounded bg-slate-800/90" />
            <Lines n={3} />
          </div>
        </div>
      ),
    },
    {
      title: "Meeting Notes",
      tag: "Everyday Document",
      thumb: (
        <div className="h-full rounded-md bg-white p-4 shadow-sm">
          <div className="mb-3 h-2.5 w-1/2 rounded bg-slate-800" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <span className={`h-3 w-3 rounded border ${i === 0 ? "border-brand bg-brand" : "border-slate-300"}`} />
              <div className="h-1.5 flex-1 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="templates" className="scroll-mt-16 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Start with a template. Finish something amazing.</h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <div key={t.title} className="group relative cursor-pointer rounded-2xl border border-line bg-white p-3 transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-xl hover:shadow-brand/10">
              {t.popular && (
                <span className="absolute right-5 top-5 z-10 rounded-full bg-pink px-2.5 py-0.5 text-[10px] font-bold text-white">Popular</span>
              )}
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-light to-pink-soft p-3">{t.thumb}</div>
              <div className="px-2 pb-2 pt-4">
                <h3 className="font-bold text-ink">{t.title}</h3>
                <span className="mt-2 inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand">{t.tag}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="inline-block rounded-xl border border-line bg-white px-6 py-3 text-sm font-semibold transition-colors hover:border-brand hover:text-brand">
            Explore All Templates
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- UPDATED COLLAB SECTION ---------- */
function CollabSection() {
  const collabPoints = [
    "See who is editing and where, live",
    "Comment on any line and resolve it together",
    "Every change is saved, with full version history",
  ];

  return (
    <section id="about" className="relative isolate scroll-mt-16 overflow-hidden bg-white py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-pink/10 blur-[110px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Your entire team, in sync.</h2>
          <p className="mt-4 text-slate-600">Stop sending files back and forth. Work in one document and everyone always has the latest version.</p>
          <ul className="mt-8 space-y-4">
            {collabPoints.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm font-medium text-ink">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand/20 to-pink/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="text-sm font-semibold">Q3 Product Launch Strategy</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> 3 online
                </span>
                <div className="flex -space-x-2">
                  {USERS.slice(0, 3).map((u) => (
                    <span key={u.name} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white" style={{ background: u.color }}>{u.initial}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative space-y-4 px-6 py-8 pr-24 sm:pr-32">
              <h4 className="text-lg font-bold">Executive Summary</h4>
              <p className="text-sm leading-relaxed text-muted">
                Our new SaaS platform is set to disrupt the productivity market. The design system focuses on speed, clarity, and real-time multiplayer features.
              </p>
              <p className="relative text-sm leading-relaxed text-muted">
                The rollout strategy is split into three phases. First, we invite{" "}
                <span className="relative bg-brand/10">
                  early access users
                  <span className="absolute -right-0.5 top-0 h-full w-0.5 bg-brand">
                    <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">Product Lead</span>
                  </span>
                </span>{" "}
                to test the core editor.
              </p>
              <p className="relative text-sm leading-relaxed text-muted">
                Feedback will be collected via the dashboard and reviewed by the product team to ensure a{" "}
                <span className="relative bg-pink/10">
                  seamless launch experience.
                  <span className="absolute -right-0.5 top-0 h-full w-0.5 bg-pink">
                    <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-pink px-1.5 py-0.5 text-[10px] font-semibold text-white">Designer</span>
                  </span>
                </span>
              </p>

              <div className="absolute right-3 top-24 w-24 rounded-lg border border-line bg-white p-2 shadow-md sm:right-4 sm:w-28">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold">💬 Engineer</span>
                </div>
                <p className="mt-1 text-[10px] leading-snug text-muted">Can we add the roadmap here?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- NEW HOW IT WORKS ---------- */
function NewHowItWorks() {
  const steps = [
    { n: 1, title: "Choose a template.", text: "Pick a report, deck, or doc that fits your project." },
    { n: 2, title: "Invite your team.", text: "Add teammates by email as viewers or editors." },
    { n: 3, title: "Create together.", text: "Write at the same time and see each other's cursors." },
  ];

  return (
    <section className="scroll-mt-16 bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">From idea to finished project in three steps.</h2>
        </div>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-5 hidden border-t-2 border-dashed border-line md:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative text-center">
              <span className="relative mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white shadow-lg shadow-brand/30 ring-8 ring-canvas">{s.n}</span>
              <h3 className="mt-5 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- NEW FINAL CTA ---------- */
function NewFinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="bg-white px-5 pb-20 md:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-brand via-brand-deep to-pink px-6 py-16 text-center md:py-24">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Your next great project starts here.
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-white/80">Set up a workspace in under a minute and bring your team along.</p>
        <button onClick={() => navigate("/signup")} className="relative mt-8 inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand shadow-xl transition-transform hover:scale-[1.03]">
          Create Your Workspace
        </button>
      </div>
    </section>
  );
}

/* ---------- LANDING PAGE ---------- */
function LandingPage() {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const actions = ["edited a document", "added a paragraph", "shared with the team", "left a comment", "renamed a project"];
    let i = 0;
    const id = setInterval(() => {
      const user = USERS[i % USERS.length];
      const action = actions[i % actions.length];
      setToast({ user: user.name, text: action, color: user.color });
      i++;
      setTimeout(() => setToast(null), 3200);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen scroll-smooth bg-white font-sans text-ink antialiased">
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
        <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-pink shadow-lg shadow-brand/30 transition-transform group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">Docsyne<span className="text-brand">.</span></h2>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how" className="group relative text-sm font-medium text-gray-600 transition-colors hover:text-brand">How it Works<span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full"></span></a>
            <a href="#features" className="group relative text-sm font-medium text-gray-600 transition-colors hover:text-brand">Features<span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full"></span></a>
            <a href="#templates" className="group relative text-sm font-medium text-gray-600 transition-colors hover:text-brand">Templates<span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full"></span></a>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => navigate("/login")} className="hidden text-sm font-semibold text-gray-700 transition hover:text-brand sm:block px-3 py-2">Login</button>
            <motion.button onClick={() => navigate("/signup")} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="group relative overflow-hidden rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gray-900/20">
              <span className="relative z-10 flex items-center gap-2">Get Started<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-brand to-pink opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.button>
          </div>
        </motion.nav>
      </div>

      <main>
        <Hero />
        <NewFeatures />
        <TemplatesShowcase />

        {/* TOASTS */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-2xl">
              <span className="h-2 w-2 rounded-full" style={{ background: toast.color }} />
              <span className="font-semibold">{toast.user}</span>
              <span className="text-gray-500">{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOW IT WORKS (Animated) */}
        <section id="how" className="relative mx-auto max-w-6xl px-6 py-24 scroll-mt-32">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl text-ink">What happens when you type</h2>
            <p className="mt-3 text-gray-500">Five tiny moments. One seamless experience.</p>
          </div>
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              { icon: "✍️", title: "You type", desc: "A word appears on your page." },
              { icon: "📄", title: "Page updates", desc: "Instantly, before you lift your finger." },
              { icon: "🌐", title: "Team sees it", desc: "Everyone connected, in real time." },
              { icon: "💾", title: "Auto-saves", desc: "Quietly in the background." },
              { icon: "🕘", title: "Version kept", desc: "Every change, always restorable." }
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6, scale: 1.02 }} className="relative rounded-xl border border-gray-100 bg-white/80 p-5 text-center backdrop-blur transition hover:shadow-lg">
                <div className="mb-3 text-3xl">{step.icon}</div>
                <h4 className="mb-1 font-bold">{step.title}</h4>
                <p className="text-xs leading-5 text-gray-500">{step.desc}</p>
                {i < 4 && (
                  <div className="absolute -right-2 top-1/2 hidden h-0.5 w-4 -translate-y-1/2 bg-gray-200 md:block">
                    <motion.span className="absolute -top-1 h-2 w-2 rounded-full bg-brand" animate={{ left: ["-10%", "100%"] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <NewHowItWorks />
        <CollabSection />

        {/* MOCKUP (Permissions) */}
        <section className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-bold text-lg">Team Permissions</h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Active</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Riya (You)", role: "Owner", color: "bg-brand-light text-brand", access: "Full Access" },
                  { name: "Karan", role: "Editor", color: "bg-sky-100 text-sky-700", access: "Can Edit & Comment" },
                  { name: "Meera", role: "Viewer", color: "bg-gray-100 text-gray-600", access: "Can View Only" }
                ].map((user) => (
                  <div key={user.name} className="flex items-center justify-between rounded-xl border border-gray-50 bg-[#faf9f6] p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${user.color}`}>{user.name[0]}</div>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.access}</p>
                      </div>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${user.color}`}>{user.role}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <div>
              <h2 className="text-3xl font-extrabold sm:text-4xl mb-4">Granular Access Control</h2>
              <p className="text-gray-600 leading-relaxed mb-6">Give your team exactly the access they need. Whether it's a full owner, an editor working on drafts, or a client who just needs to view the final copy.</p>
              <ul className="space-y-3">
                {["Assign roles in one click", "Instantly revoke access", "Track who edited what"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-light text-brand">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* HISTORY */}
        <section className="relative mx-auto max-w-4xl px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-sm backdrop-blur md:p-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold">Never lose a thing</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Saved just now
              </span>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["2:14 PM", "Riya edited Introduction", "bg-brand"],
                ["2:10 PM", "Meera added a paragraph", "bg-sky-500"],
                ["2:05 PM", "Karan shared with the team", "bg-emerald-500"]
              ].map(([time, text, dot], i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 rounded-lg border border-gray-50 bg-[#faf9f6] px-4 py-3">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <span className="text-gray-400">{time}</span>
                  <span className="text-gray-700">{text}</span>
                  <button className="ml-auto text-xs font-semibold text-brand hover:underline">Restore</button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* TESTIMONIALS */}
        <section id="reviews" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Loved by fast-moving teams</h2>
            <p className="mt-3 text-gray-500">Here's what teams say about switching to Docsyne.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "Docsyne completely replaced our Google Docs for internal drafting. The live cursors make it feel like we're in the same room.", name: "Rahul M.", role: "Product Manager", initial: "R", color: "#8b5cf6" },
              { text: "The permission controls are a lifesaver. We can share specific docs with clients without worrying about them breaking the formatting.", name: "Priya S.", role: "Agency Founder", initial: "P", color: "#3b82f6" },
              { text: "I love the version history. I accidentally deleted a paragraph and restored it in literally 2 clicks. Super smooth.", name: "Arjun K.", role: "Content Lead", initial: "A", color: "#10b981" }
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div className="flex text-amber-400 mb-4">★★★★★</div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold" style={{ background: t.color }}>{t.initial}</div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <NewFinalCTA />
      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-gray-200 bg-white/40 py-12 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-extrabold tracking-tight mb-4 text-ink">Docsyne<span className="text-brand">.</span></h2>
            <p className="text-sm text-gray-500 leading-relaxed">The real-time collaborative workspace for modern teams. Write, edit, and ship together without the friction.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-brand transition">Features</a></li>
              <li><a href="#templates" className="hover:text-brand transition">Templates</a></li>
              <li><a href="#" className="hover:text-brand transition">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-brand transition">About Us</a></li>
              <li><a href="#" className="hover:text-brand transition">Careers</a></li>
              <li><a href="#" className="hover:text-brand transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-brand transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand transition">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 border-t border-gray-200/60 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>© 2026 Docsyne. Built for better collaboration.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600 transition">Twitter</a>
            <a href="#" className="hover:text-gray-600 transition">GitHub</a>
            <a href="#" className="hover:text-gray-600 transition">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- MAIN APP ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}