import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import {
  createAdminUserRequest,
  deleteAdminUserRequest,
  getAdminUsers,
  getApiErrorMessage,
  updateAdminUserStatusRequest,
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

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getRoleBadgeClass(role) {
  return role === "ADMIN" ? "admin-badge admin-badge--purple" : "admin-badge admin-badge--info";
}

function getStatusBadgeClass(isActive) {
  return isActive ? "admin-badge admin-badge--success" : "admin-badge admin-badge--danger";
}

function CreateCashierModal({ form, validationError, isSubmitting, onChange, onClose, onSubmit }) {
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal max-w-2xl">
        <div className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">Users</p>
            <h3 className="admin-title admin-title--section">Buat Akun Kasir</h3>
            <p className="admin-description">
              Tambahkan akun operasional baru tanpa mengubah auth flow yang sudah ada.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="admin-button admin-button--ghost h-11 w-11 px-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="admin-modal-body space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Nama</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="Contoh: Kasir Malam"
                className="admin-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Username</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="kasir_baru"
                className="admin-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Email opsional</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="kasir@rentalps.local"
                className="admin-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="Minimal 6 karakter"
                className="admin-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                disabled={isSubmitting}
                placeholder="Ulangi password"
                className="admin-input"
              />
            </label>
          </div>

          <div className="admin-note-card">
            <p className="text-sm font-medium text-[#efe5ff]">Role yang dibuat</p>
            <p className="mt-1 text-sm text-[#d9c4ff]">
              Semua akun dari form ini otomatis dibuat sebagai <strong>CASHIER</strong>.
            </p>
          </div>

          {validationError ? (
            <div className="rounded-[1rem] border border-[rgba(255,138,138,0.3)] bg-[rgba(255,138,138,0.12)] px-4 py-3 text-sm text-[var(--admin-danger)]">
              {validationError}
            </div>
          ) : null}
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="admin-button admin-button--secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-button admin-button--primary"
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
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
    refetchInterval: 30000,
  });

  const createUserMutation = useMutation({
    mutationFn: createAdminUserRequest,
    onSuccess: (user) => {
      toast.success(`Akun kasir ${user.name} berhasil dibuat.`);
      setForm(initialForm);
      setValidationError("");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: updateAdminUserStatusRequest,
    onSuccess: (user) => {
      toast.success(
        `${user.name} berhasil ${user.isActive ? "diaktifkan" : "dinonaktifkan"}.`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUserRequest,
    onSuccess: (user) => {
      toast.success(`Akun kasir ${user.name} berhasil dihapus.`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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

  function handleToggleUserStatus(user) {
    if (updateUserStatusMutation.isPending || deleteUserMutation.isPending) {
      return;
    }

    if (user.role === "ADMIN") {
      return;
    }

    const nextIsActive = !user.isActive;
    const confirmed = window.confirm(
      `${nextIsActive ? "Aktifkan" : "Nonaktifkan"} user ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    updateUserStatusMutation.mutate({
      userId: user.id,
      isActive: nextIsActive,
    });
  }

  function handleDeleteUser(user) {
    if (deleteUserMutation.isPending || updateUserStatusMutation.isPending) {
      return;
    }

    if (user.role === "ADMIN") {
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menghapus akun kasir ini? Akun akan dinonaktifkan dan tidak bisa login.",
    );

    if (!confirmed) {
      return;
    }

    deleteUserMutation.mutate(user.id);
  }

  const users = Array.isArray(usersQuery.data) ? usersQuery.data : [];

  if (usersQuery.isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-state-surface rounded-[1rem] p-5">
          <SectionSkeleton variant="grid" count={2} />
        </div>
        <div className="admin-state-surface rounded-[1rem] p-5">
          <SectionSkeleton variant="list" count={2} />
        </div>
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        title="Data user belum bisa dimuat"
        description="Daftar user admin gagal diambil. Coba muat ulang halaman ini."
        onRetry={() => usersQuery.refetch()}
        className="admin-state-surface bg-[rgba(255,138,138,0.12)]"
        titleClassName="text-[var(--admin-danger)]"
        descriptionClassName="text-[var(--admin-text-muted)]"
        retryClassName="bg-[var(--admin-purple)] hover:bg-[var(--admin-purple-hover)]"
      />
    );
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-header-card">
          <div className="admin-header-card__row">
            <div>
              <p className="admin-eyebrow">Users</p>
              <h1 className="admin-title">Users</h1>
              <p className="admin-description">
                Kelola akun kasir
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="admin-button admin-button--primary"
            >
              <UserPlus className="h-4 w-4" />
              Buat Kasir
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="admin-card">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(124,58,237,0.14)] text-[#ddcdff]">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="admin-badge admin-badge--purple">
                CASHIER ONLY
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <h2 className="admin-title admin-title--section">Manajemen Kasir</h2>
              <p className="text-sm leading-6 text-[var(--admin-text-muted)]">
                Buat dan kelola akun kasir yang digunakan untuk operasional transaksi rental.
              </p>
            </div>

            <ul className="admin-list-compact mt-5">
              <li className="admin-list-compact__item">
                Role otomatis: <span className="font-semibold text-[var(--admin-text)]">CASHIER</span>
              </li>
              <li className="admin-list-compact__item">
                Admin tidak bisa dibuat dari halaman ini
              </li>
              <li className="admin-list-compact__item">
                Akun kasir bisa diaktifkan atau dinonaktifkan
              </li>
            </ul>
          </div>

          <div className="admin-section">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(124,58,237,0.14)] text-[#ddcdff]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="admin-eyebrow">
                  User List
                </p>
                <h2 className="admin-title admin-title--section">Daftar User</h2>
              </div>
            </div>

            {users.length === 0 ? (
              <EmptyState
                title="Daftar user belum tersedia"
                description="Daftar user akan ditambahkan setelah endpoint list users tersedia."
                className="admin-state-surface"
                titleClassName="text-[var(--admin-text)]"
                descriptionClassName="text-[var(--admin-text-muted)]"
              />
            ) : (
              <div className="admin-table-wrap">
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const isProtected = user.role === "ADMIN";
                        const isPending =
                          updateUserStatusMutation.isPending &&
                          updateUserStatusMutation.variables?.userId === user.id;
                        const isDeleting =
                          deleteUserMutation.isPending &&
                          deleteUserMutation.variables === user.id;

                        return (
                          <tr key={user.id} className="admin-table-row">
                            <td>
                              <div>
                                <p className="font-medium text-[var(--admin-text)]">{user.name}</p>
                                <p className="text-xs text-[var(--admin-text-muted)]">
                                  ID {user.id.slice(0, 8)}
                                </p>
                              </div>
                            </td>
                            <td>{user.username}</td>
                            <td>{user.email || "-"}</td>
                            <td>
                              <span className={getRoleBadgeClass(user.role)}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(user.isActive)}>
                                {user.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </td>
                            <td>{formatDateTime(user.createdAt)}</td>
                            <td>
                              {isProtected ? (
                                <span className="admin-badge admin-badge--muted">
                                  Protected
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(user)}
                                    disabled={
                                      updateUserStatusMutation.isPending ||
                                      deleteUserMutation.isPending
                                    }
                                    className={`admin-button min-h-0 px-4 py-2 text-sm ${
                                      updateUserStatusMutation.isPending ||
                                      deleteUserMutation.isPending
                                        ? "admin-button--ghost"
                                        : user.isActive
                                          ? "admin-button--danger"
                                          : "admin-button--success"
                                    }`}
                                  >
                                    {isPending
                                      ? "Menyimpan..."
                                      : user.isActive
                                        ? "Nonaktifkan"
                                        : "Aktifkan"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(user)}
                                    disabled={
                                      updateUserStatusMutation.isPending ||
                                      deleteUserMutation.isPending
                                    }
                                    className={`admin-button admin-button--danger min-h-0 px-4 py-2 text-sm ${
                                      updateUserStatusMutation.isPending ||
                                      deleteUserMutation.isPending
                                        ? "admin-button--ghost"
                                        : ""
                                    }`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeleting ? "Menghapus..." : "Hapus"}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
