/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { currentPlatformState, idTokenState, updateServiceState } from '../../state/app'
import _ from 'radash'
import * as t from '../../types'
import {
  Alert,
  SideSheet,
  Pane,
  Heading,
  Paragraph,
  Tablist,
  Link,
  Text,
  Tab,
  Button,
  Badge,
  Card,
  majorScale,
  IconButton,
  Spinner,
  toaster
} from 'evergreen-ui'
import { STACK_CONFIGS } from '../../stacks'
import { Split } from '../layout'
import { BiCopy } from 'react-icons/bi'
import { IoIosRocket } from 'react-icons/io'
import { HiOutlineCog, HiX, HiRefresh } from 'react-icons/hi'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import formatDistance from 'date-fns/formatDistance'
import api from '../../api'
import { useFetch } from '../../hooks'
import {
  DeploymentStatusBadge,
  CloseablePane,
  SelectList,
  StackConfigForm,
  GitHubSourceSearch,
  Shimmer
} from '../ui'


type TabName = 'deployments'
  | 'configuration'
  | 'source'
  | 'functions'

export default function ServiceDetailSideSheet({
  isShown = false,
  service,
  onClose
}: {
  service: t.Service | null
  isShown?: boolean
  onClose?: () => void
}) {

  console.log('service: ', service)

  const idToken = useRecoilValue(idTokenState)
  const platform = useRecoilValue(currentPlatformState)

  const [tab, setTab] = useState<TabName>('functions')
  return (
    <SideSheet
      isShown={isShown}
      onCloseComplete={onClose}
      containerProps={{
        display: 'flex',
        flex: '1',
        flexDirection: 'column'
      }}
    >
      {service ? (
        <SideSheetBody
          tab={tab}
          service={service}
          idToken={idToken!}
          platform={platform!}
          onTabChange={setTab}
        />
      ) : (
        <></>
      )}
    </SideSheet>
  )
}

const SideSheetBody = ({
  tab,
  service,
  platform,
  idToken,
  onTabChange
}: {
  tab: TabName
  service: t.Service
  platform: t.Platform
  idToken: string
  onTabChange?: (tab: TabName) => void
}) => {
  const url = (() => {
    const u = service.latestDeployment?.attributes?.url
    if (!u) return null
    if (u.startsWith('http')) return u
    return `https://${u}`
  })()
  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(url ?? '')
    toaster.success('Copied to clipboard', {
      duration: 2
    })
  }
  return (
    <Pane>
      <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
        <Pane padding={16} borderBottom="muted">
          <Split alignItems='center'>
            <Heading flex={1} size={600}>{service.name}</Heading>
            <DeploymentStatusBadge deployment={service.latestDeployment} />
          </Split>
          <Split alignItems='center'>
            <Pane flex={1}>
              <Paragraph flex={1} size={400} color="muted">
                A {service.language} {service.type} on {service.provider} {service.service}
              </Paragraph>
              {service.tags && (
                <Pane>
                  {service.tags.map(tag => (
                    <Badge marginRight={majorScale(1)}>{tag}</Badge>
                  ))}
                </Pane>
              )}
            </Pane>
            {service.latestDeployment?.attributes?.version && (
              <Text>v{service.latestDeployment?.attributes.version}</Text>
            )}
          </Split>
          {url && (
            <Split alignItems='center'>
              <Link target='_blank' href={url}>{url}</Link>
              <IconButton
                marginLeft={majorScale(1)}
                onClick={copyUrlToClipboard}
                appearance='minimal'
                icon={<BiCopy size={12} />}
              />
            </Split>
          )}
        </Pane>
        <Pane display="flex" padding={8}>
          <Tablist>
            <Tab
              isSelected={tab === 'functions'}
              onSelect={() => onTabChange?.('functions')}
            >
              Functions
            </Tab>
            <Tab
              isSelected={tab === 'deployments'}
              onSelect={() => onTabChange?.('deployments')}
            >
              Deployments
            </Tab>
            <Tab
              isSelected={tab === 'configuration'}
              onSelect={() => onTabChange?.('configuration')}
            >
              Configuration
            </Tab>
            <Tab
              isSelected={tab === 'source'}
              onSelect={() => onTabChange?.('source')}
            >
              Source
            </Tab>
          </Tablist>
        </Pane>
      </Pane>
      <Pane flex="1" overflowY="scroll" background="tint1" padding={16}>
        {tab === 'deployments' && (
          <DeploymentsCard
            service={service}
          />
        )}
        {tab === 'functions' && (
          <FunctionsCard
            service={service}
          />
        )}
        {tab === 'configuration' && (
          <ConfigurationCard
            service={service}
            platform={platform}
          />
        )}
        {tab === 'source' && (
          <SourceCard
            service={service}
            platform={platform}
          />
        )}
      </Pane>
    </Pane>
  )
}

