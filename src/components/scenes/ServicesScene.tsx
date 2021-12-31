/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Center, Split } from '../layout'
import * as t from '../../types'
import {
  Pane,
  Heading,
  Button,
  Paragraph,
  majorScale,
  toaster
} from 'evergreen-ui'
import { HiPlusSm } from 'react-icons/hi'
import { useFetch } from '../../hooks'
import api from '../../api'
import {
  idTokenState,
  currentPlatformState
} from '../../state/app'
import ServiceGrid from '../ui/ServiceGrid'
import { SceneLayout, ServiceDetailSideSheet } from '../ui'


export default function ServicesScene() {

  const navigate = useNavigate()

  // Local State
  const [deployments, setDeployments] = useState<t.Deployment[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  // Global State
  const idToken = Recoil.useRecoilValue(idTokenState)
  const [currentPlatform, setCurrentPlatform] = Recoil.useRecoilState(currentPlatformState)

  // API Requests
  const getPlatformRequest = useFetch(api.platforms.getById)
  const getDeploymentsRequest = useFetch(api.deployments.getLatest)
  const deployRequest = useFetch(api.services.deploy)

  const deployService = async (service: t.Service) => {
    const { error } = await deployRequest.fetch({
      serviceId: service.id
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
    }
  }

  const getPlatform = async () => {
    const { error, data } = await getPlatformRequest.fetch({
      id: currentPlatform?.id!
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    setCurrentPlatform(data.platform)
  }

  const getDeployments = async () => {
    const { error, data } = await getDeploymentsRequest.fetch({}, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    setDeployments(data.deployments)
  }


  useEffect(() => {
    if (!currentPlatform?.id) return
    getPlatform()
  }, [currentPlatform?.id])

  useEffect(() => {
    if (!currentPlatform?.id) return
    getDeployments()
  }, [currentPlatform?.id])

  const services = currentPlatform?.services ?? []
  const servicesWithDeployments = services.map(s => ({
    ...s,
    latestDeployment: deployments.find(d => d.serviceId === s?.id) ?? null
  }))
  const currentService = servicesWithDeployments.find(s => s.id === selectedServiceId) ?? null

  const createService = () => {
    navigate('/services/new')
  }

  const handleServiceSelection = (service: t.Service) => {
    setSelectedServiceId(service.id)
  }

  return (
    <SceneLayout subtitle='Services'>
      <ServiceDetailSideSheet
        isShown={currentService !== null}
        service={currentService!}
        onClose={() => setSelectedServiceId(null)}
      />
      <Split marginBottom={majorScale(4)}>
        <Pane flex={1} />
        <Button appearance='primary' iconBefore={<HiPlusSm />} onClick={createService}>
          Add Service
        </Button>
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
              This platform has no service
            </Paragraph>
            <Pane>
              <Button onClick={createService}>Create</Button>
            </Pane>
          </Pane>
        </Center>
      )}
      {servicesWithDeployments.length > 0 && (
        <Pane paddingBottom={majorScale(4)}>
          <ServiceGrid
            services={services}
            onSelect={handleServiceSelection}
            onDeploy={deployService}
          />
        </Pane>
      )}
    </SceneLayout>
  )
}