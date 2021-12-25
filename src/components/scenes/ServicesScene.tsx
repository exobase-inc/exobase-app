/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Center, Split } from '../layout'
import * as t from '../../types'
import theme from '../../styles'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import {
  Pane,
  StatusIndicator,
  Text,
  Heading,
  Button,
  Paragraph,
  majorScale,
  toaster,
  Badge
} from 'evergreen-ui'
import { HiPlusSm } from 'react-icons/hi'
import { useFetch } from '../../hooks'
import api from '../../api'
import {
  idTokenState,
  currentPlatformState
} from '../../state/app'
import ServiceGrid from '../ui/ServiceGrid'
import { SceneLayout, Blink } from '../ui'


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
    <SceneLayout>
      <Split>
        <Pane flex={1}>
          <Split>
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
            <ServiceGrid
              services={services}
              onSelect={handleServiceSelection}
              onDeploy={deployService}
            />
          )}
        </Pane>
        <Pane
          width='33%'
          paddingLeft={majorScale(4)}
        >
          {currentService && (
            <ServiceDetailsPanel
              service={currentService}
              onDeploy={() => deployService(currentService)}
            />
          )}
        </Pane>
      </Split>
    </SceneLayout>
  )
}

const ServiceDetailsPanel = ({
  service,
  onDeploy
}: {
  service: t.Service | null
  onDeploy: () => void
}) => {

  const { latestDeployment: deployment } = service ?? {}

  const deployStarted = deployment
    ? formatDistanceToNowStrict(new Date(deployment.startedAt), { addSuffix: true })
    : null

  const deployStatusColor = (): 'danger' | 'success' | 'warning' | 'disabled' => {
    if (!deployment) return 'disabled'
    const statusMap: Record<t.DeploymentStatus, 'danger' | 'success' | 'warning' | 'disabled'> = {
      'canceled': 'danger',
      'success': 'success',
      'failed': 'danger',
      'in_progress': 'warning',
      'queued': 'warning',
      'partial_success': 'danger'
    }
    return statusMap[deployment.status] as any
  }

  const statusColor = deployStatusColor()

  const getVersion = (): string => {
    const version = deployment?.attributes.version
    return version ? `v${version}` : ''
  }

  return (
    <Pane
      backgroundColor={theme.colors.grey100}
      padding={majorScale(2)}
      borderRadius={4}
      minHeight='60vh'
    >
      {service && (
        <Pane>
          <Pane>
            <Heading size={800}>{service.name}</Heading>
          </Pane>
          <Pane marginBottom={majorScale(2)}>
            <Badge marginRight={majorScale(1)}>{service.type}</Badge>
            <Badge marginRight={majorScale(1)}>{service.provider}</Badge>
            <Badge>{service.service}</Badge>
          </Pane>
          <Pane marginBottom={majorScale(1)}>
            <Split marginBottom={majorScale(1)}>
              <Heading fontWeight='bold' size={400} flex={1} marginRight={majorScale(1)}>Link:</Heading>
              <Text>{deployment?.attributes?.baseUrl ?? 'none'}</Text>
            </Split>
            <Split marginBottom={majorScale(1)}>
              <Heading fontWeight='bold' size={400} flex={1} marginRight={majorScale(1)}>Deployed:</Heading>
              <Text>{capitalize(deployStarted)}</Text>
            </Split>
            <Split>
              <Heading fontWeight='bold' size={400} flex={1} marginRight={majorScale(1)}>Status:</Heading>
              <Badge marginRight={majorScale(1)}>{deployment?.status}</Badge>
              <Blink $blink={statusColor === 'warning'}>
                <StatusIndicator color={statusColor} />
              </Blink>
            </Split>
            <Text flex={1}>{getVersion()}</Text>
          </Pane>
          <Pane marginBottom={majorScale(1)}>
            <Button onClick={onDeploy}>Redeploy</Button>
          </Pane>
        </Pane>
      )}
    </Pane>
  )
}


const capitalize = (str: string | null) => {
  if (!str) return ''
  return `${str[0].toUpperCase()}${str.slice(1)}`
}
