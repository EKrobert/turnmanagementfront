import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_API_URL.replace(/^http/, 'ws') + '/ws'

/**
 * Écoute des signaux « ça a changé » sur un ou plusieurs canaux.
 * onSignal est aussi appelé à chaque (re)connexion, pour rattraper ce qui a été manqué.
 */
export function useRealtime(topics, onSignal) {
  const handler = useRef(onSignal)
  useEffect(() => {
    handler.current = onSignal
  })

  const key = topics.filter(Boolean).join('|')

  useEffect(() => {
    if (!key) return
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        key.split('|').forEach((topic) => client.subscribe(topic, () => handler.current()))
        handler.current()
      },
    })
    client.activate()
    return () => {
      client.deactivate()
    }
  }, [key])
}