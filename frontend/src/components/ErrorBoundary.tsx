import React, { Component, ReactNode, useCallback, useState } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryInnerProps extends Props {
  onError: (error: Error, info: React.ErrorInfo) => void
}

/**
 * Internal class component used only to capture errors.
 * React does not yet provide a hook equivalent for componentDidCatch /
 * getDerivedStateFromError, so a minimal class is still required to catch
 * render errors from descendants. All rendering logic lives in the
 * function component below.
 */
class ErrorCatcher extends Component<ErrorBoundaryInnerProps, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError(error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleError = useCallback((err: Error, info: React.ErrorInfo) => {
    console.error('[ErrorBoundary]', err, info.componentStack)
    setError(err)
    setHasError(true)
  }, [])

  const handleReset = useCallback(() => {
    setHasError(false)
    setError(null)
  }, [])

  const renderFallback = () => {
    if (fallback !== undefined) {
      return fallback
    }
    return (
      <div role="alert" className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-destructive font-medium">Something went wrong.</p>
        <p className="text-muted-foreground text-sm">{error?.message}</p>
        <button
          className="rounded-sm text-sm text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={handleReset}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <ErrorCatcher fallback={renderFallback()} onError={handleError}>
      {children}
    </ErrorCatcher>
  )
}