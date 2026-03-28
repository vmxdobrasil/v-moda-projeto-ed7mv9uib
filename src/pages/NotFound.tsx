/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Usuário tentou acessar uma rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[70vh] flex items-center justify-center pt-32">
      <div className="text-center">
        <h1 className="text-5xl font-serif mb-6">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oops! Página não encontrada</p>
        <a
          href="/"
          className="inline-flex items-center justify-center bg-black text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-transform hover:scale-105"
        >
          Voltar para o Início
        </a>
      </div>
    </div>
  )
}

export default NotFound
