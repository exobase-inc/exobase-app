import { useState } from 'react'
import { ApiResponse, ApiError } from '../api'


interface FetchState <K, T> {
    loading: boolean
    data: null | T
    error: null | ApiError
    started: boolean
    complete: boolean
    pending: boolean
    fetch: (arg: K) => Promise<ApiResponse<T>>
}

export const useFetch = <T, K> (fetchFunc: (arg: K) => Promise<ApiResponse<T>>): FetchState<K, T> => {

    const [state, setState] = useState<FetchState<K, T>>({
        loading: false,
        data: null,
        error: null,
        started: false,
        complete: false,
        pending: false,
        fetch: () => new Promise(() => {})
    })

    const fetch = async (arg: K): Promise<ApiResponse<T>> => {
        setState({ ...state, loading: true, started: true })
        const { error, data } = await fetchFunc(arg)
        if (error) {
            setState({
                ...state,
                error,
                loading: false,
                complete: true,
                started: true
            })
        } else {
            setState({
                ...state,
                error: null,
                data,
                loading: false,
                complete: true,
                started: true
            })
        }
        return { error, data }
    }

    return {
        ...state,
        fetch
    }
}

export default useFetch