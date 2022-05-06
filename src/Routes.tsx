/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import Recoil from 'recoil'
import { useNavigate } from 'react-router-dom'
import storage from './storage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { idTokenState, appState } from './state/app'
import api from './api'
import { useFetch } from './hooks'
import { toaster } from 'evergreen-ui'

import ServicesScene from './components/scenes/ServicesScene'
import CreateServiceScene from './components/scenes/CreateServiceScene'
import LoginScene from './components/scenes/LoginScene'
import ProviderScene from './components/scenes/ProviderScene'
import DomainsScene from './components/scenes/DomainsScene'
import DashboardScene from './components/scenes/DashboardScene'
import CreateDomainScene from './components/scenes/CreateDomainScene'
import GithubAppInstalledScene from './components/scenes/GithubAppInstalledScene'
import DeploymentScene from './components/scenes/DeploymentScene'
import AuthGuard from './guards/AuthGuard'
import AdminPacksScene from './components/scenes/AdminPacksScene'
import SignupScene from './components/scenes/SignupScene'

const GuardState = ({
  children
}: {
  children: React.ReactNode
}) => {
  const refreshRequest = useFetch(api.auth.refresh)
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
      storage.token.clear()
      navigate('/login')
      return
    }
    // Fetch all the user data with the token
    const refresh = await refreshRequest.fetch({}, { token: token.idToken })

    if (refresh.error) {
      console.error(refresh.error)
      toaster.danger(refresh.error.details)
      navigate('/login')
      return
    }

    setAppState({
      user: refresh.data.user,
      idToken: refresh.data.idToken,
      workspace: refresh.data.workspace,
      platformId: refresh.data.workspace.platforms[0].id
    })

    storage.token.set({ 
      idToken: refresh.data.idToken,
      exp: refresh.data.exp, 
      email: token.email
    })
  }

  useEffect(() => {
    tryHydrateState()
  }, [])
  if (!idToken || refreshRequest.loading) return (
    <span>loading...</span>
  )
  return (<>{children}</>)
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="/dashboard" element={(
          <AuthGuard>
            <GuardState>
              <DashboardScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/platform/:platformId/services" element={(
          <AuthGuard>
            <GuardState>
              <ServicesScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/platform/:platformId/services/new" element={(
          <AuthGuard>
            <GuardState>
              <CreateServiceScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/platform/:platformId/providers" element={(
          <AuthGuard>
            <GuardState>
              <ProviderScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/platform/:platformId/domains" element={(
          <AuthGuard>
            <GuardState>
              <DomainsScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/platform/:platformId/domains/new" element={(
          <AuthGuard>
            <GuardState>
              <CreateDomainScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/platform/:platformId/services/:unitId/deployments/:deploymentId" element={(
          <AuthGuard>
            <GuardState>
              <DeploymentScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/packs" element={(
          <AuthGuard>
            <GuardState>
              <AdminPacksScene />
            </GuardState>
          </AuthGuard>
        )} />
        <Route path="/github-app-installed" element={(
          <GithubAppInstalledScene />
        )} />
        <Route path="/login" element={<LoginScene />} />
        <Route path="/signup" element={<SignupScene />} />
      </Routes>
    </BrowserRouter>
  )
}