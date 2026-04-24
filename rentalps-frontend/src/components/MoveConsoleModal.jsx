import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, Gamepad2, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import {
  getApiErrorMessage,
  moveTransactionConsoleRequest,
} from "../lib/api.js";

function MoveConsoleModal({ transaction, consoles, onClose }) {
  const queryClient = useQueryClient();
  const [selectedConsoleCode, setSelectedConsoleCode] = useState("");

  const moveMutation = useMutation({
    mutationFn: moveTransactionConsoleRequest,
    onSuccess: async () => {
      toast.success("Console berhasil dipindahkan.");
      setSelectedConsoleCode("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["consoles"] }),
        queryClient.invalidateQueries({ queryKey: ["active-transactions"] }),
      ]);
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const currentConsoleType = transaction?.playStationUnit?.consoleType;
  const currentConsoleCode = transaction?.playStationUnit?.code;

  const availableTargets = useMemo(() => {
    if (!transaction) {
      return [];
    }

    return (consoles || []).filter(
      (consoleUnit) =>
        consoleUnit.status === "AVAILABLE" &&
        consoleUnit.consoleType === currentConsoleType &&
        consoleUnit.code !== currentConsoleCode,
    );
  }, [consoles, currentConsoleCode, currentConsoleType, transaction]);

  if (!transaction) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedConsoleCode) {
      return;
    }

    await moveMutation.mutateAsync({
      transactionId: transaction.id,
      targetConsoleCode: selectedConsoleCode,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
              Move Console
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-white">
              {currentConsoleCode}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Pilih console tujuan dengan tipe yang sama dan status AVAILABLE.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={moveMutation.isPending}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Customer</p>
                  <p className="text-lg font-semibold text-white">
                    {transaction.customerName || "Walk-in Customer"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Console sekarang</span>
                  <span className="font-semibold text-white">{currentConsoleCode}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Tipe console</span>
                  <span className="font-semibold text-white">{currentConsoleType}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Mode transaksi</span>
                  <span className="font-semibold text-white">
                    {transaction.pricingType}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Target terpilih</p>
                  <p className="text-xl font-semibold text-white">
                    {selectedConsoleCode || "Belum dipilih"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">Console tujuan</p>
                <p className="text-sm text-slate-400">
                  Hanya console AVAILABLE dengan tipe {currentConsoleType} yang ditampilkan.
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                {availableTargets.length} tersedia
              </span>
            </div>

            {availableTargets.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] px-5 py-10 text-center">
                <p className="text-lg font-semibold text-white">
                  Belum ada console tujuan yang tersedia
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Tunggu sampai ada console {currentConsoleType} yang kembali AVAILABLE,
                  lalu coba pindahkan lagi.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {availableTargets.map((consoleUnit) => {
                  const isSelected = selectedConsoleCode === consoleUnit.code;

                  return (
                    <button
                      key={consoleUnit.id}
                      type="button"
                      disabled={moveMutation.isPending}
                      onClick={() => setSelectedConsoleCode(consoleUnit.code)}
                      className={`rounded-[1.5rem] border p-4 text-left transition ${
                        isSelected
                          ? "border-orange-400/80 bg-orange-500/10"
                          : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {consoleUnit.code}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {consoleUnit.consoleType}
                          </p>
                        </div>

                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-slate-100">
                          <Gamepad2 className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                          AVAILABLE
                        </span>
                        <span className="text-sm text-slate-300">
                          {isSelected ? "Dipilih" : "Klik untuk pilih"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={moveMutation.isPending}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={moveMutation.isPending || !selectedConsoleCode}
                className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {moveMutation.isPending ? "Memindahkan..." : "Pindahkan Console"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MoveConsoleModal;
