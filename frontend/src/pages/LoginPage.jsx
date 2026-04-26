import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage, loginRequest } from "../lib/api.js";
import loginIllustration from "../assets/login-illustration.png";
import playstationLogo from "../assets/playstation-logo.png";
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
      const userName = data.user?.name || data.user?.username || "User";
      const redirectPath = data.user?.role === "ADMIN" ? "/admin" : "/dashboard";

      setAuth(data);
      toast.success(`Selamat datang, ${userName}`);
      navigate(redirectPath, { replace: true });
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
    <main className="login-page">
      <div className="login-shell">
        <section className="login-shell__left">
          <div className="login-shell__brand">
            <div className="login-shell__brand-badge">
              <img src={playstationLogo} alt="PlayStation" className="brand-playstation-logo" />
            </div>
          </div>

          <div className="login-shell__hero">
            <h1 className="login-shell__title">Kelola rental PlayStation.</h1>
            <p className="login-shell__subtitle">
              Pantau status console, catat transaksi, dan selesaikan billing tanpa
              berpindah halaman.
            </p>
          </div>

          <div className="login-illustration">
            <img src={loginIllustration} alt="Gaming illustration" />
          </div>

          <div className="login-shell__pills">
            <span className="login-shell__pill">Console grid</span>
            <span className="login-shell__pill">Live billing</span>
            <span className="login-shell__pill">Manajemen stok</span>
          </div>
        </section>

        <section className="login-shell__right">
          <div className="login-form">
            <div className="login-form__header">
              <p className="login-form__eyebrow">RentalPS</p>
              <h2 className="login-form__title">Masuk ke dashboard</h2>
              <p className="login-form__subtitle">
                Gunakan akun kasir atau admin untuk memulai sesi kerja.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form__body">
              <label className="login-form__field">
                <span className="login-form__label">Username atau email</span>
                <input
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="admin"
                  className="login-form__input"
                />
              </label>

              <label className="login-form__field">
                <span className="login-form__label">Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="login-form__input"
                />
              </label>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="login-form__submit"
              >
                <LogIn className="h-4 w-4" />
                {loginMutation.isPending ? "Masuk..." : "Masuk ke Dashboard"}
              </button>
            </form>

            <p className="login-form__helper">Lupa password? Hubungi admin.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
