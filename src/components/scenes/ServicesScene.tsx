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
  Strong,
  StatusIndicator,
  Text,
  Heading,
  Popover,
  Button,
  IconButton,
  Paragraph,
  majorScale,
  Position,
  Menu,
  Tab,
  Tablist,
  toaster,
  Badge
} from 'evergreen-ui'
import { HiPlusSm } from 'react-icons/hi'
import { useFetch } from '../../hooks'
import * as api from '../../api'
import {
  idTokenState,
  currentPlatformIdState,
  currentEnvironmentState,
  currentPlatformState
} from '../../state/app'
import ServiceGrid from '../ui/ServiceGrid'
import { SceneLayout, Blink } from '../ui'


export default function ServicesScene() {

  const navigate = useNavigate()
  const [deployments, setDeployments] = useState<t.Deployment[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const idToken = Recoil.useRecoilValue(idTokenState)
  const getPlatformRequest = useFetch(api.getPlatformById)
  const getDeploymentsRequest = useFetch(api.getLatestDeploymentsInEnvironment)
  const currentPlatformId = Recoil.useRecoilValue(currentPlatformIdState)
  const [currentPlatform, setCurrentPlatform] = Recoil.useRecoilState(currentPlatformState)
  const [currentEnvironment, setCurrentEnvironmentId] = Recoil.useRecoilState(currentEnvironmentState)

  useEffect(() => {
    if (!currentPlatformId) return
    getPlatform()
  }, [currentPlatformId])

  useEffect(() => {
    if (!currentPlatformId) return
    if (!currentEnvironment?.id) return
    getDeployments()
  }, [currentPlatformId, currentEnvironment?.id])

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
    const firstService = _.first(data.platform.services)
    if (firstService) setSelectedServiceId(firstService.id)
  }

  const getDeployments = async () => {
    const { error, data } = await getDeploymentsRequest.fetch({
      idToken: idToken!,
      environmentId: currentEnvironment?.id!
    })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
    }
    setDeployments(data.deployments)
  }

  const services = currentPlatform?.services ?? []
  const environments = currentPlatform?.environments ?? []
  const currentService = services.find(s => s.id === selectedServiceId) ?? null
  const currentInstance = currentService?.instances.find(i => i.environmentId === currentEnvironment?.id) ?? null
  const currentDeployment = deployments.find(d => d.instanceId === currentInstance?.id) ?? null

  const changeSelectedEnvironment = (newEnvironmentId: string) => () => {
    setCurrentEnvironmentId(newEnvironmentId as any)
  }

  const createService = () => {
    navigate('/services/new')
  }

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId)
  }

  const createNewEnvironment = () => {

  }

  return (
    <SceneLayout>
      <Split>
        <Pane flex={1}>
          <Split>
            <Tablist flex={1} marginBottom={16} flexBasis={240} marginRight={24}>
              {environments.map((env) => (
                <Tab
                  key={env.id}
                  id={env.id}
                  onSelect={changeSelectedEnvironment(env.id)}
                  isSelected={currentEnvironment?.id === env.id}
                  aria-controls={`panel-${_.dashCase(env.name)}`}
                >
                  {env.name}
                </Tab>
              ))}
            </Tablist>
            <Popover
              position={Position.BOTTOM_RIGHT}
              content={
                <Menu>
                  <Menu.Item onSelect={createNewEnvironment}>New Environment</Menu.Item>
                  <Menu.Item onSelect={createService}>New Service</Menu.Item>
                </Menu>
              }
            >
              <IconButton appearance='primary' icon={<HiPlusSm />} />
            </Popover>
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
              deployments={deployments}
              services={services}
              environmentId={currentEnvironment?.id}
              onSelect={handleServiceSelection}
            />
          )}
        </Pane>
        <Pane
          width='33%'
          paddingLeft={majorScale(4)}
        >
          <ServiceDetailsPanel
            deployment={currentDeployment}
            service={currentService}
            environmentId={currentEnvironment?.id ?? null}
          />
        </Pane>
      </Split>
    </SceneLayout>
  )
}

const ServiceDetailsPanel = ({
  service,
  environmentId,
  deployment
}: {
  service: t.Service | null
  environmentId: string | null
  deployment: t.Deployment | null
}) => {

  const instance = (!!service && !!environmentId)
    ? service.instances.find(i => i.environmentId === environmentId)
    : null

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
    const version = instance?.attributes.version
    return version ? `v${version}` : ''
  }

  return (
    <Pane
      backgroundColor={theme.colors.grey100}
      padding={majorScale(2)}
      borderRadius={4}
      minHeight='60vh'
    >
      {!instance && (
        <Pane>
          No service selected
        </Pane>
      )}
      {service && instance && (
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
              <Text>{instance?.attributes?.baseUrl ?? 'none'}</Text>
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
        </Pane>
      )}
    </Pane>
  )
}


const capitalize = (str: string | null) => {
  if (!str) return ''
  return `${str[0].toUpperCase()}${str.slice(1)}`
}
