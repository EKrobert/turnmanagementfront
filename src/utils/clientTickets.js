const listKey = (qr) => `tickets:${qr}`
const LAST_QR = 'lastQr'

export function getTicketIds(qr) {
  try {
    const raw = JSON.parse(localStorage.getItem(listKey(qr)) ?? '[]')
    const ids = Array.isArray(raw) ? raw.map(Number) : []
    const legacy = Number(localStorage.getItem(`ticket:${qr}`)) // ancien format
    if (legacy && !ids.includes(legacy)) ids.push(legacy)
    return ids
  } catch {
    return []
  }
}

export function saveTicketIds(qr, ids) {
  try {
    localStorage.setItem(listKey(qr), JSON.stringify(ids))
    localStorage.removeItem(`ticket:${qr}`)
  } catch {
    /* stockage indisponible */
  }
}

export function addTicketId(qr, id) {
  const ids = getTicketIds(qr)
  if (!ids.includes(id)) saveTicketIds(qr, [...ids, id])
  try {
    localStorage.setItem(LAST_QR, qr)
  } catch {
    /* ignoré */
  }
}

export function getLastQr() {
  try {
    return localStorage.getItem(LAST_QR)
  } catch {
    return null
  }
}