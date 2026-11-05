export function getErrorMessage(err, fallback = 'Une erreur est survenue.') {
  if (!err.response) return 'Impossible de se connecter au serveur.'
  const message = err.response.data?.message
  return typeof message === 'string' && message ? message : fallback
}