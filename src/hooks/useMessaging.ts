/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react'

const KEY = 'psh.message'
type SubscriptionFunc<T = any> = (message: T) => void

export const useMessaging = () => {

  const [subscription, setSubscription] = useState<SubscriptionFunc | null>()

  useEffect(() => {
    window.onstorage = handleStorageEvent
  }, [])

  const handleStorageEvent = useCallback((ev: StorageEvent) => {
    if (!subscription) return // no subscription to fire, so who cares
    if (!ev.key || !ev.newValue) return // key & newValue are null when event is a clear()
    if (ev.key !== KEY) return // ignore other keys
    const message = JSON.parse(ev.newValue)
    if (!message) return // ignore empty msg or msg reset
    subscription(message)
  }, [])

  const broadcast = (message: any) => {
    localStorage.setItem(KEY, JSON.stringify(message))
    localStorage.removeItem(KEY)
  }

  const subscribe = (callback: SubscriptionFunc) => {
    setSubscription(callback)
  }

  return {
    broadcast,
    subscribe
  }
}