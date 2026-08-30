import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pb.autoCancellation(false)

// 🔑 Hidratação síncrona e imediata do authStore logo na inicialização do módulo.
// O PocketBase SDK armazena o token na chave 'pocketbase_auth' do localStorage.
// Se pb.authStore estiver vazio no carregamento do arquivo, restauramos imediatamente
// antes de qualquer componente React ou rota rodar.
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    const raw = localStorage.getItem('pocketbase_auth')
    if (raw && (!pb.authStore.token || !pb.authStore.record)) {
      const parsed = JSON.parse(raw)
      if (parsed?.token && parsed?.record) {
        pb.authStore.save(parsed.token, parsed.record)
      }
    }
  } catch {
    /* best-effort */
  }
}

export default pb
