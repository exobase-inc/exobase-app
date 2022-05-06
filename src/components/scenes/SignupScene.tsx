import Recoil from 'recoil'
import { useNavigate } from 'react-router-dom'
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


export default function SignupScene() {

  const navigate = useNavigate()
  const setAppState = Recoil.useSetRecoilState(appState)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const signupRequest = useFetch(api.auth.signup)

  useEffect(() => {
    const knownUser = storage.latestUser.get()
    if (!knownUser) return
    setEmail(knownUser.email)
  }, [])

  const login = async () => {

    const signupResponse = await signupRequest.fetch({
      email, password
    })
    if (signupResponse.error) {
      console.error(signupResponse.error)
      toaster.danger(signupResponse.error.details)
      return
    }

    const { user, exp, idToken, workspace } = signupResponse.data

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
        <Heading size={800}>Signup</Heading>
        <Paragraph
          maxWidth={300}
        >
          This will be better, trust us.
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
            type="password"
            placeholder='***********'
            onChange={(e: any) => setPassword(e.target.value)}
            value={password}
          />
        </Split>
        <div className="flex flex-row items-center justify-between">
          <button className="bg-slate-50 hover:bg-slate-100 rounded p-1">
            Signup
          </button>
          <Button
            width="100%"
            onClick={login}
            disabled={signupRequest.loading}
            isLoading={signupRequest.loading}
            appearance='primary'
          >
            Signup
          </Button>
        </div>
      </Pane>
    </Center>
  )
}