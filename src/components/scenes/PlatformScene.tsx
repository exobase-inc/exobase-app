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
  currentPlatformState
} from '../../state/app'
import { SceneLayout } from '../ui'


export default function PlatformScene() {

  const navigate = useNavigate()
  const idToken = Recoil.useRecoilValue(idTokenState)
  const getPlatformRequest = useFetch(api.getPlatformById)
  const currentPlatformId = Recoil.useRecoilValue(currentPlatformIdState)
  const setCurrentPlatform = Recoil.useSetRecoilState(currentPlatformState)

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