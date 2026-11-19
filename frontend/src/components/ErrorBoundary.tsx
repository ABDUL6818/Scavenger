import React, { Component, ErrorInfo, ReactNode } from 'react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
  resetKeys?: unknown[]
}

interface State {
  hasError: boolean
  error: Error | null
}

function keysChanged(prev: unknown[] | undefined, next: unknown[] | undefined): boolean {
  if (!prev || !next) return false
  if (prev.length !== next.length) return true
  return prev.some((value, index) => !Object.is(value, next[index]))
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Visible feedback for users via the shared toast strategy.
    try {
      toast.error(error.message || 'Something went wrong.')
    } catch {
      // Toast may be unavailable (e.g. outside a Toaster); never throw from here.
    }

    // Development-only logging to keep production consoles clean.
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }

    this.props.onError?.(error, info)
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && keysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset()
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-destructive font-medium">Something went wrong.</p>
            <p className="text-muted-foreground text-sm">{this.state.error?.message}</p>
            <button
              type="button"
              aria-label="Try again"
              className="rounded-sm text-sm text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={this.reset}
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}