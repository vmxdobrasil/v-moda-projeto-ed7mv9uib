export default function CrmPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-primary font-display">{title.charAt(0)}</span>
      </div>
      <h2 className="text-2xl font-bold text-white font-display">{title}</h2>
      <p className="text-white/40 mt-2 max-w-sm">
        Esta seção está em desenvolvimento e será disponibilizada em breve.
      </p>
    </div>
  )
}
