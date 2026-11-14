// src/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, FileText, Presentation } from "lucide-react";
import API from "./api/axios";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (name, value, all = form) => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Enter your full name." : "";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email address.";
      case "password":
        if (value.length < 8) return "Must be at least 8 characters.";
        if (!/[A-Z]/.test(value)) return "Must contain a capital letter.";
        if (!/[a-z]/.test(value)) return "Must contain a small letter.";
        if (!/\d/.test(value)) return "Must contain a number.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Must contain a special character.";
        return "";
      case "confirm":
        return value !== all.password ? "Passwords don't match." : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setErrors((er) => ({
      ...er,
      ...(er[name] ? { [name]: validate(name, value, next) } : {}),
      ...(name === "password" && er.confirm !== undefined ? { confirm: validate("confirm", next.confirm, next) } : {}),
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    
    const found = {
      name: validate("name", form.name),
      email: validate("email", form.email),
      password: validate("password", form.password),
      confirm: validate("confirm", form.confirm),
      terms: agreed ? "" : "Please accept the terms to continue.",
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setSubmitting(true);
    try {
      await API.post("/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const rules = [
    { label: "8+ characters", ok: form.password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(form.password) },
    { label: "Lowercase", ok: /[a-z]/.test(form.password) },
    { label: "Number", ok: /\d/.test(form.password) },
    { label: "Special char", ok: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) },
  ];

  const inputClass = (error) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
      error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-violet-500 focus:ring-violet-500/15"
    }`;

  return (
    <div className="grid min-h-screen bg-[#faf9f6] font-sans text-[#202020] antialiased lg:grid-cols-2">
      
      {/* LEFT SIDE: Brand Showcase */}
      <div className="relative isolate hidden overflow-hidden bg-[#faf9f6] lg:block">
        {/* Matching Landing Page Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] [background-size:26px_26px] opacity-40" />
        </div>

        <div className="flex h-full flex-col items-center justify-center px-12 text-center">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-[#202020]">
            Your next great project starts here.
          </h2>
          <p className="mt-4 max-w-sm text-gray-600">
            Create reports, decks, and docs from templates and invite your team in one click.
          </p>

          <div className="mt-12 w-full max-w-sm rounded-3xl bg-white/50 p-2.5 ring-1 ring-white/70 backdrop-blur-sm">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-xl shadow-violet-500/10">
              <p className="text-sm font-bold">Start from a template</p>
              <div className="mt-4 space-y-3">
                {[
                  { icon: FileText, name: "Q3 Product Roadmap", meta: "Doc · Edited 2h ago" },
                  { icon: Presentation, name: "Startup Pitch Deck", meta: "Deck · 12 slides" },
                ].map(({ icon: Icon, name, meta }) => (
                  <div key={name} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600"><Icon size={17} /></span>
                    <div>
                      <p className="text-xs font-semibold">{name}</p>
                      <p className="text-[11px] text-gray-500">{meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex flex-col bg-white px-6 py-8 sm:px-12">
        <div className="w-fit">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            Docsyne
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500">Start your workspace. It takes less than a minute.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Full name</label>
              <input id="name" name="name" autoComplete="name" placeholder="Riya Sharma" value={form.name} onChange={handleChange} onBlur={handleBlur} className={inputClass(errors.name)} />
              {errors.name && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className={inputClass(errors.email)} />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={handleChange} onBlur={handleBlur} className={`${inputClass(errors.password)} pr-11`} />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {errors.password && form.password.length > 0 ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>
              ) : null}

              {form.password.length > 0 && (
                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                  {rules.map((r) => (
                    <li key={r.label} className={`flex items-center gap-1 text-[11px] font-medium transition-colors duration-200 ${r.ok ? "text-emerald-600" : "text-gray-400"}`}>
                      <Check size={12} strokeWidth={3} className={r.ok ? "opacity-100" : "opacity-50"} /> 
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold">Confirm password</label>
              <div className="relative">
                <input id="confirm" name="confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter your password" value={form.confirm} onChange={handleChange} onBlur={handleBlur} className={`${inputClass(errors.confirm)} pr-11`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.confirm}</p>}
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setErrors((er) => ({ ...er, terms: "" }));
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-violet-600"
                />
                <span>
                  I agree to the <a href="#" className="font-semibold text-violet-600">Terms</a> and{" "}
                  <a href="#" className="font-semibold text-violet-600">Privacy Policy</a>.
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.terms}</p>}
            </div>

            {serverError && <p className="text-sm font-medium text-red-600 text-center">{serverError}</p>}

            <button type="submit" disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}