/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useEffect, useState } from 'react'
import * as t from '../../types'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Split, Center } from '../layout'
import styled from 'styled-components'
import GitUrlParse from 'git-url-parse'
import {
  Pane,
  Heading,
  Button,
  IconButton,
  TextInputField,
  Text,
  toaster,
  Strong,
  majorScale,
  Link,
  Paragraph,
  SearchInput
} from 'evergreen-ui'
import { Octokit } from '@octokit/core'
import { currentPlatformState, idTokenState } from '../../state/app'
import { useFetch, useFormation, usePollingFetch } from '../../hooks'
import { HiRefresh, HiOutlineCog } from 'react-icons/hi'
import api from '../../api'
import * as yup from 'yup'
import { SceneLayout, SelectList } from '../ui'
import theme from '../../styles'
import { STACK_CONFIGS } from '../../stacks'


type Step = 'language'
  | 'service-type'
  | 'cloud-provider'
  | 'provider-service'
  | 'name'
  | 'config'
  | 'source'

type State = {
  language: t.Language | null
  service: t.CloudService | null
  provider: t.CloudProvider | null
  type: t.ExobaseService | null
  step: Step
  config: any
  source: null | t.ServiceSource
}

export default function CreateServiceScene() {

  const navigate = useNavigate()
  const idToken = Recoil.useRecoilValue(idTokenState)
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)
  const createService = useFetch(api.services.create)
  const [state, setState] = useState<State>({
    step: 'language',
    language: null,
    service: null,
    provider: null,
    type: null,
    config: null,
    source: null
  })

  const serviceKey = `${state.type}:${state.provider}:${state.service}` as t.ExobaseServiceKey
  const stackConfig = STACK_CONFIGS[serviceKey]

  const title = (() => {
    if (state.step === 'language') return 'What language is your service written in?'
    if (state.step === 'cloud-provider') return 'Where should we deploy it?'
    if (state.step === 'config') return 'A Few Details'
    if (state.step === 'name') return 'What do you call it?'
    if (state.step === 'source') return 'Where is the source code?'
    if (state.step === 'service-type') return 'What do you want to make?'
    if (state.step === 'provider-service') return 'What service do you want to run on?'
  })()

  // const subtitle = (() => {
  //   if (step === 'cloud-provider') return 'Where should we deploy it?'
  //   if (step === 'config') return 'A Few Details'
  //   if (step === 'service-type') return 'What do you want to make?'
  // })()

  const handleLanguage = (l: t.Language) => {
    setState({ ...state, language: l, step: 'service-type' })
  }

  const handleServiceType = (st: t.ExobaseService) => {
    setState({ ...state, type: st, step: 'cloud-provider' })
  }

  const handleCloudProvider = (cp: t.CloudProvider) => {
    setState({ ...state, provider: cp, step: 'provider-service' })
  }

  const handleCloudService = (cs: t.CloudService) => {
    setState({ ...state, service: cs, step: 'source' })
  }

  const handleSource = (source: t.ServiceSource) => {
    const stackC = STACK_CONFIGS[serviceKey]
    if (!stackC) {
      setState({ ...state, source, step: 'name' })
    } else {
      setState({ ...state, source, step: 'config' })
    }
  }

  const handleConfig = (c: any) => {
    setState({ ...state, config: c, step: 'name' })
  }

  const submit = async (name: string) => {

    if (!currentPlatform) return

    const { error } = await createService.fetch({
      name,
      source: state.source!,
      service: state.service!,
      language: state.language!,
      type: state.type!,
      provider: state.provider!,
      config: {
        type: serviceKey,
        ...state.config
      }
    }, { token: idToken! })

    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }

    navigate('/services')
  }

  const cancel = () => {
    navigate('/services')
  }

  const setStep = (step: Step) => () => {
    setState({ ...state, step })
  }

  return (
    <SceneLayout>
      <Pane
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='center'
      >
        <Pane
          maxWidth='500px'
          flex={1}
        >
          <Pane width='100%'>
            <Heading flex={1} size={800}>{title}</Heading>
            <Paragraph>
              Create a new service in the <Strong>{currentPlatform?.name}</Strong> platform.
            </Paragraph>
          </Pane>
          {state.step === 'language' && (
            <LanguageForm
              onSelect={handleLanguage}
              onBack={cancel}
            />
          )}
          {state.step === 'service-type' && (
            <ServiceTypeForm
              onSelect={handleServiceType}
              onBack={setStep('language')}
            />
          )}
          {state.step === 'cloud-provider' && (
            <CloudProviderForm
              onSelect={handleCloudProvider}
              onBack={setStep('service-type')}
            />
          )}
          {state.step === 'provider-service' && (
            <CloudServiceForm
              serviceType={state.type!}
              provider={state.provider!}
              onSelect={handleCloudService}
              onBack={setStep('cloud-provider')}
            />
          )}
          {state.step === 'source' && (
            <RepositorySourceForm
              idToken={idToken ?? ''}
              platform={currentPlatform!}
              onSubmit={handleSource}
              onBack={setStep('provider-service')}
            />
          )}
          {state.step === 'config' && (
            <StackConfigForm
              stackConfig={stackConfig}
              onBack={setStep('cloud-provider')}
              onSubmit={handleConfig}
            />
          )}
          {state.step === 'name' && (
            <ServiceNameForm
              onBack={setStep('cloud-provider')}
              onSubmit={submit}
            />
          )}
        </Pane>
      </Pane>
    </SceneLayout>
  )
}


