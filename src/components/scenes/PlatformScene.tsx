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
import api from '../../api'
import {
  idTokenState,
  currentPlatformIdState,
  currentPlatformState
} from '../../state/app'
import { SceneLayout } from '../ui'


export default function PlatformScene() {

  const navigate = useNavigate()
  const idToken = Recoil.useRecoilValue(idTokenState)
  const getPlatformRequest = useFetch(api.platforms.getById)
  const currentPlatformId = Recoil.useRecoilValue(currentPlatformIdState)
  const setCurrentPlatform = Recoil.useSetRecoilState(currentPlatformState)

  useEffect(() => {
    if (!currentPlatformId) return
    getPlatform()
  }, [currentPlatformId])

  const getPlatform = async () => {
    const { error, data } = await getPlatformRequest.fetch({
      id: currentPlatformId!
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
    }
    setCurrentPlatform(data.platform)
  }

  const gotoServices = () => {
    navigate('/services')
  }

  return (
    <SceneLayout>
      <Center height='50vh'>
        <Pane
          backgroundColor='#FFFFFF'
          padding={majorScale(4)}
          borderRadius={4}
        >
          <Heading>Dashboard Coming Soon</Heading>
          <Paragraph marginBottom={majorScale(2)}>
            Service health, cloud settings, deployments, and cost breakdowns is on the way.
          </Paragraph>
          <Pane>
            <Button onClick={gotoServices}>View Services</Button>
          </Pane>
        </Pane>
      </Center>
    </SceneLayout>
  )
}