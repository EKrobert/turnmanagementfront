export const STATUS = {
  WAITING: { label: 'En attente', tone: 'amber' },
  CALLED: { label: 'Appelé', tone: 'blue' },
  IN_PROGRESS: { label: 'En cours', tone: 'indigo' },
  COMPLETED: { label: 'Terminé', tone: 'green' },
  SKIPPED: { label: 'Passé', tone: 'slate' },
}

export const formatTicketNumber = (n) => `N° ${String(n).padStart(3, '0')}`