function ServiceNameForm({
  onSubmit,
  onBack
}: {
  onSubmit: (name: string) => void
  onBack: () => void
}) {

  const form = useFormation({
    name: yup.string().required()
  }, {
    name: ''
  })

  const handleSubmit = (formData: { name: string }) => {
    onSubmit(formData.name)
  }

  return (
    <>
      <Pane width='100%' marginTop={majorScale(2)}>
        <TextInputField
          label="Name"
          placeholder="Auth"
          validationMessage={form.errors.name?.message}
          {...form.register('name')}
        />
      </Pane>
      <Split>
        <Button onClick={onBack}>
          Back
        </Button>
        <Pane flex={1} />
        <Button
          onClick={form.createHandler(handleSubmit)}
          appearance='primary'
        >
          Create
        </Button>
      </Split>
    </>
  )
}

function RepositorySourceForm({
  platform,
  idToken,
  onSubmit,
  onBack
}: {
  platform: t.Platform
  idToken: string
  onSubmit: (source: t.ServiceSource) => void
  onBack: () => void
}) {

  const [isGithubConnected, setIsGithubConnected] = useState(platform.hasConnectedGithubApp)
  const listConnectedRepositoriesRequest = useFetch(api.platforms.listAvailableRepositories)
  const listConnectedBranchesRequest = useFetch(api.platforms.listAvailableBranches)
  const [state, setState] = useState<Partial<t.ServiceSource>>({})
  const [loadingLink, setLoadingLink] = useState(false)
  const [step, setStep] = useState<'repo' | 'public-branch' | 'connected-branch'>('repo')
  const [repoMatch, setRepoMatch] = useState<null | {
    repoId: string
    owner: string
    repo: string
  }>(null)
  const [branches, setBranches] = useState<{ name: string }[]>([])
  const [repoFilter, setRepoFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [branchesLoading, setBranchesLoading] = useState(false)
  const platformPolling = usePollingFetch(api.platforms.getById, {
    waitMs: 800,
    active: false,
    args: { id: platform.id },
    auth: { token: idToken }
  })

  const connectedRepositories = listConnectedRepositoriesRequest.data?.repositories.filter(r => {
    return repoFilter.length > 0
      ? `${r.owner}/${r.repo}`.toLowerCase().includes(repoFilter)
      : true
  }) ?? []

  const branchFilterFunc = (b: { name: string }) => {
    return branchFilter.length > 0
      ? b.name.toLowerCase().includes(branchFilter)
      : true
  }

  const connectedBranches = listConnectedBranchesRequest.data?.branches.filter(branchFilterFunc) ?? []
  const linkedBranches = branches.filter(branchFilterFunc)

  useEffect(() => {
    if (platform.hasConnectedGithubApp) {
      listConnectedRepositoriesRequest.fetch({}, { token: idToken })
    }
  }, [])

  useEffect(() => {
    if (platform.hasConnectedGithubApp) return
    const hasConnectedGithubApp = platformPolling.data?.platform?.hasConnectedGithubApp
    if (hasConnectedGithubApp) {
      platformPolling.pause()
      listConnectedRepositoriesRequest.fetch({}, { token: idToken })
      setIsGithubConnected(true)
    }
  }, [platformPolling.data])

  const searchForRepository = async (owner: string, repo: string) => {
    setLoadingLink(true)
    const octokit = new Octokit()
    const [err, result] = await _.try(() => {
      return octokit.request('GET /repos/{owner}/{repo}', {
        owner, repo
      })
    })()
    setLoadingLink(false)
    if (err) {
      console.error(err)
      return null
    }
    return {
      repoId: `${result.data.id}`,
      owner,
      repo
    }
  }

  const listBranchesInPublicRepository = async (owner: string, repo: string) => {
    setBranchesLoading(true)
    const octokit = new Octokit()
    const [err, result] = await _.try(() => {
      return octokit.request('GET /repos/{owner}/{repo}/branches', {
        owner, repo
      })
    })()
    setBranchesLoading(false)
    if (err) {
      console.error(err)
      return null
    }
    return result.data.map(b => ({
      name: b.name
    }))
  }

  const handleLink = async (link: string) => {
    const { name: repo, owner } = GitUrlParse(link)
    const match = await searchForRepository(owner, repo)
    if (!match) {
      toaster.danger('Could not find a matching repository in GitHub')
    } else {
      setRepoMatch(match)
    }
  }

  const connectGithub = () => {
    platformPolling.poll()
    window.open('https://github.com/apps/exobase-bot/installations/new', '')?.focus()
  }

  const selectLinkedRepo = async () => {
    if (!repoMatch) return
    const { repoId, owner, repo } = repoMatch
    setStep('public-branch')
    setState({
      repoId, owner, repo, private: false, installationId: null
    })
    const foundBranches = await listBranchesInPublicRepository(owner, repo)
    if (foundBranches === null) {
      toaster.danger('Failed to get the branches for this repository. It may have none.')
      return
    }
    setBranches(foundBranches)
  }

  const handleBranchSelect = (branch: string) => {
    onSubmit({ ...state, branch, provider: 'github' } as t.ServiceSource)
  }

  const handleRepoSelect = (repo: {
    id: string
    repo: string
    owner: string
    installationId: string
  }) => {
    setState({
      repoId: repo.id,
      owner: repo.owner,
      repo: repo.repo,
      installationId: repo.installationId,
      private: true
    })
    listConnectedBranchesRequest.fetch({
      installationId: repo.installationId,
      owner: repo.owner,
      repo: repo.repo
    }, { token: idToken })
    setStep('connected-branch')
  }

  return (
    <Pane width='100%' marginTop={majorScale(2)}>
      {step === 'repo' && (
        <Pane>
          <TextInputField
            label="Open Source Link"
            placeholder="https://github.com/exobase-inc/exobase-api"
            onChange={(e: any) => handleLink(e.target.value)}
          />
          {(loadingLink || repoMatch) && (
            <SelectList
              loading={loadingLink}
              items={[{
                id: 'linked',
                label: repoMatch?.repo ?? '',
                subtitle: repoMatch?.owner ?? '',
                link: `https://github.com/${repoMatch?.owner}/${repoMatch?.repo}`
              }]}
              onSelect={() => selectLinkedRepo()}
            />
          )}
          <Center>
            <Text size={600} fontWeight='bold' marginBottom={majorScale(4)}>or</Text>
          </Center>
          {isGithubConnected && (
            <>
              {!listConnectedRepositoriesRequest.loading && (
                <Split
                  marginBottom={majorScale(2)}
                >
                  <SearchInput
                    placeholder="Filter repositories"
                    value={repoFilter}
                    width='100%'
                    onChange={(e: any) => setRepoFilter(e.target.value)}
                    marginRight={majorScale(2)}
                  />
                  <IconButton
                    icon={<HiRefresh />}
                    appearance='primary'
                    onClick={() => listConnectedRepositoriesRequest.fetch({}, { token: idToken })}
                    marginRight={majorScale(2)}
                  />
                  <IconButton
                    icon={<HiOutlineCog />}
                    appearance='default'
                    onClick={connectGithub}
                  />
                </Split>
              )}
              <SelectList
                maxHeight='50vh'
                loading={listConnectedRepositoriesRequest.loading}
                items={connectedRepositories.map((repo) => ({
                  id: repo.id,
                  label: repo.repo,
                  subtitle: repo.owner,
                  link: `https://github.com/${repo.owner}/${repo.repo}`
                })) ?? []}
                onSelect={(item) => handleRepoSelect(connectedRepositories.find(r => r.id === item.id)!)}
              />
            </>
          )}
          {!isGithubConnected && (
            <Pane>
              <Button onClick={connectGithub}>Connect GitHub</Button>
            </Pane>
          )}
        </Pane>
      )}
      {step.includes('-branch') && (
        <>
          <SelectList
            items={[{
              id: 'any',
              label: state.repo!,
              subtitle: state.owner!,
              link: `https://github.com/${state.owner}/${state.repo}`,
              selectLabel: 'change',
              selectAppearance: 'minimal'
            }]}
            onSelect={() => setStep('repo')}
          />
          <Center>
            <Text size={600} fontWeight='bold' marginBottom={majorScale(3)}>select branch</Text>
          </Center>
        </>
      )}

      {step === 'public-branch' && (
        <>
          <SearchInput
            placeholder="Filter branches"
            value={branchFilter}
            width='100%'
            onChange={(e: any) => setBranchFilter(e.target.value)}
            marginBottom={majorScale(2)}
          />
          <SelectList
            maxHeight='50vh'
            loading={branchesLoading}
            items={linkedBranches.map((branch) => ({
              id: branch.name,
              label: branch.name,
              link: `https://github.com/${state.owner}/${state.repo}/tree/${branch.name}`
            })) ?? []}
            onSelect={({ id }) => handleBranchSelect(id as string)}
          />
        </>
      )}
      {step === 'connected-branch' && (
        <>
          <SearchInput
            placeholder="Filter branches"
            value={branchFilter}
            width='100%'
            onChange={(e: any) => setBranchFilter(e.target.value)}
            marginBottom={majorScale(2)}
          />
          <SelectList
            maxHeight='50vh'
            loading={listConnectedBranchesRequest.loading}
            items={connectedBranches.map((branch) => ({
              id: branch.name,
              label: branch.name,
              link: `https://github.com/${state.owner}/${state.repo}/tree/${branch.name}`
            })) ?? []}
            onSelect={({ id }) => handleBranchSelect(id as string)}
          />
        </>
      )}
    </Pane>
  )
}


const GridChoicePane = styled(Center) <{ $comingSoon: boolean }>`
  transition: background-color 0.3s ease-out;
  > span {
    transition: color 0.3s ease-out;
    color: ${({ $comingSoon }) => $comingSoon ? theme.colors.grey300 : theme.colors.grey999};
    font-weight: 600;
  }
  ${({ $comingSoon }) => !$comingSoon && `
    &:hover {
      background-color: ${theme.colors.accent};
      cursor: pointer;
      > span {
        color: ${theme.colors.white};
      }
    }
  `}
`

const GridChoice = ({
  label,
  comingSoon = false,
  onClick
}: {
  label: string
  comingSoon?: boolean
  onClick?: () => void
}) => {
  return (
    <GridChoicePane
      padding={majorScale(2)}
      backgroundColor={theme.colors.grey100}
      onClick={onClick}
      borderRadius={4}
      position='relative'
      $comingSoon={comingSoon}
    >
      <Text
        textAlign='center'
      >
        {label}
      </Text>
      {comingSoon && (
        <Text
          position='absolute'
          bottom='4px'
          size={300}
        >
          coming soon
        </Text>
      )}
    </GridChoicePane>
  )
}


const CloudProviderForm = ({
  onSelect,
  onBack
}: {
  onSelect: (type: t.CloudProvider) => void
  onBack: () => void
}) => {
  const select = (type: t.CloudProvider) => () => onSelect(type)
  return (
    <>
      <Pane
        width='100%'
        display='grid'
        gridTemplateColumns={`repeat(3, 1fr)`}
        columnGap={majorScale(4)}
        rowGap={majorScale(4)}
        paddingTop={majorScale(4)}
        paddingBottom={majorScale(4)}
      >
        <GridChoice
          onClick={select('aws')}
          label='AWS'
        />
        <GridChoice
          onClick={select('gcp')}
          label='GCP'
          comingSoon
        />
        <GridChoice
          onClick={select('azure')}
          label='Azure'
          comingSoon
        />
        <GridChoice
          onClick={select('vercel')}
          label='Vercel'
          comingSoon
        />
      </Pane>
      <Split>
        <Button onClick={onBack}>
          Back
        </Button>
        <Pane flex={1} />
      </Split>
    </>
  )
}


const ServiceTypeForm = ({
  onSelect,
  onBack
}: {
  onSelect: (type: t.ExobaseService) => void
  onBack: () => void
}) => {
  const select = (type: t.ExobaseService) => () => onSelect(type)
  return (
    <>
      <Pane
        width='100%'
        display='grid'
        gridTemplateColumns={`repeat(3, 1fr)`}
        columnGap={majorScale(4)}
        rowGap={majorScale(4)}
        paddingTop={majorScale(4)}
        paddingBottom={majorScale(4)}
      >
        <GridChoice
          label='Static Website'
          comingSoon
        />
        <GridChoice
          onClick={select('api')}
          label='API'
        />
        <GridChoice
          label='Websocket Server'
          comingSoon
        />
        <GridChoice
          label='App'
          comingSoon
        />
      </Pane>
      <Split>
        <Button onClick={onBack}>
          Back
        </Button>
        <Pane flex={1} />
      </Split>
    </>
  )
}


const LanguageForm = ({
  onSelect,
  onBack
}: {
  onSelect: (language: t.Language) => void
  onBack: () => void
}) => {
  const select = (lang: t.Language) => () => onSelect(lang)
  return (
    <>
      <Pane
        width='100%'
        display='grid'
        gridTemplateColumns={`repeat(3, 1fr)`}
        columnGap={majorScale(4)}
        rowGap={majorScale(4)}
        paddingTop={majorScale(4)}
        paddingBottom={majorScale(4)}
      >
        <GridChoice
          label='Javascript'
          comingSoon
        />
        <GridChoice
          label='Typescript'
          onClick={select('typescript')}
        />
        <GridChoice
          label='Python'
          comingSoon
        />
        <GridChoice
          label='Swift'
          comingSoon
        />
      </Pane>
      <Split>
        <Button onClick={onBack}>
          Back
        </Button>
        <Pane flex={1} />
      </Split>
    </>
  )
}


const CloudServiceForm = ({
  serviceType,
  provider,
  onSelect,
  onBack
}: {
  serviceType: t.ExobaseService
  provider: t.CloudProvider
  onSelect: (service: t.CloudService) => void
  onBack: () => void
}) => {
  const select = (service: t.CloudService) => () => onSelect(service)
  const PROVIDER_SERVICE_TYPE = {
    aws: {
      api: [{
        key: 'lambda',
        label: 'Lambda'
      }, {
        key: 'ec2',
        label: 'EC2',
        comingSoon: true
      }, {
        key: 'ecs',
        label: 'ECS',
        comingSoon: true
      }],
      'websocket-server': [{
        key: 'lambda',
        label: 'Lambda'
      }, {
        key: 'ecs',
        label: 'ECS'
      }, {
        key: 'ec2',
        label: 'EC2'
      }]
    }
  } as any as Record<t.CloudProvider, Record<t.ExobaseService, { key: t.CloudService, label: string, comingSoon?: boolean }[]>>
  const options = PROVIDER_SERVICE_TYPE[provider][serviceType]
  return (
    <>
      <Pane
        width='100%'
        display='grid'
        gridTemplateColumns={`repeat(3, 1fr)`}
        columnGap={majorScale(4)}
        rowGap={majorScale(4)}
        paddingTop={majorScale(4)}
        paddingBottom={majorScale(4)}
      >
        {options.map(({ key, label, comingSoon = false }) => (
          <GridChoice
            key={key}
            label={label}
            comingSoon={comingSoon}
            onClick={select(key)}
          />
        ))}
      </Pane>
      <Split>
        <Button onClick={onBack}>
          Back
        </Button>
        <Pane flex={1} />
      </Split>
    </>
  )
}


const StackConfigForm = ({
  stackConfig,
  onSubmit,
  onBack
}: {
  stackConfig: t.StackConfig
  onSubmit: (config: any) => void
  onBack: () => void
}) => {

  const yupSchemaForInputType = (type: t.StackConfigInputType) => {
    if (type === 'function-route') {
      return yup.string().matches(/^\w+?\.\w+?$/, {
        excludeEmptyString: true,
        message: 'Requires {module}.{function} format'
      }).required('Field is required')
    }
    return yup.mixed()
  }

  const schema = stackConfig.inputs.reduce((acc, input) => ({
    ...acc, [input.key]: yupSchemaForInputType(input.type)
  }), {})

  const defaults = stackConfig.inputs.reduce((acc, input) => ({
    ...acc, [input.key]: input.init
  }), {})

  const form = useFormation(schema, defaults)

  const getConfigInputComponent = (type: t.StackConfigInputType) => {
    if (type === 'function-route') return TextInputField
    return TextInputField
  }

  const inputs = stackConfig.inputs.map(input => ({
    ...input,
    Component: getConfigInputComponent(input.type)
  }))

  return (
    <>
      <Pane width='100%' marginTop={majorScale(2)}>
        {inputs.map((input) => (
          <input.Component
            key={input.key}
            marginTop={majorScale(3)}
            label={input.label}
            hint={(
              <Link href={input.infoLink ?? '#'}>learn more</Link>
            )}
            description={input.description}
            placeholder={input.placeholder}
            validationMessage={(form.errors as any)[input.key]?.message}
            {...form.register(input.key as any as never)}
          />
        ))}
      </Pane>
      <Split>
        <Button onClick={onBack}>
          Back
        </Button>
        <Pane flex={1} />
        <Button
          onClick={form.createHandler(onSubmit)}
          appearance='primary'
        >
          Next
        </Button>
      </Split>
    </>
  )
}