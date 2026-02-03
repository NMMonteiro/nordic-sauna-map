import React, { Component, ReactNode } from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Archive system bootstrapping...");
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#e11d48', fontFamily: 'system-ui, sans-serif', background: 'white', minHeight: '100vh' }}>
          <h1 style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Deployment Diagnostic</h1>
          <p style={{ color: '#475569', fontWeight: 500 }}>The application failed to initialize in this environment.</p>
          <div style={{ background: '#fff1f2', padding: '24px', borderRadius: '16px', border: '1px solid #fecdd3', marginTop: '24px' }}>
            <code style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>{this.state.error?.name}: {this.state.error?.message}</code>
            <pre style={{ fontSize: '11px', opacity: 0.6, overflow: 'auto', maxHeight: '300px' }}>{this.state.error?.stack}</pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '24px', background: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Retry Initialization
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);