import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import RateFormModal from "../../components/admin/RateFormModal.jsx";
import {
  getApiErrorMessage,
  getRentalRates,
  updateAdminRateRequest,
} from "../../lib/api.js";
import { formatDateTime, formatRupiah } from "../../lib/format.js";

function AdminRatesPage() {
  const queryClient = useQueryClient();
  const [editingRate, setEditingRate] = useState(undefined);
  const [validationError, setValidationError] = useState("");

  const ratesQuery = useQuery({
    queryKey: ["rental-rates"],
    queryFn: getRentalRates,
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminRateRequest,
    onSuccess: async () => {
      toast.success("Harga rental berhasil diperbarui.");
      setEditingRate(undefined);
      setValidationError("");
      await queryClient.invalidateQueries({ queryKey: ["rental-rates"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const rentalRates = ratesQuery.data || [];

  function handleOpenEdit(rate) {
    setEditingRate(rate);
    setValidationError("");
  }

  async function handleSubmit(formData) {
    if (!Number.isInteger(formData.pricePerHour) || formData.pricePerHour < 0) {
      setValidationError("pricePerHour wajib diisi dan tidak boleh negatif.");
      return;
    }

    setValidationError("");

    await updateMutation.mutateAsync({
      id: editingRate.id,
      payload: {
        pricePerHour: formData.pricePerHour,
      },
    });
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-header-card">
          <p className="admin-eyebrow">Harga Rental</p>
          <h1 className="admin-title">Harga</h1>
          <p className="admin-description">
            Update tarif rental OPEN per tipe console tanpa mengubah histori
            transaksi lama.
          </p>
        </div>

        <div className="admin-section">
          {ratesQuery.isLoading ? (
            <div className="admin-state-surface rounded-[1rem] p-5">
              <SectionSkeleton variant="list" count={3} />
            </div>
          ) : ratesQuery.isError ? (
            <div>
              <ErrorState
                title="Rental rates gagal dimuat"
                description="Frontend admin sudah siap, tetapi daftar rates belum bisa diambil. Pastikan endpoint GET rates tersedia di backend, lalu coba lagi."
                onRetry={() => ratesQuery.refetch()}
                className="admin-state-surface bg-[rgba(255,138,138,0.12)]"
                titleClassName="text-[var(--admin-danger)]"
                descriptionClassName="text-[var(--admin-text-muted)]"
                retryClassName="bg-[var(--admin-purple)] hover:bg-[var(--admin-purple-hover)]"
              />
            </div>
          ) : rentalRates.length === 0 ? (
            <EmptyState
              title="Belum ada rental rates"
              description="Tambahkan atau aktifkan endpoint daftar rental rates di backend agar data bisa tampil di halaman admin."
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
                      <th>Console Type</th>
                      <th>Price Per Hour</th>
                      <th>Status</th>
                      <th>Updated At</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {rentalRates.map((rate) => (
                    <tr key={rate.id} className="admin-table-row">
                      <td className="font-semibold text-[var(--admin-text)]">
                        {rate.consoleType}
                      </td>
                      <td className="admin-number">
                        {formatRupiah(rate.hourlyRate)}
                      </td>
                      <td>
                        {typeof rate.isActive === "boolean" ? (
                          <span
                            className={`admin-badge ${
                              rate.isActive ? "admin-badge--success" : "admin-badge--muted"
                            }`}
                          >
                            {rate.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        ) : (
                          <span className="text-[var(--admin-text-muted)]">-</span>
                        )}
                      </td>
                      <td>
                        {rate.updatedAt ? formatDateTime(rate.updatedAt) : "-"}
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rate)}
                            disabled={updateMutation.isPending}
                            className="admin-button admin-button--secondary min-h-0 px-3 py-2 text-xs"
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
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

      {editingRate !== undefined ? (
        <RateFormModal
          rentalRate={editingRate}
          isSubmitting={updateMutation.isPending}
          validationError={validationError}
          onClose={() => {
            setEditingRate(undefined);
            setValidationError("");
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}

export default AdminRatesPage;
