/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'

export function useTimeout<T>(durationSeconds: number, beforeValue: T, afterValue: T): T {
  const [value, setValue] = useState(beforeValue)
  useEffect(() => {
    const tid = setTimeout(() => setValue(afterValue), durationSeconds * 1000)
    return () => clearTimeout(tid)
  }, [])
  return value
}