import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import PackageFormModal from "../../components/admin/PackageFormModal.jsx";
import {
  createAdminPackageRequest,
  deleteAdminPackageRequest,
  getApiErrorMessage,
  getPackages,
  updateAdminPackageRequest,
} from "../../lib/api.js";
import { formatDuration, formatRupiah } from "../../lib/format.js";

const CONSOLE_TYPE_FILTERS = ["ALL", "PS3", "PS4", "PS5"];

function AdminPackagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [consoleTypeFilter, setConsoleTypeFilter] = useState("ALL");
  const [editingPackage, setEditingPackage] = useState(undefined);
  const [validationError, setValidationError] = useState("");

  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  const createMutation = useMutation({
    mutationFn: createAdminPackageRequest,
    onSuccess: async () => {
      toast.success("Package berhasil ditambahkan.");
      setEditingPackage(undefined);
      setValidationError("");
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminPackageRequest,
    onSuccess: async () => {
      toast.success("Package berhasil diperbarui.");
      setEditingPackage(undefined);
      setValidationError("");
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPackageRequest,
    onSuccess: async () => {
      toast.success("Package berhasil dinonaktifkan.");
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const rentalPackages = packagesQuery.data || [];

  const filteredPackages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rentalPackages.filter((item) => {
      const matchesSearch = !normalizedSearch
        ? true
        : item.name.toLowerCase().includes(normalizedSearch);
      const matchesConsoleType =
        consoleTypeFilter === "ALL" ? true : item.consoleType === consoleTypeFilter;

      return matchesSearch && matchesConsoleType;
    });
  }, [consoleTypeFilter, rentalPackages, search]);

  function handleOpenCreate() {
    setEditingPackage(null);
    setValidationError("");
  }

  function handleOpenEdit(rentalPackage) {
    setEditingPackage(rentalPackage);
    setValidationError("");
  }

  function validateForm(formData) {
    if (!formData.name) {
      return "Nama package wajib diisi.";
    }

    if (!["PS3", "PS4", "PS5"].includes(formData.consoleType)) {
      return "Console type harus PS3, PS4, atau PS5.";
    }

    if (!Number.isInteger(formData.durationMinutes) || formData.durationMinutes <= 0) {
      return "Duration minutes harus lebih dari 0.";
    }

    if (!Number.isInteger(formData.price) || formData.price < 0) {
      return "Price tidak boleh negatif.";
    }

    return "";
  }

  async function handleSubmit(formData) {
    const errorMessage = validateForm(formData);

    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    setValidationError("");

    if (editingPackage) {
      await updateMutation.mutateAsync({
        id: editingPackage.id,
        payload: {
          name: formData.name,
          consoleType: formData.consoleType,
          durationMinutes: formData.durationMinutes,
          price: formData.price,
          isActive: formData.isActive,
        },
      });
      return;
    }

    await createMutation.mutateAsync({
      name: formData.name,
      consoleType: formData.consoleType,
      durationMinutes: formData.durationMinutes,
      price: formData.price,
    });
  }

  async function handleDelete(rentalPackage) {
    const confirmed = window.confirm(
      `Nonaktifkan package "${rentalPackage.name}" dari daftar operasional?`,
    );

    if (!confirmed || deleteMutation.isPending) {
      return;
    }

    await deleteMutation.mutateAsync(rentalPackage.id);
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_30%),rgba(15,23,42,0.92)] p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">
              Admin Packages
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Kelola Package</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Tambah, edit, dan nonaktifkan package rental berdasarkan tipe console.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              deleteMutation.isPending
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Tambah Package
          </button>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari package berdasarkan nama"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Console Type
            </p>
            <div className="flex flex-wrap gap-2">
              {CONSOLE_TYPE_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setConsoleTypeFilter(item)}
                  className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                    consoleTypeFilter === item
                      ? "bg-orange-500 text-white"
                      : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04]">
          {packagesQuery.isLoading ? (
            <div className="p-5">
              <SectionSkeleton variant="list" count={4} />
            </div>
          ) : packagesQuery.isError ? (
            <div className="p-5">
              <ErrorState
                title="Package gagal dimuat"
                description="Daftar package admin belum bisa diambil. Coba muat ulang halaman ini."
                onRetry={() => packagesQuery.refetch()}
                className="border-white/10 bg-rose-500/10"
              />
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Package tidak ditemukan"
                description="Coba kata kunci lain, ubah filter console type, atau tambahkan package baru."
                className="border-white/10 bg-slate-950/40"
                titleClassName="text-white"
                descriptionClassName="text-slate-400"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Name</th>
                    <th className="px-5 py-4 font-medium">Console Type</th>
                    <th className="px-5 py-4 font-medium">Duration</th>
                    <th className="px-5 py-4 font-medium">Price</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-white/10 text-slate-200"
                    >
                      <td className="px-5 py-4 font-semibold text-white">{item.name}</td>
                      <td className="px-5 py-4">{item.consoleType}</td>
                      <td className="px-5 py-4">
                        {formatDuration(item.durationMinutes)}
                      </td>
                      <td className="px-5 py-4">{formatRupiah(item.price)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isActive
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-slate-500/15 text-slate-300"
                          }`}
                        >
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            disabled={
                              createMutation.isPending ||
                              updateMutation.isPending ||
                              deleteMutation.isPending
                            }
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={
                              createMutation.isPending ||
                              updateMutation.isPending ||
                              deleteMutation.isPending
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingPackage !== undefined ? (
        <PackageFormModal
          rentalPackage={editingPackage}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          validationError={validationError}
          onClose={() => {
            setEditingPackage(undefined);
            setValidationError("");
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}

export default AdminPackagesPage;
