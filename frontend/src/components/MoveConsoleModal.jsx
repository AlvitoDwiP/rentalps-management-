import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, Gamepad2, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import {
  getApiErrorMessage,
  moveTransactionConsoleRequest,
} from "../lib/api.js";
import { theme } from "../lib/theme.js";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="dashboard-panel w-full max-w-3xl overflow-hidden">
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Move Console
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
              {currentConsoleCode}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Pilih console tujuan dengan tipe yang sama dan status AVAILABLE.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={moveMutation.isPending}
            className="app-button app-button--ghost min-h-11 w-11 p-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="space-y-4">
            <div
              className="rounded-[16px] border p-5"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceSoft,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                  }}
                >
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Customer</p>
                  <p className="text-lg font-semibold text-[var(--color-text)]">
                    {transaction.customerName || "Walk-in Customer"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
                <div className="flex items-center justify-between gap-3">
                  <span>Console sekarang</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {currentConsoleCode}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Tipe console</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {currentConsoleType}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Mode transaksi</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {transaction.pricingType}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] border p-5"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceSoft,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.available,
                  }}
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Target terpilih</p>
                  <p className="text-xl font-semibold text-[var(--color-text)]">
                    {selectedConsoleCode || "Belum dipilih"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Console tujuan</p>
                <p className="text-sm text-[var(--color-muted)]">
                  Hanya console AVAILABLE dengan tipe {currentConsoleType} yang ditampilkan.
                </p>
              </div>
              <span className="mode-badge mode-badge--open">{availableTargets.length} tersedia</span>
            </div>

            {availableTargets.length === 0 ? (
              <div
                className="rounded-[16px] border px-5 py-10 text-center"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceSoft,
                }}
              >
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  Belum ada console tujuan yang tersedia
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
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
                      className="rounded-[14px] border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        borderColor:
                          isSelected ? theme.colors.inUse : theme.colors.border,
                        backgroundColor:
                          isSelected ? theme.colors.inUseSoft : theme.colors.surfaceSoft,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-[var(--color-text)]">
                            {consoleUnit.code}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            {consoleUnit.consoleType}
                          </p>
                        </div>

                        <div
                          className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                          style={{
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                          }}
                        >
                          <Gamepad2 className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="status-badge status-badge--available">AVAILABLE</span>
                        <span className="text-sm text-[var(--color-muted)]">
                          {isSelected ? "Dipilih" : "Klik untuk pilih"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end"
              style={{ borderColor: theme.colors.border }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={moveMutation.isPending}
                className="app-button app-button--ghost"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={moveMutation.isPending || !selectedConsoleCode}
                className={`app-button ${
                  moveMutation.isPending || !selectedConsoleCode
                    ? "app-button--disabled"
                    : "app-button--primary"
                }`}
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
