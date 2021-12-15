import Recoil from 'recoil'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Center, Split } from '../layout'
import { Magic } from 'magic-sdk'
import config from '../../config'
import { useFetch } from '../../hooks'
import * as api from '../../api'
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
  const [loading, setLoading] = useState(false)
  const loginUser = useFetch(api.loginOrCreateUser)

  useEffect(() => {
    const knownUser = storage.latestUser.get()
    if (!knownUser) return
    setEmail(knownUser.email)
  }, [])

  const login = async () => {

    const magic = new Magic(config.magicKey)

    setLoading(true)
    try {
      await magic.auth.loginWithMagicLink({ email })
    } catch (err) {
      console.error(err)
      setLoading(false)
      toaster.danger('Something has gone wrong with Magic.')
      return
    }

    const didToken = await magic.user.getIdToken()

    const loginResponse = await loginUser.fetch({ didToken })
    if (loginResponse.error) {
      console.error(loginResponse.error)
      setLoading(false)
      toaster.danger('Something has gone wrong with our api.')
      return
    }

    const { user, exp, idToken, platforms, platformId, environmentId } = loginResponse.data

    setAppState({
      user,
      idToken,
      platforms,
      currentPlatform: null,
      currentPlatformId: platformId,
      currentEnvironmentId: environmentId
    })

    storage.latestUser.set({ email })
    storage.token.set({
      didToken,
      idToken,
      exp,
      email
    })

    navigate('/services')
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
        <Button
          width="100%"
          onClick={login}
          disabled={loading}
          appearance='primary'
        >
          Next
        </Button>
      </Pane>
    </Center>
  )
}