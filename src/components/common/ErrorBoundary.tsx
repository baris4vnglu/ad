"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 text-center p-8">
          <AlertTriangle size={32} className="text-amber-500" />
          <div>
            <p className="font-semibold text-gray-900">Bir şeyler ters gitti</p>
            <p className="text-sm text-gray-500 mt-1">Sayfayı yenileyip tekrar deneyin.</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="text-sm text-blue-600 hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
