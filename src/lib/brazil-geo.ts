export const STATE_TO_REGION: Record<string, string> = {
  AC: 'Norte',
  AP: 'Norte',
  AM: 'Norte',
  PA: 'Norte',
  RO: 'Norte',
  RR: 'Norte',
  TO: 'Norte',
  AL: 'Nordeste',
  BA: 'Nordeste',
  CE: 'Nordeste',
  MA: 'Nordeste',
  PB: 'Nordeste',
  PE: 'Nordeste',
  PI: 'Nordeste',
  RN: 'Nordeste',
  SE: 'Nordeste',
  DF: 'Centro-Oeste',
  GO: 'Centro-Oeste',
  MT: 'Centro-Oeste',
  MS: 'Centro-Oeste',
  ES: 'Sudeste',
  MG: 'Sudeste',
  RJ: 'Sudeste',
  SP: 'Sudeste',
  PR: 'Sul',
  RS: 'Sul',
  SC: 'Sul',
}

export const DDD_TO_REGION: Record<string, string> = {
  '68': 'Norte',
  '96': 'Norte',
  '92': 'Norte',
  '97': 'Norte',
  '91': 'Norte',
  '93': 'Norte',
  '94': 'Norte',
  '69': 'Norte',
  '95': 'Norte',
  '63': 'Norte',
  '82': 'Nordeste',
  '71': 'Nordeste',
  '73': 'Nordeste',
  '74': 'Nordeste',
  '75': 'Nordeste',
  '77': 'Nordeste',
  '85': 'Nordeste',
  '88': 'Nordeste',
  '98': 'Nordeste',
  '99': 'Nordeste',
  '83': 'Nordeste',
  '81': 'Nordeste',
  '87': 'Nordeste',
  '86': 'Nordeste',
  '89': 'Nordeste',
  '84': 'Nordeste',
  '79': 'Nordeste',
  '61': 'Centro-Oeste',
  '62': 'Centro-Oeste',
  '64': 'Centro-Oeste',
  '65': 'Centro-Oeste',
  '66': 'Centro-Oeste',
  '67': 'Centro-Oeste',
  '27': 'Sudeste',
  '28': 'Sudeste',
  '31': 'Sudeste',
  '32': 'Sudeste',
  '33': 'Sudeste',
  '34': 'Sudeste',
  '35': 'Sudeste',
  '37': 'Sudeste',
  '38': 'Sudeste',
  '21': 'Sudeste',
  '22': 'Sudeste',
  '24': 'Sudeste',
  '11': 'Sudeste',
  '12': 'Sudeste',
  '13': 'Sudeste',
  '14': 'Sudeste',
  '15': 'Sudeste',
  '16': 'Sudeste',
  '17': 'Sudeste',
  '18': 'Sudeste',
  '19': 'Sudeste',
  '41': 'Sul',
  '42': 'Sul',
  '43': 'Sul',
  '44': 'Sul',
  '45': 'Sul',
  '46': 'Sul',
  '51': 'Sul',
  '53': 'Sul',
  '54': 'Sul',
  '55': 'Sul',
  '47': 'Sul',
  '48': 'Sul',
  '49': 'Sul',
}

export const REGION_COLORS: Record<string, string> = {
  Sudeste: 'hsl(24, 100%, 50%)',
  Nordeste: 'hsl(210, 100%, 12.5%)',
  Sul: 'hsl(215, 85%, 45%)',
  'Centro-Oeste': 'hsl(280, 65%, 50%)',
  Norte: 'hsl(150, 60%, 40%)',
  Outros: 'hsl(0, 0%, 60%)',
}

export function extractDDD(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  let normalized = digits
  if (normalized.startsWith('55') && normalized.length > 11) {
    normalized = normalized.substring(2)
  }
  if (normalized.length >= 10) {
    return normalized.substring(0, 2)
  }
  if (normalized.length >= 2 && normalized.length <= 9) {
    return normalized.substring(0, 2)
  }
  return ''
}

export function getRegionFromDDD(ddd: string): string {
  return DDD_TO_REGION[ddd] || 'Outros'
}

export function getRegionFromState(state: string): string {
  return STATE_TO_REGION[state?.toUpperCase()?.trim()] || 'Outros'
}

export const BRAZILIAN_REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']
