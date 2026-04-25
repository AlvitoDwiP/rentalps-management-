import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ActiveTransactionPanel from "../components/ActiveTransactionPanel.jsx";
import AddItemModal from "../components/AddItemModal.jsx";
import ConsoleGrid from "../components/ConsoleGrid.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import FinishTransactionModal from "../components/FinishTransactionModal.jsx";
import MoveConsoleModal from "../components/MoveConsoleModal.jsx";
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
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedFinishTransaction, setSelectedFinishTransaction] = useState(null);
  const [selectedAddItemTransaction, setSelectedAddItemTransaction] = useState(null);
  const [selectedMoveConsoleTransaction, setSelectedMoveConsoleTransaction] =
    useState(null);

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
      setSelectedFinishTransaction(null);
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

  useEffect(() => {
    if (activeTransactions.length === 0) {
      setSelectedTransactionId(null);
      return;
    }

    const hasSelectedTransaction = activeTransactions.some(
      (transaction) => transaction.id === selectedTransactionId,
    );

    if (!selectedTransactionId || !hasSelectedTransaction) {
      setSelectedTransactionId(activeTransactions[0].id);
    }
  }, [activeTransactions, selectedTransactionId]);

  const selectedTransaction = useMemo(
    () =>
      activeTransactions.find((transaction) => transaction.id === selectedTransactionId) ||
      null,
    [activeTransactions, selectedTransactionId],
  );

  const summary = {
    available: consoles.filter((item) => item.status === "AVAILABLE").length,
    inUse: consoles.filter((item) => item.status === "IN_USE").length,
    maintenance: consoles.filter((item) => item.status === "MAINTENANCE").length,
    revenueToday: 0,
    transactions: activeTransactions.length,
  };

  async function handleStartTransaction(payload) {
    if (payload.mode === "PACKAGE") {
      await startPackageMutation.mutateAsync(payload);
      return;
    }

    await startOpenMutation.mutateAsync(payload);
  }

  async function handleFinishTransaction(transaction) {
    if (!transaction) {
      return;
    }

    await finishMutation.mutateAsync(transaction.id);
  }

  function handleSelectTransaction(transaction) {
    setSelectedTransactionId(transaction?.id || null);
  }

  return (
    <main className="dashboard-shell">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5">
        <DashboardHeader activeTransactionCount={activeTransactions.length} />

        <SummaryCards summary={summary} isLoading={consolesQuery.isLoading} />

        <div className="cashier-main-layout">
          <ConsoleGrid
            consoles={consoles}
            activeTransactions={activeTransactions}
            isLoading={consolesQuery.isLoading && consoles.length === 0}
            isError={consolesQuery.isError && consoles.length === 0}
            onRetry={() => consolesQuery.refetch()}
            onSelectConsole={setSelectedConsole}
            onSelectTransaction={handleSelectTransaction}
            selectedTransactionId={selectedTransactionId}
          />

          <ActiveTransactionPanel
            transactions={activeTransactions}
            selectedTransaction={selectedTransaction}
            isLoading={
              activeTransactionsQuery.isLoading && activeTransactions.length === 0
            }
            isError={
              activeTransactionsQuery.isError && activeTransactions.length === 0
            }
            onRetry={() => activeTransactionsQuery.refetch()}
            onSelectTransaction={handleSelectTransaction}
            onFinish={setSelectedFinishTransaction}
            onAddItem={setSelectedAddItemTransaction}
            onMoveConsole={setSelectedMoveConsoleTransaction}
          />
        </div>
      </div>

      <StartTransactionModal
        consoleUnit={selectedConsole}
        packages={packages}
        isSubmitting={startOpenMutation.isPending || startPackageMutation.isPending}
        isPackagesLoading={packagesQuery.isLoading}
        onClose={() => setSelectedConsole(null)}
        onSubmit={handleStartTransaction}
      />

      <FinishTransactionModal
        transaction={selectedFinishTransaction}
        isSubmitting={finishMutation.isPending}
        onClose={() => setSelectedFinishTransaction(null)}
        onConfirm={() => handleFinishTransaction(selectedFinishTransaction)}
      />

      <AddItemModal
        transaction={selectedAddItemTransaction}
        onClose={() => setSelectedAddItemTransaction(null)}
      />

      <MoveConsoleModal
        transaction={selectedMoveConsoleTransaction}
        consoles={consoles}
        onClose={() => setSelectedMoveConsoleTransaction(null)}
      />
    </main>
  );
}

export default DashboardPage;
