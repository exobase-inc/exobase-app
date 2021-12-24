/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import type { ApiResponse, Auth } from '@exobase/client-js'
import { useFetch, FetchState } from './useFetch'


type PollingFetchState <TArgs, TResult> = FetchState<TArgs, TResult> & {
  pause: () => void
  poll: () => void
  active: boolean
}

export const usePollingFetch = <TArgs, TResult>(
  fetchFunc: (args: TArgs, auth?: Auth) => Promise<ApiResponse<TResult>>,
  config: {
    active?: boolean,
    args: TArgs,
    auth?: Auth,
    waitMs: number
  }
): PollingFetchState<TArgs, TResult> => {
  const { waitMs, args, auth } = config
  const [active, setActive] = useState((config.active === null || config.active === undefined) ? true : config.active)
  const request = useFetch(fetchFunc)
  useEffect(() => {
    const tid = setInterval(() => {
      if (!active) return 
      request.fetch(args, auth)
    }, waitMs)
    return () => {
      clearInterval(tid)
    }
  }, [waitMs, args, auth])
  return {
    ...request,
    active,
    pause: () => setActive(false),
    poll: () => setActive(true)
  }
}

export default usePollingFetch