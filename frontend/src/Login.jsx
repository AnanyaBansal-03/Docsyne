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

      // Save token and user data to localStorage
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
      error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-line focus:border-brand focus:ring-brand/15"
    }`;

  return (
    <div className="grid min-h-screen bg-white font-sans text-ink antialiased lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="w-fit">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-pink shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            Docsyne
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Log in to continue to your workspace.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={handleChange} onBlur={handleBlur} className={inputClass(errors.email)} />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold">Password</label>
                <a href="#" className="text-xs font-medium text-brand hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={handleChange} onBlur={handleBlur} className={`${inputClass(errors.password)} pr-11`} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand" />
              Remember me
            </label>

            {serverError && <p className="text-sm font-medium text-red-600 text-center">{serverError}</p>}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-70">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            New to Docsyne?{" "}
            <Link to="/signup" className="font-semibold text-brand hover:text-brand-deep">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative isolate hidden overflow-hidden bg-white lg:block">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-brand/55 blur-[110px]" />
          <div className="absolute bottom-[-100px] left-[-120px] h-[420px] w-[480px] rounded-full bg-sky-300/60 blur-[110px]" />
          <div className="absolute bottom-[-60px] right-[-120px] h-[460px] w-[520px] rounded-full bg-pink/45 blur-[110px]" />
        </div>

        <div className="flex h-full flex-col items-center justify-center px-12 text-center">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">One workspace. Every document. Your entire team.</h2>
          <p className="mt-4 max-w-sm text-slate-600">Reports, presentations, and docs that your team writes together in real time.</p>

          <div className="mt-12 w-full max-w-sm rounded-3xl bg-white/50 p-2.5 ring-1 ring-white/70 backdrop-blur-sm">
            <div className="rounded-2xl border border-line bg-white p-5 text-left shadow-xl shadow-brand/10">
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
                  <div key={name} className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-light text-brand"><Icon size={17} /></span>
                    <div>
                      <p className="text-xs font-semibold">{name}</p>
                      <p className="text-[11px] text-muted">{meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}