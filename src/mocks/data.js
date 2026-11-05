// Données fictives temporaires : seront remplacées par les appels API.
export const services = [
  { id: 1, name: 'Accueil', description: "Service d'accueil des patients", counters: 2, waiting: 5, active: true },
  { id: 2, name: 'Consultations', description: 'Consultations médicales', counters: 3, waiting: 8, active: true },
  { id: 3, name: 'Radiologie', description: 'Examens et imagerie', counters: 1, waiting: 0, active: false },
]

export const counters = [
  { id: 1, name: 'Guichet 1', service: 'Accueil', agents: ['Agent Un'], waiting: 3, active: true },
  { id: 2, name: 'Guichet 2', service: 'Accueil', agents: ['Sara Alami'], waiting: 2, active: true },
  { id: 3, name: 'Cabinet A', service: 'Consultations', agents: ['Youssef Idrissi', 'Agent Un'], waiting: 5, active: true },
  { id: 4, name: 'Salle IRM', service: 'Radiologie', agents: [], waiting: 0, active: false },
]

export const agents = [
  { id: 1, name: 'Agent Un', email: 'agent1@atlas.com', counters: ['Guichet 1', 'Cabinet A'], active: true },
  { id: 2, name: 'Sara Alami', email: 'sara@atlas.com', counters: ['Guichet 2'], active: true },
  { id: 3, name: 'Youssef Idrissi', email: 'youssef@atlas.com', counters: ['Cabinet A'], active: false },
]

export const tickets = [
  { id: 1, number: 12, service: 'Accueil', counter: 'Guichet 1', agent: 'Agent Un', status: 'COMPLETED', createdAt: '09:12', duration: '6 min' },
  { id: 2, number: 13, service: 'Accueil', counter: 'Guichet 2', agent: 'Sara Alami', status: 'IN_PROGRESS', createdAt: '09:15', duration: '-' },
  { id: 3, number: 14, service: 'Consultations', counter: 'Cabinet A', agent: 'Agent Un', status: 'SKIPPED', createdAt: '09:20', duration: '-' },
  { id: 4, number: 15, service: 'Accueil', counter: '-', agent: '-', status: 'WAITING', createdAt: '09:31', duration: '-' },
  { id: 5, number: 16, service: 'Consultations', counter: 'Cabinet A', agent: 'Agent Un', status: 'CALLED', createdAt: '09:40', duration: '-' },
]

export const hourlyActivity = [
  { hour: '8h', value: 12 }, { hour: '9h', value: 28 }, { hour: '10h', value: 35 },
  { hour: '11h', value: 30 }, { hour: '12h', value: 14 }, { hour: '13h', value: 10 },
  { hour: '14h', value: 22 }, { hour: '15h', value: 26 }, { hour: '16h', value: 16 },
]