/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  idTokenState,
  appState as appStateAtom,
  workspaceState
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
import { useNavigate, useParams } from 'react-router-dom'


type TabName = 'deployments'
  | 'configuration'
  | 'source'
  | 'functions'
  | 'pack'

export default function ServiceDetailSideSheet({
  platform,
  isShown = false,
  service,
  onClose
}: {
  platform: t.Platform
  service: t.Unit | null
  isShown?: boolean
  onClose?: () => void
}) {

  const idToken = useRecoilValue(idTokenState)

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
  service: t.Unit
  platform: t.Platform
  idToken: string
  onTabChange?: (tab: TabName) => void
}) => {
  const [showDestroyDialog, setShowDestroyDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [appState, setAppState] = useRecoilState(appStateAtom)
  const workspace = useRecoilValue(workspaceState)
  // const updateServiceState = useSetRecoilState(updateServiceAction)
  // const removeServiceState = useSetRecoilState(removeServiceAction)
  const destroyServiceRequest = useFetch(api.units.destroy)
  const removeServiceRequest = useFetch(api.units.remove)

  const destroy = async () => {
    const { error, data } = await destroyServiceRequest.fetch({
      workspaceId: platform.workspaceId,
      platformId: platform.id,
      unitId: service.id
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    setAppState({
      ...appState,
      workspace: {
        ...workspace!,
        platforms: _.replace(workspace!.platforms, {
          ...platform,
          units: _.replace(platform.units, {
            ...service,
            deployments: [...service.deployments, data.deployment]
          }, u =>  u.id === service.id)
        }, p => p.id === platform.id)
      }
    })
    setShowDestroyDialog(false)
  }
  const remove = async () => {
    const { error, data } = await removeServiceRequest.fetch({
      workspaceId: platform.workspaceId,
      platformId: platform.id,
      unitId: service.id
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    setAppState({
      ...appState,
      workspace: {
        ...workspace!,
        platforms: _.replace(workspace!.platforms, {
          ...platform,
          units: _.replace(platform.units, {
            ...service,
            deleted: true
          }, u =>  u.id === service.id)
        }, p => p.id === platform.id)
      }
    })
    setShowDestroyDialog(false)
  }
  const url = (() => {
    const u = service.activeDeployment?.output?.find ? service.activeDeployment?.output?.find(o => o.name === 'output')?.value as string : null
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
  const version = service.latestDeployment?.output?.find ? service.latestDeployment.output.find(o => o.name === 'version')?.value : null
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
              A {service.pack.language} {service.pack.type} on {service.pack.provider} {service.pack.service}
            </Paragraph>
            {version && (
              <Text>v{version}</Text>
            )}
          </Split>
          <Split alignItems='center'>
            <Pane flex={1}>
              {service.tags.map(tag => (
                <Badge marginRight={majorScale(1)} key={tag.name}>{tag.name}={tag.value}</Badge>
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
            <Tab
              isSelected={tab === 'pack'}
              onSelect={() => onTabChange?.('pack')}
            >
              Pack
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
          // <FunctionsCard
          //   service={service}
          // />
          <div>coming soon</div>
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
        {tab === 'pack' && (
          <PackCard
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

const PackCard = ({
  service,
  platform
}: {
  platform: t.Platform
  service: t.Unit
}) => {
  const idToken = useRecoilValue(idTokenState) as string
  const pack = service.pack.version
  const upgradePackRequest = useFetch(api.units.upgradePack)
  const upgradePack = async () => {
    const { error } = await upgradePackRequest.fetch({
      workspaceId: platform.workspaceId,
      platformId: platform.id,
      unitId: service.id
    }, { token: idToken! })
    if (error) {
      toaster.danger(error.details)
      return
    }
  }
  return (
    <Pane>
      <span>Version: {pack.version}</span>
      <Button onClick={upgradePack}>Upgrade</Button>
    </Pane>
  )
}

const SourceCard = ({
  service,
  platform
}: {
  platform: t.Platform
  service: t.Unit
}) => {
  const source = service.source
  const [state, setState] = useState<'review' | 'edit'>('review')
  const idToken = useRecoilValue(idTokenState) as string
  const workspace = useRecoilValue(workspaceState)
  const [appState, setAppState] = useRecoilState(appStateAtom)
  const updateServiceRequest = useFetch(api.units.update)

  const updateSource = async (newSource: t.ServiceSource) => {
    const { error } = await updateServiceRequest.fetch({
      workspaceId: platform.workspaceId,
      platformId: platform.id,
      unitId: service.id,
      source: newSource
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    setState('review')
    setAppState({
      ...appState,
      workspace: {
        ...workspace!,
        platforms: _.replace(workspace!.platforms, {
          ...platform,
          units: _.replace(platform.units, {
            ...service,
            source: newSource
          }, u =>  u.id === service.id)
        }, p => p.id === platform.id)
      }
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
            label: `${source?.owner}/${source?.repo}`,
            subtitle: source?.branch,
            link: `https://github.com/${source?.owner}/${source?.repo}`,
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

// const FunctionsCard = ({
//   service
// }: {
//   service: t.Unit
// }) => {

//   const hasBeenDeployed = !!service.activeDeployment
//   const functions = service.activeDeployment?.attributes?.functions ?? []
//   const modules = _.unique(functions.map(f => f.module))
//   const capitalize = (str: string | null) => {
//     if (!str) return ''
//     return `${str[0].toUpperCase()}${str.slice(1)}`
//   }

//   return (
//     <Pane>
//       <Split marginBottom={majorScale(2)}>
//         <Heading flex={1}>Functions</Heading>
//       </Split>
//       {!hasBeenDeployed && (
//         <Alert
//           intent="none"
//           title="No deployments"
//           marginBottom={32}
//         >
//           This service has not been deployed yet.
//         </Alert>
//       )}
//       {hasBeenDeployed && modules.map(mod => (
//         <Card
//           key={mod}
//           backgroundColor="white"
//           elevation={0}
//           marginBottom={majorScale(2)}
//         >
//           <Pane
//             padding={majorScale(2)}
//           >
//             <Heading size={600}>{capitalize(mod)}</Heading>
//             {functions.filter(f => f.module === mod).map(func => (
//               <CloseablePane
//                 key={func.function ?? ''}
//                 label={capitalize(func.function)}
//               >
//                 <Alert
//                   intent="warning"
//                   title="Function details coming soon"
//                   marginBottom={32}
//                 >
//                   Argument and response types, quick links, and a test form to execute requests.
//                 </Alert>
//               </CloseablePane>
//             ))}
//           </Pane>
//         </Card>
//       ))}
//     </Pane>
//   )
// }

const DeploymentsCard = ({
  service
}: {
  service: t.Unit
}) => {

  const navigate = useNavigate()
  const workspace = useRecoilValue(workspaceState)
  const [appState, setAppState] = useRecoilState(appStateAtom)
  const idToken = useRecoilValue(idTokenState) as string
  const deployServiceRequest = useFetch(api.units.deployFromUI)
  const findPlatformRequest = useFetch(api.platforms.find)
  const platform = workspace?.platforms.find(p => p.id === service.platformId) ?? null

  useEffect(() => {
    if (!service) return
    listDeployments()
  }, [service?.id])

  const listDeployments = async () => {
    if (!workspace) return
    const { error, data } = await findPlatformRequest.fetch({
      workspaceId: service.workspaceId,
      platformId: service.platformId
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    setAppState({
      ...appState,
      workspace: {
        ...workspace,
        platforms: _.replace(workspace.platforms ?? [], data.platform, p => p.id === service.platformId)
      }
    })
  }

  const deploy = async () => {
    if (!platform) return
    if (!workspace) return
    const { error, data } = await deployServiceRequest.fetch({
      workspaceId: service.workspaceId,
      platformId: service.platformId,
      unitId: service.id
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    
    setAppState({
      ...appState,
      workspace: {
        ...workspace!,
        platforms: _.replace(workspace!.platforms, {
          ...platform,
          units: _.replace(platform.units, {
            ...service,
            deployments: [...service.deployments, data.deployment]
          }, u =>  u.id === service.id)
        }, p => p.id === platform.id)
      }
    })
  }

  const gotoDeployment = (deploymentId: string) => () => {
    navigate(`/deployments/${deploymentId}`)
  }

  const deployments = _.sort(service.deployments ?? [], d => d.startedAt ?? 0, true)
  const hasBeenDeployed = !!service.latestDeployment
  return (
    <Pane>
      <Split marginBottom={majorScale(2)} alignItems='center'>
        <Heading flex={1}>Deployments</Heading>
        <IconButton
          marginRight={majorScale(1)}
          appearance='minimal'
          onClick={listDeployments}
          icon={<HiRefresh />}
          disabled={findPlatformRequest.loading}
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
      {findPlatformRequest.loading && (
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
      {!findPlatformRequest.loading && deployments.map(deployment => (
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
  service: t.Unit
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
    const { type: triggerType, user, git } = deployment.trigger ?? {}
    if (triggerType === 'github-push') {
      return `push:${git?.owner}/${git?.repo}/${git?.branch}`
    }
    if (triggerType === 'user-cli') {
      return `user:cli:${user?.username}`
    }
    if (triggerType === 'user-ui') {
      return `user:ui:${user?.username}`
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
  service: t.Unit
  platform: t.Platform
}) => {
  const [config, setConfig] = useState(service.config)
  const idToken = useRecoilValue(idTokenState) as string
  const workspace = useRecoilValue(workspaceState)
  const [appState, setAppState] = useRecoilState(appStateAtom)
  const updateServiceRequest = useFetch(api.units.update)

  const updateConfig = async () => {
    const { error, data } = await updateServiceRequest.fetch({
      workspaceId: service.workspaceId,
      platformId: service.platformId,
      unitId: service.id,
      config
    }, { token: idToken })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    toaster.success('Service updated')
    setAppState({
      ...appState,
      workspace: {
        ...workspace!,
        platforms: _.replace(workspace!.platforms, {
          ...platform,
          units: _.replace(platform.units, data.unit, u =>  u.id === service.id)
        }, p => p.id === platform.id)
      }
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
        pack={service.pack}
        config={config}
        platformName={platform.name}
        serviceName={service.name}
        onChange={setConfig}
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