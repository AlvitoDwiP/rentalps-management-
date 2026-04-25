import { useEffect, useMemo, useRef, useState } from "react";
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
import useDashboardShortcuts from "../hooks/useDashboardShortcuts.js";
import {
  finishTransactionRequest,
  getActiveTransactions,
  getApiErrorMessage,
  getConsoles,
  getPackages,
  getTodaySummary,
  startOpenTransactionRequest,
  startPackageTransactionRequest,
} from "../lib/api.js";

function DashboardPage() {
  const queryClient = useQueryClient();
  const consoleSectionRef = useRef(null);
  const activeTransactionsSectionRef = useRef(null);
  const [isTransactionPanelOpen, setIsTransactionPanelOpen] = useState(true);
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

  const todaySummaryQuery = useQuery({
    queryKey: ["today-summary"],
    queryFn: getTodaySummary,
    refetchInterval: 30000,
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
  const todaySummaryFallback = {
    revenueToday: 0,
    transactionCountToday: activeTransactions.length || 0,
  };
  const todaySummary = todaySummaryQuery.isError
    ? todaySummaryFallback
    : (todaySummaryQuery.data ?? todaySummaryFallback);

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
    revenueToday: Number(todaySummary.revenueToday || 0),
    transactions: Number(todaySummary.transactionCountToday || 0),
  };

  function closeTransactionPanel() {
    setIsTransactionPanelOpen(false);
    scrollToSection(consoleSectionRef);
  }

  function openTransactionPanel() {
    if (activeTransactions.length > 0 && !selectedTransactionId) {
      setSelectedTransactionId(activeTransactions[0].id);
    }

    setIsTransactionPanelOpen(true);

    window.setTimeout(() => {
      scrollToSection(activeTransactionsSectionRef);
    }, 60);
  }

  function showShortcutHelp() {
    toast.info("Shortcut: D Dashboard, T Transaksi Aktif, Esc Tutup Panel");
  }

  useDashboardShortcuts({
    isTransactionPanelOpen,
    openTransactionPanel,
    closeTransactionPanel,
    showShortcutHelp,
  });

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
    const shouldOpenPanel = !isTransactionPanelOpen;
    setIsTransactionPanelOpen(true);

    if (shouldOpenPanel) {
      window.setTimeout(() => {
        scrollToSection(activeTransactionsSectionRef);
      }, 60);
    }
  }

  function scrollToSection(sectionRef) {
    if (!sectionRef.current) {
      return;
    }

    sectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleDashboardClick() {
    closeTransactionPanel();
  }

  function handleActiveTransactionsClick() {
    openTransactionPanel();
  }

  function handleHistoryClick() {
    toast.info("Fitur riwayat belum tersedia");
  }

  function handleSelectConsole(consoleUnit) {
    if (!consoleUnit) {
      return;
    }

    setSelectedConsole(consoleUnit);
  }

  return (
    <main className="dashboard-shell">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5">
        <DashboardHeader
          activeTransactionCount={activeTransactions.length}
          isTransactionPanelOpen={isTransactionPanelOpen}
          onDashboardClick={handleDashboardClick}
          onActiveTransactionsClick={handleActiveTransactionsClick}
          onHistoryClick={handleHistoryClick}
        />

        <SummaryCards
          summary={summary}
          isLoading={consolesQuery.isLoading}
          loadingKeys={todaySummaryQuery.isLoading ? ["revenueToday", "transactions"] : []}
        />

        <div
          className={`cashier-main-layout ${
            isTransactionPanelOpen
              ? "cashier-main-layout--panel-open"
              : "cashier-main-layout--panel-closed"
          }`}
        >
          <div ref={consoleSectionRef} className="cashier-main-layout__console">
            <ConsoleGrid
              consoles={consoles}
              activeTransactions={activeTransactions}
              isTransactionPanelOpen={isTransactionPanelOpen}
              isLoading={consolesQuery.isLoading && consoles.length === 0}
              isError={consolesQuery.isError && consoles.length === 0}
              onRetry={() => consolesQuery.refetch()}
              onSelectConsole={handleSelectConsole}
              onSelectTransaction={handleSelectTransaction}
              selectedTransactionId={selectedTransactionId}
            />
          </div>

          <div
            ref={activeTransactionsSectionRef}
            className="cashier-main-layout__transactions"
          >
            <ActiveTransactionPanel
              transactions={activeTransactions}
              selectedTransaction={selectedTransaction}
              isLoading={
                activeTransactionsQuery.isLoading && activeTransactions.length === 0
              }
              isError={
                activeTransactionsQuery.isError && activeTransactions.length === 0
              }
              onClose={closeTransactionPanel}
              onRetry={() => activeTransactionsQuery.refetch()}
              onSelectTransaction={handleSelectTransaction}
              onFinish={setSelectedFinishTransaction}
              onAddItem={setSelectedAddItemTransaction}
              onMoveConsole={setSelectedMoveConsoleTransaction}
            />
          </div>
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
