import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import ActiveTransactionPanel from "../components/ActiveTransactionPanel.jsx";
import AddItemModal from "../components/AddItemModal.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import FinishTransactionModal from "../components/FinishTransactionModal.jsx";
import ConsoleGrid from "../components/ConsoleGrid.jsx";
import StartTransactionModal from "../components/StartTransactionModal.jsx";
import SummaryCards from "../components/SummaryCards.jsx";
import {
  finishTransactionRequest,
  getActiveTransactions,
  getApiErrorMessage,
  getConsoles,
  getPackages,
  startOpenTransactionRequest,
  startPackageTransactionRequest,
} from "../lib/api.js";

function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedConsole, setSelectedConsole] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAddItemTransaction, setSelectedAddItemTransaction] = useState(null);

  const consolesQuery = useQuery({
    queryKey: ["consoles"],
    queryFn: getConsoles,
    refetchInterval: 5000,
  });

  const activeTransactionsQuery = useQuery({
    queryKey: ["active-transactions"],
    queryFn: getActiveTransactions,
    refetchInterval: 5000,
  });

  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
    staleTime: 30000,
  });

  const startOpenMutation = useMutation({
    mutationFn: startOpenTransactionRequest,
    onSuccess: async () => {
      toast.success("Transaksi OPEN berhasil dimulai.");
      setSelectedConsole(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["consoles"] }),
        queryClient.invalidateQueries({ queryKey: ["active-transactions"] }),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const startPackageMutation = useMutation({
    mutationFn: startPackageTransactionRequest,
    onSuccess: async () => {
      toast.success("Transaksi package berhasil dimulai.");
      setSelectedConsole(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["consoles"] }),
        queryClient.invalidateQueries({ queryKey: ["active-transactions"] }),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const finishMutation = useMutation({
    mutationFn: finishTransactionRequest,
    onSuccess: async () => {
      toast.success("Transaksi selesai.");
      setSelectedTransaction(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["consoles"] }),
        queryClient.invalidateQueries({ queryKey: ["active-transactions"] }),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const consoles = consolesQuery.data || [];
  const activeTransactions = activeTransactionsQuery.data || [];
  const packages = packagesQuery.data || [];

  const summary = {
    total: consoles.length,
    available: consoles.filter((item) => item.status === "AVAILABLE").length,
    inUse: consoles.filter((item) => item.status === "IN_USE").length,
    maintenance: consoles.filter((item) => item.status === "MAINTENANCE").length,
  };

  async function handleStartTransaction(payload) {
    if (payload.mode === "PACKAGE") {
      await startPackageMutation.mutateAsync(payload);
      return;
    }

    await startOpenMutation.mutateAsync(payload);
  }

  async function handleFinishTransaction() {
    if (!selectedTransaction) {
      return;
    }

    await finishMutation.mutateAsync(selectedTransaction.id);
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardHeader />

        <SummaryCards summary={summary} isLoading={consolesQuery.isLoading} />

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <ConsoleGrid
            consoles={consoles}
            isLoading={consolesQuery.isLoading}
            onSelectConsole={setSelectedConsole}
          />

          <ActiveTransactionPanel
            transactions={activeTransactions}
            isLoading={activeTransactionsQuery.isLoading}
            onFinish={setSelectedTransaction}
            onAddItem={setSelectedAddItemTransaction}
          />
        </div>
      </div>

      <StartTransactionModal
        consoleUnit={selectedConsole}
        packages={packages}
        isSubmitting={
          startOpenMutation.isPending || startPackageMutation.isPending
        }
        isPackagesLoading={packagesQuery.isLoading}
        onClose={() => setSelectedConsole(null)}
        onSubmit={handleStartTransaction}
      />

      <FinishTransactionModal
        transaction={selectedTransaction}
        isSubmitting={finishMutation.isPending}
        onClose={() => setSelectedTransaction(null)}
        onConfirm={handleFinishTransaction}
      />

      <AddItemModal
        transaction={selectedAddItemTransaction}
        onClose={() => setSelectedAddItemTransaction(null)}
      />
    </main>
  );
}

export default DashboardPage;
