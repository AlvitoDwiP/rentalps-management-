import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import EmptyState from "../../components/EmptyState.jsx";
import {
  createAdminUserRequest,
  getApiErrorMessage,
} from "../../lib/api.js";

const initialForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateForm(form) {
  if (!form.name.trim()) {
    return "Nama kasir wajib diisi.";
  }

  if (!form.username.trim()) {
    return "Username wajib diisi.";
  }

  if (!form.password) {
    return "Password wajib diisi.";
  }

  if (form.password.length < 6) {
    return "Password minimal 6 karakter.";
  }

  if (form.confirmPassword !== form.password) {
    return "Konfirmasi password harus sama.";
  }

  if (form.email.trim() && !isValidEmail(form.email.trim())) {
    return "Format email belum valid.";
  }

  return "";
}

function CreateCashierModal({ form, validationError, isSubmitting, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.82)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Create Cashier
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-white">Buat Akun Kasir</h3>
            <p className="mt-1 text-sm text-slate-300">
              Tambahkan akun operasional baru tanpa mengubah auth flow yang sudah ada.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-200">Nama</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="Contoh: Kasir Malam"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Username</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="kasir_baru"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Email opsional</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="kasir@rentalps.local"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="Ulangi password"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          <div className="rounded-[1.5rem] border border-violet-500/14 bg-violet-500/10 px-4 py-4">
            <p className="text-sm font-medium text-violet-100">Role yang dibuat</p>
            <p className="mt-1 text-sm text-violet-200/80">
              Semua akun dari form ini otomatis dibuat sebagai <strong>CASHIER</strong>.
            </p>
          </div>

          {validationError ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {validationError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Buat Kasir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState("");

  const createUserMutation = useMutation({
    mutationFn: createAdminUserRequest,
    onSuccess: (user) => {
      toast.success(`Akun kasir ${user.name} berhasil dibuat.`);
      setForm(initialForm);
      setValidationError("");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    if (!isModalOpen) {
      setValidationError("");
    }
  }, [isModalOpen]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleOpenModal() {
    if (createUserMutation.isPending) {
      return;
    }

    setValidationError("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (createUserMutation.isPending) {
      return;
    }

    setValidationError("");
    setIsModalOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (createUserMutation.isPending) {
      return;
    }

    const nextValidationError = validateForm(form);

    if (nextValidationError) {
      setValidationError(nextValidationError);
      return;
    }

    setValidationError("");

    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password,
      role: "CASHIER",
    };

    if (form.email.trim()) {
      payload.email = form.email.trim();
    }

    createUserMutation.mutate(payload);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-violet-500/18 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_30%),rgba(15,23,42,0.94)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
                Users
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                Users
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Kelola akun kasir.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              <UserPlus className="h-4 w-4" />
              Buat Kasir
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-violet-500/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.84))] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/14 text-violet-200">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/18 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                Cashier Only
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <h2 className="text-2xl font-semibold text-white">Create cashier dari admin panel</h2>
              <p className="text-sm leading-6 text-slate-300">
                Gunakan halaman ini untuk membuat akun kasir baru. UI ini hanya mengirim role
                <strong> CASHIER</strong> dan tidak menyediakan pembuatan akun admin.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Form</p>
                <p className="mt-2 text-lg font-semibold text-white">Nama, username, email, password</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Safety</p>
                <p className="mt-2 text-lg font-semibold text-white">Validasi frontend + API error toast</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-violet-500/12 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/14 text-violet-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
                  User List
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Daftar User</h2>
              </div>
            </div>

            <div className="mt-5">
              <EmptyState
                title="Daftar user belum tersedia"
                description="Daftar user akan ditambahkan setelah endpoint list users tersedia."
                className="border-white/10 bg-slate-950/40"
                titleClassName="text-white"
                descriptionClassName="text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <CreateCashierModal
          form={form}
          validationError={validationError}
          isSubmitting={createUserMutation.isPending}
          onChange={handleChange}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}

export default AdminUsersPage;
