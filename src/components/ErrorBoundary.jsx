import React from 'react';
import { AlertTriangle, RefreshCw, Home, Send } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, timestamp: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, timestamp: new Date().toISOString() };
  }

  componentDidCatch(error, errorInfo) {
    console.error('XENMOVIES Caught Error:', error, errorInfo);
  }

  handleReportError = () => {
    const { error, timestamp } = this.state;
    const subject = encodeURIComponent('XENMOVIES Error Report');
    const body = encodeURIComponent(`Error Report\n\nTimestamp: ${timestamp}\nURL: ${window.location.href}\n\nError: ${error?.message}\n\nStack: ${error?.stack}`);
    window.location.href = `mailto:parthxen09@gmail.com?subject=${subject}&body=${body}`;
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#07080d] p-4 text-white select-none">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0c0f1d] border border-purple-500/30 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected interface glitch occurred. Your saved library and session are safe.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleHome}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

