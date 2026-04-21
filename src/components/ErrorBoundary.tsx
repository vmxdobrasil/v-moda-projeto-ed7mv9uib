import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif mb-4">Ops! Algo deu errado.</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            Ocorreu um erro inesperado ao carregar a interface da aplicação. Nossa equipe já foi
            notificada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => window.location.reload()} size="lg" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Recarregar Página
            </Button>
            <Button onClick={() => (window.location.href = '/')} variant="outline" size="lg">
              Voltar ao Início
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-12 text-left w-full max-w-3xl">
              <p className="text-sm font-semibold text-destructive mb-2">
                Detalhes do Erro (Apenas em Dev):
              </p>
              <pre className="p-4 bg-muted/50 border border-border text-xs rounded-lg overflow-x-auto text-muted-foreground">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
