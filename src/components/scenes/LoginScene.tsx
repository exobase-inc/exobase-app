import Recoil from 'recoil'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Center, Split } from '../layout'
import { Magic } from 'magic-sdk'
import config from '../../config'
import { useFetch } from '../../hooks'
import api from '../../api'
import { appState } from '../../state/app'
import storage from '../../storage'
import Logo from '../ui/Logo'
import {
  TextInput,
  Heading,
  Paragraph,
  Pane,
  Button,
  toaster,
  majorScale
} from 'evergreen-ui'


export default function LoginScene() {

  const navigate = useNavigate()
  const setAppState = Recoil.useSetRecoilState(appState)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginRequest = useFetch(api.auth.login)

  useEffect(() => {
    const knownUser = storage.latestUser.get()
    if (!knownUser) return
    setEmail(knownUser.email)
  }, [])

  const login = async () => {

    const loginResponse = await loginRequest.fetch({
      email, password
    })
    if (loginResponse.error) {
      console.error(loginResponse.error)
      toaster.danger(loginResponse.error.details)
      return
    }

    const { user, exp, idToken, workspace } = loginResponse.data

    setAppState({
      user,
      idToken,
      workspace,
      platformId: workspace.platforms[0].id
    })

    storage.latestUser.set({ email })
    storage.token.set({
      idToken,
      exp,
      email
    })

    navigate('/dashboard')
  }

  return (
    <Center
      minHeight='100vh'
      backgroundColor='#F2F2F2'
    >
      <Pane
        padding={majorScale(4)}
        backgroundColor='#FFFFFF'
        borderRadius={4}
      >
        <Center marginBottom={majorScale(4)}>
          <Logo width={100} />
        </Center>
        <Heading size={800}>Login</Heading>
        <Paragraph
          maxWidth={300}
        >
          Login or create a new account by providing your email so we can verify you.
        </Paragraph>
        <Split marginY={majorScale(2)}>
          <TextInput
            flex={1}
            placeholder='jessie@solar.net'
            onChange={(e: any) => setEmail(e.target.value)}
            value={email}
          />
        </Split>
        <Split marginY={majorScale(2)}>
          <TextInput
            flex={1}
            placeholder='***********'
            onChange={(e: any) => setPassword(e.target.value)}
            value={password}
          />
        </Split>
        <div className="flex flex-row items-center justify-between">
          <Link to="/signup">
            <button className="bg-slate-50 hover:bg-slate-100 rounded p-1">
              Signup
            </button>
          </Link>
          <Button
            width="100%"
            onClick={login}
            disabled={loginRequest.loading}
            isLoading={loginRequest.loading}
            appearance='primary'
          >
            Login
          </Button>
        </div>
      </Pane>
    </Center>
  )
}