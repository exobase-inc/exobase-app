/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Center, Split } from '../layout'
import {
  Pane,
  Heading,
  SelectMenu,
  Button,
  Paragraph,
  majorScale,
  IconButton,
  toaster
} from 'evergreen-ui'
import { Header, Sidebar } from '../ui'
import { useFetch } from '../../hooks'
import * as api from '../../api'
import {
  idTokenState,
  currentPlatformIdState,
  currentEnvironmentState,
  currentPlatformState
} from '../../state/app'
import ServiceGrid from '../ui/ServiceGrid'
import { HiPlus } from 'react-icons/hi'


export default function ServicesScene() {

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

  const environments = currentPlatform?.environments?.map(e => ({
    label: e.name,
    value: e.id
  })) ?? []

  const changeSelectedEnvironment = (newEnvironmentId: string) => {
    setCurrentEnvironmentId(newEnvironmentId as any)
  }

  const createService = () => {
    navigate('/services/new')
  }

  return (
    <Pane>
      <Header />
      <Split flex={1}>
        <Sidebar />
        <Pane
          flex={1}
          backgroundColor='#F2F2F2'
          minHeight={'100vh'}
          paddingX={majorScale(4)}
          paddingTop={majorScale(4)}
        >
          <Split alignItems='center'>
            <Heading flex={1}>The {currentPlatform?.name} Platform</Heading>
            <SelectMenu
              title="Select Environment"
              options={environments}
              selected={currentEnvironment?.id}
              onSelect={(item) => changeSelectedEnvironment(item.value as string)}
            >
              <Button>{currentEnvironment?.name || 'Select env...'}</Button>
            </SelectMenu>
            <IconButton
              marginLeft={majorScale(2)}
              icon={<HiPlus size={20} />}
              onClick={createService}
            />
          </Split>
          {services.length === 0 && (
            <Center height='50vh'>
              <Pane
                backgroundColor='#FFFFFF'
                padding={majorScale(4)}
                borderRadius={4}
              >
                <Heading>No Services</Heading>
                <Paragraph marginBottom={majorScale(2)}>
                  This platform has no services in the current environment
                </Paragraph>
                <Pane>
                  <Button onClick={createService}>Create</Button>
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
        </Pane>
      </Split>
    </Pane>
  )
}