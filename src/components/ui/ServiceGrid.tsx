import * as t from '../../types'
import Recoil from 'recoil'
import Skeleton from 'react-loading-skeleton'
import { Split, Center } from '../layout'
import { PROVIDER_LOGOS, CLOUD_SERVICE_LOGOS } from '../../const'
import { HiCog, HiOutlineDotsVertical, HiOutlineEye, HiUpload } from 'react-icons/hi'
import { idTokenState } from '../../state/app'
import { useFetch } from '../../hooks'
import * as api from '../../api'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import { Blink } from '../ui'
import theme from '../../styles'
import {
  majorScale,
  Pane,
  Text,
  Heading,
  Button,
  IconButton,
  Badge,
  Strong,
  StatusIndicator
} from 'evergreen-ui'


export default function ServiceGrid({
  loading = false,
  environmentId,
  deployments = [],
  services,
  onSelect
}: {
  loading?: boolean
  environmentId?: string | null
  deployments?: t.Deployment[]
  services: t.Service[]
  onSelect?: (serviceId: string) => void
}) {
  const instancesInEnvironment = services.reduce((acc, service) => {
    const instance = service.instances.find(i => i.environmentId === environmentId)
    return instance ? [...acc, { instance, service }] : acc
  }, [] as { instance: t.ServiceInstance, service: t.Service }[])
  console.log({ deployments })
  console.log({ services })
  console.log({ instancesInEnvironment })
  return (
    <Pane
      flex={1}
      display='grid'
      gridTemplateColumns={`repeat(2, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
    >
      {!loading && instancesInEnvironment.map(instance => (
        <ServiceGridItem
          key={instance.instance.id}
          service={instance.service}
          instance={instance.instance}
          deployment={deployments.find(d => d.instanceId === instance.instance.id)}
          onSelect={() => onSelect?.(instance.service.id)}
        />
      ))}
      {loading && [0, 1, 2, 3, 4].map((i) => (
        <Pane key={i}>
          <Pane marginBottom={8}>
            <Skeleton
              width='100%'
              height={170}
            />
          </Pane>
          <Pane marginBottom={8}>
            <Skeleton
              width='40%'
              height={24}
            />
          </Pane>
          <Pane>
            <Skeleton
              width='67%'
              height={24}
            />
          </Pane>
        </Pane>
      ))}
    </Pane>
  )
}

const ServiceGridItem = ({
  service,
  instance,
  deployment,
  onSelect
}: {
  service: t.Service
  instance: t.ServiceInstance
  deployment?: t.Deployment
  onSelect?: () => void
}) => {

  console.log({ service, instance, deployment })

  const idToken = Recoil.useRecoilValue(idTokenState)
  const deployRequest = useFetch(api.deployService)

  const hasBeenDeployed = !!instance?.latestDeploymentId

  const deploy = async () => {
    deployRequest.fetch({
      idToken: idToken!,
      serviceId: service.id,
      environmentId: instance.environmentId!
    })
  }

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
      borderRadius={4}
      padding={majorScale(2)}
    >
      <Split
        paddingBottom={majorScale(3)}
      >
        <Pane flex={1} marginRight={majorScale(2)}>
          <Heading size={700}>{service.name}</Heading>
          <Pane>
            <Badge marginRight={majorScale(1)}>{service.type}</Badge>
            <Badge marginRight={majorScale(1)}>{service.provider}</Badge>
            <Badge>{service.service}</Badge>
          </Pane>
        </Pane>
        <IconButton
          icon={<HiOutlineEye />}
          onClick={onSelect}
          appearance='minimal'
        />
      </Split>
      {!hasBeenDeployed && (
        <Split>
          <Button
            flex={1}
            appearance='minimal'
            iconBefore={<HiUpload size={20} />}
            onClick={deploy}
          >
            Deploy
          </Button>
        </Split>
      )}
      {hasBeenDeployed && (
        <>
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
        </>
      )}
    </Pane>
  )
}

const capitalize = (str: string | null) => {
  if (!str) return ''
  return `${str[0].toUpperCase()}${str.slice(1)}`
}
