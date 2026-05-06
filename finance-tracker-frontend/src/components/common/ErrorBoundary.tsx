"use client";

import React, { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-text-secondary text-sm mb-6 max-w-md">
            An unexpected error occurred. Please try again or refresh the page.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={this.handleReset}
              className="rounded-full"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
