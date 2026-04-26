import { Component } from "react";

import ErrorState from "./ErrorState.jsx";

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
      componentStack: "",
      currentPath: "",
      authSnapshot: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Terjadi kesalahan saat membuka halaman admin.",
    };
  }

  componentDidCatch(error, info) {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const authSnapshot =
      typeof window !== "undefined"
        ? window.localStorage.getItem("rentalps-cashier-auth") || ""
        : "";

    this.setState({
      componentStack: info?.componentStack || "",
      currentPath,
      authSnapshot,
    });

    console.error("Admin route render error:", error, info);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_22%),linear-gradient(180deg,#09090f_0%,#0f172a_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px] space-y-4">
            <ErrorState
              title="Halaman admin gagal dimuat"
              description={this.state.errorMessage}
              retryLabel="Muat Ulang"
              onRetry={this.handleRetry}
              className="border-white/10 bg-rose-500/10"
            />
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
                Admin Crash Trace
              </p>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white">Path</p>
                  <pre className="mt-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-slate-200">
{this.state.currentPath || "-"}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-white">Component stack</p>
                  <pre className="mt-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-slate-200">
{this.state.componentStack || "Component stack belum tersedia."}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-white">Auth snapshot</p>
                  <pre className="mt-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-slate-200">
{this.state.authSnapshot || "Local storage auth kosong."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
