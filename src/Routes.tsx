/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import Recoil from 'recoil'
import { useNavigate } from 'react-router-dom'
import storage from './storage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { idTokenState, appState } from './state/app'
import * as api from './api'
import { useFetch } from './hooks'

import ServicesScene from './components/scenes/ServicesScene'
import CreateServiceScene from './components/scenes/CreateServiceScene'
import LoginScene from './components/scenes/LoginScene'
import ProviderScene from './components/scenes/ProviderScene'
import DomainsScene from './components/scenes/DomainsScene'

const GuardAuth = ({
  children
}: {
  children: React.ReactNode
}) => {
  const navigate = useNavigate()
  useEffect(() => {
    const token = storage.token.get()
    if (!token) {
      navigate('/login')
      return
    }
    if (token.exp < +Date.now()) {
      storage.token.remove()
      navigate('/login')
      return
    }
  }, [])
  return (<>{children}</>)
}

const GuardState = ({
  children
}: {
  children: React.ReactNode
}) => {
  const login = useFetch(api.loginOrCreateUser)
  const setAppState = Recoil.useSetRecoilState(appState)
  const idToken = Recoil.useRecoilValue(idTokenState)
  const navigate = useNavigate()

  const tryHydrateState = async () => {
    // If there is already an idToken in the state
    // then we're all good here
    if (idToken) {
      return
    }
    // There is not an idToken in state. Try to pull
    // it from local storage so you can hydrate with it
    const token = storage.token.get()
    // If you couldn't find one then send them to login to
    // start from the beginning
    if (!token) {
      navigate('/login')
      return
    }
    // Check that the token you pulled hasn't expired
    if (token.exp < +Date.now()) {
      storage.token.remove()
      navigate('/login')
      return
    }
    // Fetch all the user data with the token
    const loginResponse = await login.fetch({ didToken: token.didToken })

    if (loginResponse.error) {
      console.error(loginResponse.error)
      navigate('/login')
      return
    }

    setAppState({
      user: loginResponse.data.user,
      idToken: loginResponse.data.idToken,
      platforms: loginResponse.data.platforms,
      currentPlatform: null,
      currentPlatformId: loginResponse.data.platformId,
      currentEnvironmentId: loginResponse.data.environmentId
    })

    storage.token.set({ 
      didToken: token.didToken,
      idToken: loginResponse.data.idToken,
      exp: loginResponse.data.exp, 
      email: token.email
    })

    navigate('/services')
  }

  useEffect(() => {
    tryHydrateState()
  }, [])
  if (!idToken || login.loading) return (
    <span>loading...</span>
  )
  return (<>{children}</>)
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="services" />} />
        <Route path="/services" element={(
          <GuardAuth>
            <GuardState>
              <ServicesScene />
            </GuardState>
          </GuardAuth>
        )} />
        <Route path="/services/new" element={(
          <GuardAuth>
            <GuardState>
              <CreateServiceScene />
            </GuardState>
          </GuardAuth>
        )} />
        <Route path="/providers" element={(
          <GuardAuth>
            <GuardState>
              <ProviderScene />
            </GuardState>
          </GuardAuth>
        )} />
        <Route path="/domains" element={(
          <GuardAuth>
            <GuardState>
              <DomainsScene />
            </GuardState>
          </GuardAuth>
        )} />
        <Route path="/login" element={<LoginScene />} />
      </Routes>
    </BrowserRouter>
  )
}