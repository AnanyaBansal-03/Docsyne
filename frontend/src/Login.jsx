// src/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, FileText, Presentation } from "lucide-react";
import API from "./api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (name, value) => {
    if (name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email address.";
    if (name === "password") return value ? "" : "Enter your password.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = { email: validate("email", form.email), password: validate("password", form.password) };
    setErrors(found);
    if (found.email || found.password) return;

    setSubmitting(true);
    try {
      const response = await API.post("/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            One workspace. Every document. Your entire team.
          </h2>
          <p className="mt-4 max-w-sm text-gray-600">
            Reports, presentations, and docs that your team writes together in real time.
          </p>

          <div className="mt-12 w-full max-w-sm rounded-3xl bg-white/50 p-2.5 ring-1 ring-white/70 backdrop-blur-sm">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-xl shadow-violet-500/10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Recent documents</p>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: FileText, name: "Q3 Product Roadmap", meta: "Edited 2h ago" },
                  { icon: Presentation, name: "Startup Pitch Deck", meta: "Edited yesterday" },
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
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">Log in to continue to your workspace.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className={inputClass(errors.email)} />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold">Password</label>
                <a href="#" className="text-xs font-medium text-violet-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={handleChange} onBlur={handleBlur} className={`${inputClass(errors.password)} pr-11`} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-violet-600" />
              Remember me
            </label>

            {serverError && <p className="text-sm font-medium text-red-600 text-center">{serverError}</p>}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            New to Docsyne?{" "}
            <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}