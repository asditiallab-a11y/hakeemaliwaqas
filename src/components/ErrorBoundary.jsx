import { Component } from "react";

// White screen ki jagah asli error dikhata hai (debugging ke liye)
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crash:", error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: "monospace", color: "#b00020" }}>
        <h2 style={{ marginBottom: 12 }}>Kuch ghalat ho gaya (Error)</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
          {String(error?.stack || error?.message || error)}
        </pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: "6px 14px" }}>
          Reload
        </button>
      </div>
    );
  }
}
