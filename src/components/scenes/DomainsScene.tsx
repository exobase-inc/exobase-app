/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Center } from '../layout'
import {
  Pane,
  Heading,
  Button,
  Paragraph,
  majorScale,
  toaster
} from 'evergreen-ui'
import { useFetch } from '../../hooks'
import * as api from '../../api'
import {
  idTokenState,
  currentPlatformIdState,
  currentEnvironmentState,
  currentPlatformState
} from '../../state/app'
import ServiceGrid from '../ui/ServiceGrid'
import { SceneLayout } from '../ui'


export default function DomainsScene() {

  const navigate = useNavigate()
  const idToken = Recoil.useRecoilValue(idTokenState)
  const getPlatformRequest = useFetch(api.getPlatformById)
  const currentPlatformId = Recoil.useRecoilValue(currentPlatformIdState)
  const [currentPlatform, setCurrentPlatform] = Recoil.useRecoilState(currentPlatformState)
  const [currentEnvironment, setCurrentEnvironmentId] = Recoil.useRecoilState(currentEnvironmentState)

  useEffect(() => {
    if (!currentPlatformId) return
    getPlatform()
  }, [currentPlatformId])

  const getPlatform = async () => {
    const { error, data } = await getPlatformRequest.fetch({
      idToken: idToken!,
      platformId: currentPlatformId!
    })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
    }
    setCurrentPlatform(data.platform)
  }

  const services = currentPlatform?.services ?? []

  const setupDomain = () => {
    navigate('/services/new')
  }

  return (
    <SceneLayout>
      {services.length === 0 && (
        <Center height='50vh'>
          <Pane
            backgroundColor='#FFFFFF'
            padding={majorScale(4)}
            borderRadius={4}
          >
            <Heading>No Domains</Heading>
            <Paragraph marginBottom={majorScale(2)}>
              This platform has no domains configured
            </Paragraph>
            <Pane>
              <Button onClick={setupDomain}>Setup a Domain</Button>
            </Pane>
          </Pane>
        </Center>
      )}
      {services.length > 0 && (
        <ServiceGrid
          services={services}
          environmentId={currentEnvironment?.id}
        />
      )}
    </SceneLayout>
  )
}