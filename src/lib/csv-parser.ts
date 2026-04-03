export async function parseCSV(
  file: File,
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  if (file.name.endsWith('.xlsx')) {
    return Promise.reject(
      new Error(
        'Formato XLSX não suportado diretamente sem conversão. Por favor, salve seu arquivo como CSV e tente novamente.',
      ),
    )
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return reject(new Error('Empty file'))
      const lines = text.split(/\r?\n/).filter((l) => l.trim())
      if (lines.length === 0) return reject(new Error('No data'))

      // Detect separator
      const firstLine = lines[0]
      const sep =
        (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ';' : ','

      const headers = firstLine.split(sep).map((h) => h.trim().replace(/^"|"$/g, ''))
      const rows = lines.slice(1).map((line) => {
        const row: Record<string, string> = {}
        let inQuotes = false
        let val = ''
        let colIdx = 0
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') inQuotes = !inQuotes
          else if (char === sep && !inQuotes) {
            row[headers[colIdx] || `col_${colIdx}`] = val.trim().replace(/^"|"$/g, '')
            val = ''
            colIdx++
          } else {
            val += char
          }
        }
        row[headers[colIdx] || `col_${colIdx}`] = val.trim().replace(/^"|"$/g, '')
        return row
      })
      resolve({ headers, rows })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
