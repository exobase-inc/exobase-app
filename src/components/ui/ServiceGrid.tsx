import * as t from '../../types'
import Shimmer from './Shimmer'
import { Split } from '../layout'
import { HiOutlineEye, HiUpload } from 'react-icons/hi'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import { DeploymentStatusBadge } from '../ui'
import theme from '../../styles'
import {
  majorScale,
  Pane,
  Card,
  Text,
  Heading,
  Button,
  IconButton,
  Badge
} from 'evergreen-ui'


export default function ServiceGrid({
  loading = false,
  services,
  onDeploy,
  onSelect
}: {
  loading?: boolean
  services: t.Unit[]
  onDeploy?: (service: t.Unit) => void
  onSelect?: (service: t.Unit) => void
}) {
  return (
    <Pane
      flex={1}
      display='grid'
      gridTemplateColumns={`repeat(2, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
    >
      {!loading && services.map(service => (
        <ServiceGridItem
          key={service.id}
          service={service}
          onSelect={() => onSelect?.(service)}
          onDeploy={() => onDeploy?.(service)}
        />
      ))}
      {loading && [0, 1, 2, 3, 4].map((i) => (
        <Pane key={i}>
          <Pane marginBottom={8}>
            <Shimmer
              width='100%'
              height={170}
            />
          </Pane>
          <Pane marginBottom={8}>
            <Shimmer
              width='40%'
              height={24}
            />
          </Pane>
          <Pane>
            <Shimmer
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
  onSelect,
  onDeploy
}: {
  service: t.Unit
  onSelect?: () => void
  onDeploy?: () => void
}) => {

  const { latestDeployment: deployment } = service
  const hasBeenDeployed = !!deployment

  const deployStarted = deployment
    ? formatDistanceToNowStrict(new Date(deployment.startedAt), { addSuffix: true })
    : null

  const getVersion = (): string => {
    const version = deployment?.output?.find ? deployment.output.find(o => o.name === 'version')?.value : null
    return version ? `v${version}` : ''
  }

  const url = deployment?.output.find ? deployment?.output.find(o => o.name === 'url')?.value ?? 'none' : null

  return (
    <Card
      backgroundColor={theme.colors.white}
      elevation={1}
      borderRadius={4}
      padding={majorScale(2)}
    >
      <Split
        paddingBottom={majorScale(3)}
      >
        <Pane flex={1} marginRight={majorScale(2)}>
          <Heading size={700}>{service.name}</Heading>
          <Pane>
            <Badge marginRight={majorScale(1)}>{service.pack.type}</Badge>
            <Badge marginRight={majorScale(1)}>{service.pack.provider}</Badge>
            <Badge>{service.pack.service}</Badge>
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
            onClick={onDeploy}
          >
            Deploy
          </Button>
        </Split>
      )}
      {hasBeenDeployed && (
        <>
          <Split marginBottom={majorScale(1)}>
            <Heading fontWeight='bold' size={400} flex={1} marginRight={majorScale(1)}>Link:</Heading>
            <Text>{url}</Text>
          </Split>
          <Split marginBottom={majorScale(1)}>
            <Heading fontWeight='bold' size={400} flex={1} marginRight={majorScale(1)}>Deployed:</Heading>
            <Text>{capitalize(deployStarted)}</Text>
          </Split>
          <Split>
            <Heading fontWeight='bold' size={400} flex={1} marginRight={majorScale(1)}>Status:</Heading>
            <DeploymentStatusBadge deployment={deployment} />
          </Split>
          <Text flex={1}>{getVersion()}</Text>
        </>
      )}
    </Card>
  )
}

const capitalize = (str: string | null) => {
  if (!str) return ''
  return `${str[0].toUpperCase()}${str.slice(1)}`
}
