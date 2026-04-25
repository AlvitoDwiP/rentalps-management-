import { useMutation } from "@tanstack/react-query";
import { LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage, loginRequest } from "../lib/api.js";
import useAuthStore from "../store/authStore.js";

const initialForm = {
  identifier: "admin",
  password: "admin123",
};

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState(initialForm);

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuth(data);
      toast.success(`Selamat datang, ${data.user.name}`);
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  function handleChange(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    loginMutation.mutate(form);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_35px_120px_-40px_rgba(15,23,42,0.4)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white xl:flex xl:flex-col xl:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.45),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.35),transparent_28%)]" />
          <div className="relative space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Kasir Real-Time
            </span>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.02]">
              Rental PlayStation yang cepat dipakai saat antrean lagi ramai.
            </h1>
            <p className="max-w-md text-base leading-7 text-slate-200">
              Login, lihat status console, mulai transaksi, dan tutup billing tanpa
              pindah-pindah layar.
            </p>
          </div>

          <div className="relative grid gap-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-slate-200">Fokus MVP kasir</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium">
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-100">
                  Console Grid
                </span>
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-100">
                  Active Billing
                </span>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-cyan-100">
                  Finish Cepat
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-[680px] items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">
                Rental PS Cashier
              </p>
              <h2 className="text-4xl font-semibold text-slate-950">Masuk ke dashboard</h2>
              <p className="text-sm leading-6 text-slate-500">
                Gunakan akun kasir atau admin untuk memulai transaksi real-time.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Username atau email
                </span>
                <input
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="admin"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {loginMutation.isPending ? "Masuk..." : "Masuk ke Dashboard"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
