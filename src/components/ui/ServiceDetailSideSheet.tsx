/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import {
  currentPlatformState,
  idTokenState,
  updateServiceAction,
  removeServiceAction
} from '../../state/app'
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
  Strong,
  Text,
  Tab,
  Button,
  Badge,
  Dialog,
  TextInput,
  Card,
  majorScale,
  IconButton,
  Spinner,
  toaster
} from 'evergreen-ui'
import { Split, Center } from '../layout'
import { BiCopy } from 'react-icons/bi'
import { IoIosRocket } from 'react-icons/io'
import {
  HiOutlineCog,
  HiX,
  HiRefresh,
  HiOutlineTrash,
  HiOutlineExclamation
} from 'react-icons/hi'
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
import theme from '../../styles'
import { useNavigate } from 'react-router-dom'


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

  const idToken = useRecoilValue(idTokenState)
  const platform = useRecoilValue(currentPlatformState)

  const [tab, setTab] = useState<TabName>('deployments')
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
  const [showDestroyDialog, setShowDestroyDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const updateServiceState = useSetRecoilState(updateServiceAction)
  const removeServiceState = useSetRecoilState(removeServiceAction)
  const destroyServiceRequest = useFetch(api.services.destroy)
  const removeServiceRequest = useFetch(api.services.remove)

  const destroy = async () => {
    const { error, data } = await destroyServiceRequest.fetch({
      serviceId: service.id
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    updateServiceState({
      ...service,
      latestDeployment: data.deployment,
      latestDeploymentId: data.deployment.id,
      deployments: [...service.deployments, data.deployment]
    })
    setShowDestroyDialog(false)
  }
  const remove = async () => {
    const { error } = await removeServiceRequest.fetch({
      serviceId: service.id
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    removeServiceState(service)
    setShowRemoveDialog(false)
  }
  const url = (() => {
    const u = service.activeDeployment?.attributes?.url
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
            <Paragraph flex={1} size={400} color="muted">
              A {service.language} {service.type} on {service.provider} {service.service}
            </Paragraph>
            {service.latestDeployment?.attributes?.version && (
              <Text>v{service.latestDeployment?.attributes.version}</Text>
            )}
          </Split>
          <Split alignItems='center'>
            <Pane flex={1}>
              {service.tags.map(tag => (
                <Badge marginRight={majorScale(1)} key={tag}>{tag}</Badge>
              ))}
            </Pane>
          </Split>
          <Split alignItems='center'>
            <Pane flex={1}>
              {url && (
                <>
                  <Link target='_blank' href={url}>{url}</Link>
                  <IconButton
                    marginLeft={majorScale(1)}
                    onClick={copyUrlToClipboard}
                    appearance='minimal'
                    icon={<BiCopy size={12} />}
                  />
                </>
              )}
            </Pane>
            {service.hasDeployedInfrastructure && (
              <IconButton
                onClick={() => setShowDestroyDialog(true)}
                appearance='minimal'
                intent='danger'
                icon={<HiOutlineTrash />}
              />
            )}
            {!service.hasDeployedInfrastructure && (
              <IconButton
                onClick={() => setShowRemoveDialog(true)}
                appearance='minimal'
                intent='danger'
                icon={<HiOutlineTrash />}
              />
            )}
          </Split>
        </Pane>
        <Pane display="flex" padding={8}>
          <Tablist>
            <Tab
              isSelected={tab === 'deployments'}
              onSelect={() => onTabChange?.('deployments')}
            >
              Deployments
            </Tab>
            {['api'].includes(service.type) && (
              <Tab
                isSelected={tab === 'functions'}
                onSelect={() => onTabChange?.('functions')}
              >
                Functions
              </Tab>
            )}
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
      <Dialog
        isShown={showDestroyDialog}
        hasHeader={false}
        hasFooter={false}
      >
        <DeleteConfirmForm
          action='destroy'
          name={`the ${service.name} service`}
          loading={destroyServiceRequest.loading}
          info={`
            This action will create a delete deployment which will tear down your service. 
            Once that deployment has successfully completed you can delete the service 
            from the platform.
          `}
          requiredValue={_.dashCase(service.name)}
          onCancel={() => setShowDestroyDialog(false)}
          onConfirm={destroy}
        />
      </Dialog>
      <Dialog
        isShown={showRemoveDialog}
        hasHeader={false}
        hasFooter={false}
      >
        <DeleteConfirmForm
          action='delete'
          name={`the ${service.name} service`}
          loading={removeServiceRequest.loading}
          info={`
            This services has no deployed infrastructure. You can now delete it. 
            This action will delete the service from the current platform.
          `}
          requiredValue={_.dashCase(service.name)}
          onCancel={() => setShowRemoveDialog(false)}
          onConfirm={remove}
        />
      </Dialog>
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
  const updateService = useSetRecoilState(updateServiceAction)
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
      <Split marginBottom={majorScale(2)} alignItems='center'>
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

  const hasBeenDeployed = !!service.activeDeployment
  const functions = service.activeDeployment?.attributes?.functions ?? []
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

  const navigate = useNavigate()
  const idToken = useRecoilValue(idTokenState) as string
  const updateService = useSetRecoilState(updateServiceAction)
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
    const latest = _.boil(data.deployments ?? [], (a, b) => {
      return a.startedAt > b.startedAt ? a : b
    })
    updateService({
      ...service,
      latestDeployment: latest,
      latestDeploymentId: latest?.id,
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
      latestDeployment: data.deployment,
      latestDeploymentId: data.deployment.id,
      deployments: [...service.deployments, data.deployment]
    })
  }

  const gotoDeployment = (deploymentId: string) => () => {
    navigate(`/deployments/${deploymentId}`)
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
          disabled={listDeploymentsRequest.loading}
        />
        <Button
          appearance='primary'
          onClick={deploy}
          iconBefore={<IoIosRocket />}
          disabled={deployServiceRequest.loading}
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
              onViewLogs={gotoDeployment(deployment.id)}
            />
          </Pane>
        </Card>
      ))}
    </Pane>
  )
}

const DeploymentCard = ({
  deployment,
  service,
  onViewLogs
}: {
  deployment: t.Deployment
  service: t.Service
  onViewLogs?: () => void
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
        <Pane flex={1} alignItems='center'>
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
          onClick={onViewLogs}
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
  const updateService = useSetRecoilState(updateServiceAction)
  const updateServiceRequest = useFetch(api.services.updateConfig)

  const updateConfig = async () => {
    const { error } = await updateServiceRequest.fetch({
      serviceId: service.id,
      config
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    toaster.success('Service updated')
    updateService({
      ...service,
      config
    })
  }
  return (
    <Pane>
      <Split marginBottom={majorScale(2)} alignItems='center'>
        <Heading flex={1}>Configuration</Heading>
        <Button
          appearance='primary'
          onClick={updateConfig}
          isLoading={updateServiceRequest.loading}
          iconBefore={<HiOutlineCog />}
        >
          Update
        </Button>
      </Split>
      <StackConfigForm
        value={config}
        platformName={platform.name}
        serviceName={service.name}
        stack={config.type}
        onStackConfigChange={({ config: newStackConfig }) => {
          setConfig({ ...config, stack: newStackConfig })
        }}
        onEnvVarChange={(newEnvVars) => {
          setConfig({ ...config, environmentVariables: newEnvVars })
        }}
      />
    </Pane>
  )
}


const DeleteConfirmForm = ({
  action = 'delete',
  name,
  requiredValue,
  info,
  loading = false,
  onCancel,
  onConfirm
}: {
  action?: 'delete' | 'destroy'
  name: string
  requiredValue: string
  info?: string
  loading?: boolean
  onCancel?: () => void
  onConfirm?: () => void
}) => {
  const [state, setState] = useState('')
  const valid = state === requiredValue
  return (
    <Pane padding={majorScale(3)}>
      <Center>
        <HiOutlineExclamation
          size={50}
          color={theme.colors.danger}
        />
      </Center>
      <Heading textAlign='center' size={600}>
        {action === 'delete' ? 'Delete' : 'Destroy'} {name}
      </Heading>
      <Paragraph textAlign='center' maxWidth={400} marginBottom={majorScale(3)}>
        {info} Type <Strong><i>{requiredValue}</i></Strong> to confirm and delete.
      </Paragraph>
      <Center>
        <TextInput
          placeholder={requiredValue}
          value={state}
          onChange={(e: any) => setState(e.target.value)}
        />
      </Center>
      <Split marginTop={majorScale(3)} justifyContent='space-between'>
        <Button
          onClick={onCancel}
          appearance='minimal'
        >cancel</Button>
        <Button
          onClick={onConfirm}
          appearance='primary'
          intent='danger'
          isLoading={loading}
          disabled={!valid}
        >
          {action}
        </Button>
      </Split>
    </Pane>
  )
}