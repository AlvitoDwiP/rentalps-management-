import { Component } from "react";

import ErrorState from "./ErrorState.jsx";

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Terjadi kesalahan saat membuka halaman admin.",
    };
  }

  componentDidCatch(error, info) {
    console.error("Admin route render error:", error, info);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_22%),linear-gradient(180deg,#09090f_0%,#0f172a_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <ErrorState
              title="Halaman admin gagal dimuat"
              description={this.state.errorMessage}
              retryLabel="Muat Ulang"
              onRetry={this.handleRetry}
              className="border-white/10 bg-rose-500/10"
            />
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
