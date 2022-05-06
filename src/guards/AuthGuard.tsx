import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import storage from "../storage"


export default function AuthGuard ({
    children
  }: {
    children: React.ReactNode
  }) {
    const navigate = useNavigate()
    useEffect(() => {
      const token = storage.token.get()
      if (!token) {
        navigate('/login')
        return
      }
      if (token.exp < +Date.now()) {
        storage.token.clear()
        navigate('/login')
        return
      }
    }, [])
    return (<>{children}</>)
  }