const SourceCard = ({
  service,
  platform
}: {
  platform: t.Platform
  service: t.Service
}) => {
  const source = service.source
  const [state, setState] = useState<'review' | 'edit'>('review')
  const idToken = useRecoilValue(idTokenState) as string
  const updateService = useSetRecoilState(updateServiceState)
  const updateServiceRequest = useFetch(api.services.update)

  const updateSource = async (newSource: t.ServiceSource) => {
    const { error } = await updateServiceRequest.fetch({
      id: service.id,
      source: newSource
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    setState('review')
    updateService({
      ...service,
      source: newSource
    })
  }

  return (
    <Pane>
      <Split marginBottom={majorScale(2)}>
        <Heading flex={1}>Source</Heading>
        {state === 'review' && (
          <Button
            appearance='primary'
            onClick={() => setState('edit')}
            iconBefore={<HiOutlineCog />}
          >
            Change
          </Button>
        )}
        {state === 'edit' && (
          <Button
            appearance='primary'
            intent='danger'
            onClick={() => setState('review')}
            iconBefore={<HiX />}
          >
            Cancel
          </Button>
        )}
      </Split>
      {state === 'review' && (
        <SelectList
          items={[{
            id: 'selected',
            label: `${source.owner}/${source.repo}`,
            subtitle: source.branch,
            link: `https://github.com/${source.owner}/${source.repo}`,
            selectable: false
          }]}
        />
      )}
      {state === 'edit' && (
        <GitHubSourceSearch
          platform={platform}
          idToken={idToken}
          onSubmit={updateSource}
        />
      )}
      {state === 'edit' && updateServiceRequest.loading && (
        <Spinner />
      )}
    </Pane>
  )
}

const FunctionsCard = ({
  service
}: {
  service: t.Service
}) => {

  const hasBeenDeployed = !!service.latestDeploymentId
  const functions = service.latestDeployment?.attributes?.functions ?? []
  const modules = _.unique(functions.map(f => f.module))
  const capitalize = (str: string | null) => {
    if (!str) return ''
    return `${str[0].toUpperCase()}${str.slice(1)}`
  }

  return (
    <Pane>
      <Split marginBottom={majorScale(2)}>
        <Heading flex={1}>Functions</Heading>
      </Split>
      {!hasBeenDeployed && (
        <Alert
          intent="none"
          title="No deployments"
          marginBottom={32}
        >
          This service has not been deployed yet.
        </Alert>
      )}
      {hasBeenDeployed && modules.map(mod => (
        <Card
          key={mod}
          backgroundColor="white"
          elevation={0}
          marginBottom={majorScale(2)}
        >
          <Pane
            padding={majorScale(2)}
          >
            <Heading size={600}>{capitalize(mod)}</Heading>
            {functions.filter(f => f.module === mod).map(func => (
              <CloseablePane
                key={func.function ?? ''}
                label={capitalize(func.function)}
              >
                <Alert
                  intent="warning"
                  title="Function details coming soon"
                  marginBottom={32}
                >
                  Argument and response types, quick links, and a test form to execute requests.
                </Alert>
              </CloseablePane>
            ))}
          </Pane>
        </Card>
      ))}
    </Pane>
  )
}

const DeploymentsCard = ({
  service
}: {
  service: t.Service
}) => {

  const idToken = useRecoilValue(idTokenState) as string
  const updateService = useSetRecoilState(updateServiceState)
  const deployServiceRequest = useFetch(api.services.deploy)
  const listDeploymentsRequest = useFetch(api.deployments.listForService)

  useEffect(() => {
    if (!service) return
    listDeployments()
  }, [service?.id])

  const listDeployments = async () => {
    const { error, data } = await listDeploymentsRequest.fetch({
      serviceId: service?.id!
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    updateService({
      ...service!,
      deployments: data.deployments
    })
  }

  const deploy = async () => {
    const { error, data } = await deployServiceRequest.fetch({
      serviceId: service.id
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    updateService({
      ...service,
      deployments: [...service.deployments, data.deployment]
    })
  }

  const deployments = _.sort(service.deployments ?? [], d => d.startedAt ?? 0, true)
  const hasBeenDeployed = !!service.latestDeploymentId
  return (
    <Pane>
      <Split marginBottom={majorScale(2)} alignItems='center'>
        <Heading flex={1}>Deployments</Heading>
        <IconButton
          marginRight={majorScale(1)}
          appearance='minimal'
          onClick={listDeployments}
          icon={<HiRefresh />}
          isLoading={listDeploymentsRequest.loading}
        />
        <Button
          appearance='primary'
          onClick={deploy}
          iconBefore={<IoIosRocket />}
          isLoading={deployServiceRequest.loading}
        >
          Deploy
        </Button>
      </Split>
      {!hasBeenDeployed && (
        <Alert
          intent="none"
          title="No deployments"
          marginBottom={32}
        >
          This service has not been deployed yet.
        </Alert>
      )}
      {listDeploymentsRequest.loading && (
        <>
          <Shimmer
            backgroundColor="white"
            elevation={0}
            marginBottom={majorScale(2)}
            height={80}
          />
          <Shimmer
            backgroundColor="white"
            elevation={0}
            marginBottom={majorScale(2)}
            height={80}
          />
          <Shimmer
            backgroundColor="white"
            elevation={0}
            height={80}
          />
        </>
      )}
      {!listDeploymentsRequest.loading && deployments.map(deployment => (
        <Card
          key={deployment.id}
          backgroundColor="white"
          elevation={0}
          marginBottom={majorScale(2)}
        >
          <Pane
            padding={majorScale(2)}
          >
            <DeploymentCard
              deployment={deployment}
              service={service}
            />
          </Pane>
        </Card>
      ))}
    </Pane>
  )
}

const DeploymentCard = ({
  deployment,
  service
}: {
  deployment: t.Deployment
  service: t.Service
}) => {
  const deployStarted = formatDistanceToNowStrict(
    new Date(deployment.startedAt),
    { addSuffix: true }
  )
  const deployDuration = formatDistance(
    new Date(deployment.startedAt),
    deployment.finishedAt ? new Date(deployment.finishedAt) : new Date(),
    { addSuffix: false }
  )
  const triggeredBy = (() => {
    const { type: triggerType, user, source } = deployment.trigger ?? {}
    if (triggerType === 'source') {
      return `push:${source?.owner}/${source?.repo}/${source?.branch}`
    }
    if (triggerType === 'user') {
      return `user:${user?.username}`
    }
    return ''
  })()
  return (
    <>
      <Split alignItems='center'>
        <Pane flex={1}>
          <Heading size={500}>Started {deployStarted}</Heading>
          <Text>({deployDuration})</Text>
        </Pane>
        <DeploymentStatusBadge deployment={deployment} />
      </Split>
      <Split alignItems='center'>
        <Pane flex={1}>
          <Text>triggered by </Text>
          <Badge>{triggeredBy}</Badge>
        </Pane>
        <Button
          appearance='minimal'
        >
          View Logs
        </Button>
      </Split>
    </>
  )
}

const ConfigurationCard = ({
  service,
  platform
}: {
  service: t.Service
  platform: t.Platform
}) => {
  const [config, setConfig] = useState(service.config)
  const idToken = useRecoilValue(idTokenState) as string
  const updateService = useSetRecoilState(updateServiceState)
  const updateServiceRequest = useFetch(api.services.update)

  const updateConfig = async () => {
    const { error } = await updateServiceRequest.fetch({
      id: service.id,
      config
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    updateService({
      ...service,
      config
    })
  }
  return (
    <Pane>
      <Split marginBottom={majorScale(2)}>
        <Heading flex={1}>Configuration</Heading>
        <Button
          appearance='primary'
          onClick={updateConfig}
          iconBefore={<HiOutlineCog />}
        >
          Update
        </Button>
      </Split>
      <StackConfigForm
        value={config}
        platform={platform}
        serviceName={service.name}
        stackConfig={STACK_CONFIGS[config.type]}
        onChange={setConfig}
      />
    </Pane>
  )
}
