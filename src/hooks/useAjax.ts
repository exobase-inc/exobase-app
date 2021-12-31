import _ from 'radash'
import { useState } from 'react'


export interface AjaxFetchState<TArgs, TResult> {
  loading: boolean
  data: null | TResult
  error: null | Error | string
  fetch: (args: TArgs) => Promise<[Error, TResult]>
}

export const useAjax = <TArgs, TResult>(
  fetchFunc: (args: TArgs) => Promise<TResult>
): AjaxFetchState<TArgs, TResult> => {

  const [state, setState] = useState<Omit<AjaxFetchState<TArgs, TResult>, 'fetch'>>({
    loading: false,
    data: null,
    error: null
  })

  const fetch = async (args: TArgs): Promise<[Error, TResult]> => {
    setState({ ...state, loading: true })
    const [error, result] = await _.try(fetchFunc)(args)
    if (error) {
      setState({
        ...state,
        error,
        loading: false
      })
    } else {
      setState({
        ...state,
        error: null,
        data: result,
        loading: false
      })
    }
    return [error, result]
  }

  return {
    ...state,
    fetch
  }
}

export default useAjax