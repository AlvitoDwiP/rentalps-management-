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
      <div className="admin-page">
        <div className="admin-header-card">
          <div className="admin-header-card__row">
            <div>
              <p className="admin-eyebrow">Kelola Paket</p>
              <h1 className="admin-title">Paket</h1>
              <p className="admin-description">
                Atur paket rental berdasarkan tipe console, durasi, dan harga yang
                dipakai kasir.
              </p>
            </div>

            <div className="admin-header-card__action">
              <button
                type="button"
                onClick={handleOpenCreate}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  deleteMutation.isPending
                }
                className="admin-button admin-button--primary"
              >
                <Plus className="h-4 w-4" />
                Tambah Paket
              </button>
            </div>
          </div>
        </div>

        <div className="admin-filter-bar lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="relative block">
            <span className="mb-2 block text-sm font-medium text-[var(--admin-text)]">
              Cari paket
            </span>
            <Search className="pointer-events-none absolute left-4 top-[calc(50%+0.8rem)] h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari package berdasarkan nama"
              className="admin-input pl-11"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--admin-text)]">
              Console Type
            </p>
            <div className="flex flex-wrap gap-2">
              {CONSOLE_TYPE_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setConsoleTypeFilter(item)}
                  className={`admin-button min-h-0 px-3 py-2 text-xs ${
                    consoleTypeFilter === item
                      ? "admin-button--primary"
                      : "admin-button--secondary"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-section">
          {packagesQuery.isLoading ? (
            <div className="admin-state-surface rounded-[1rem] p-5">
              <SectionSkeleton variant="list" count={4} />
            </div>
          ) : packagesQuery.isError ? (
            <div>
              <ErrorState
                title="Package gagal dimuat"
                description="Daftar package admin belum bisa diambil. Coba muat ulang halaman ini."
                onRetry={() => packagesQuery.refetch()}
                className="admin-state-surface bg-[rgba(255,138,138,0.12)]"
                titleClassName="text-[var(--admin-danger)]"
                descriptionClassName="text-[var(--admin-text-muted)]"
                retryClassName="bg-[var(--admin-purple)] hover:bg-[var(--admin-purple-hover)]"
              />
            </div>
          ) : filteredPackages.length === 0 ? (
            <EmptyState
              title="Paket tidak ditemukan"
              description="Coba kata kunci lain, ubah filter console type, atau tambahkan paket baru."
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
                      <th>Console Type</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredPackages.map((item) => (
                    <tr key={item.id} className="admin-table-row">
                      <td className="font-semibold text-[var(--admin-text)]">{item.name}</td>
                      <td>{item.consoleType}</td>
                      <td>
                        {formatDuration(item.durationMinutes)}
                      </td>
                      <td className="admin-number">{formatRupiah(item.price)}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            item.isActive ? "admin-badge--success" : "admin-badge--muted"
                          }`}
                        >
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            disabled={
                              createMutation.isPending ||
                              updateMutation.isPending ||
                              deleteMutation.isPending
                            }
                            className="admin-button admin-button--secondary min-h-0 px-3 py-2 text-xs"
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
                            className="admin-button admin-button--danger min-h-0 px-3 py-2 text-xs"
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
