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
      <div className="flex flex-col gap-5">
        <div className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_30%),rgba(15,23,42,0.92)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">
            Admin Rates
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Kelola Rental Rates</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Perbarui harga rental per jam untuk setiap tipe console dari satu panel.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04]">
          {ratesQuery.isLoading ? (
            <div className="p-5">
              <SectionSkeleton variant="list" count={3} />
            </div>
          ) : ratesQuery.isError ? (
            <div className="p-5">
              <ErrorState
                title="Rental rates gagal dimuat"
                description="Frontend admin sudah siap, tetapi daftar rates belum bisa diambil. Pastikan endpoint GET rates tersedia di backend, lalu coba lagi."
                onRetry={() => ratesQuery.refetch()}
                className="border-white/10 bg-rose-500/10"
              />
            </div>
          ) : rentalRates.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Belum ada rental rates"
                description="Tambahkan atau aktifkan endpoint daftar rental rates di backend agar data bisa tampil di halaman admin."
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
                    <th className="px-5 py-4 font-medium">Console Type</th>
                    <th className="px-5 py-4 font-medium">Price Per Hour</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Updated At</th>
                    <th className="px-5 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalRates.map((rate) => (
                    <tr
                      key={rate.id}
                      className="border-t border-white/10 text-slate-200"
                    >
                      <td className="px-5 py-4 font-semibold text-white">
                        {rate.consoleType}
                      </td>
                      <td className="px-5 py-4">
                        {formatRupiah(rate.hourlyRate)}
                      </td>
                      <td className="px-5 py-4">
                        {typeof rate.isActive === "boolean" ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              rate.isActive
                                ? "bg-emerald-500/15 text-emerald-200"
                                : "bg-slate-500/15 text-slate-300"
                            }`}
                          >
                            {rate.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {rate.updatedAt ? formatDateTime(rate.updatedAt) : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rate)}
                            disabled={updateMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
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
