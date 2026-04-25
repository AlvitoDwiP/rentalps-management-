import { useEffect } from "react";

function isTypingTarget(target) {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  return false;
}

function hasOpenModal() {
  if (typeof document === "undefined") {
    return false;
  }

  return Boolean(document.querySelector("[data-modal-root='true']"));
}

function useDashboardShortcuts({
  isTransactionPanelOpen,
  openTransactionPanel,
  closeTransactionPanel,
  showShortcutHelp,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      if (hasOpenModal()) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "escape" && isTransactionPanelOpen) {
        closeTransactionPanel();
        return;
      }

      if (key === "t") {
        openTransactionPanel();
        return;
      }

      if (key === "d") {
        closeTransactionPanel();
        return;
      }

      if (key === "h") {
        showShortcutHelp();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    closeTransactionPanel,
    isTransactionPanelOpen,
    openTransactionPanel,
    showShortcutHelp,
  ]);
}

export default useDashboardShortcuts;
