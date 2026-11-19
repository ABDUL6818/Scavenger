import React, { Component, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from './EmptyState'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

interface DefaultFallbackProps {
  error: Error | null
  onRetry: () => void
}

function DefaultFallback({ error, onRetry }: DefaultFallbackProps) {
  const { t } = useTranslation()
  return (
    <EmptyState
      role="alert"
      title={t('errorBoundary.title', 'Something went wrong.')}
      description={error?.message ?? t('errorBoundary.description', 'An unexpected error occurred.')}
      actionLabel={t('errorBoundary.tryAgain', 'Try again')}
      onAction={onRetry}
    />
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _info: React.ErrorInfo) {
    // Error reporting hook: integrate with an external error tracking service here.
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <DefaultFallback error={this.state.error} onRetry={this.handleRetry} />
        )
      )
    }
    return this.props.children
  }
}