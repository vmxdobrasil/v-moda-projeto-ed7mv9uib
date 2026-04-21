import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo)
  }

  private handleReset = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-destructive/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl text-zinc-900">Algo deu errado</CardTitle>
                <CardDescription className="text-base">
                  Não foi possível carregar o conteúdo solicitado. Nossa equipe técnica já foi
                  notificada.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-zinc-900 rounded-md overflow-auto max-h-48 text-left">
                  <p className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" className="w-full" onClick={this.handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Página Inicial
              </Button>
              <Button
                variant="default"
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={this.handleReset}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
