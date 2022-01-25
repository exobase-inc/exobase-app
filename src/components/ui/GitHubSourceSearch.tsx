/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import * as t from '../../types'
import { Split, Center } from '../layout'
import GitUrlParse from 'git-url-parse'
import styled from 'styled-components'
import {
  Button,
  IconButton,
  TextInputField,
  Text,
  toaster,
  majorScale,
  SearchInput
} from 'evergreen-ui'
import { Octokit } from '@octokit/core'
import { useFetch, usePollingFetch, useAjax } from '../../hooks'
import { HiRefresh, HiOutlineCog } from 'react-icons/hi'
import { BsGithub } from 'react-icons/bs'
import api from '../../api'
import { SelectList } from '../ui'
import debounce from 'lodash.debounce'


export default function GitHubSourceSearch({
  platform,
  idToken,
  onSubmit
}: {
  platform: t.Platform
  idToken: string
  onSubmit?: (source: t.ServiceSource) => void
}) {

  const [step, setStep] = useState<'repo' | 'branch'>('repo')
  const [source, setSource] = useState<t.ServiceSource>({
    owner: '',
    repo: '',
    installationId: null,
    private: false,
    repoId: '',
    branch: '',
    provider: 'github'
  })

  const onPublicRepositorySelect = (repo: { id: string, owner: string, repo: string }) => {
    setSource({
      repoId: repo.id,
      owner: repo.owner,
      repo: repo.repo,
      installationId: null,
      private: false,
      branch: '',
      provider: 'github'
    })
    setStep('branch')
  }

  const onConnectedRepositorySelect = (repo: { id: string, repo: string, owner: string, installationId: string }) => {
    setSource({
      repoId: repo.id,
      owner: repo.owner,
      repo: repo.repo,
      installationId: repo.installationId,
      private: true,
      branch: '',
      provider: 'github'
    })
    setStep('branch')
  }

  const onBranchSelected = (branch: string) => {
    onSubmit?.({
      ...source,
      branch
    })
  }

  if (step === 'repo') {
    return (
      <>
        <PublicRepositoryLinkSelection
          onSelect={onPublicRepositorySelect}
        />
        <Center>
          <Text size={600} fontWeight='bold' marginBottom={majorScale(4)}>or</Text>
        </Center>
        <ConnectedRepositorySelection
          platform={platform}
          idToken={idToken}
          onSelect={onConnectedRepositorySelect}
        />
      </>
    )
  }

  if (step === 'branch') {
    return (
      <BranchListAndSelect
        owner={source.owner}
        repo={source.repo}
        idToken={idToken}
        installationId={source.installationId}
        onBack={() => setStep('repo')}
        onSelect={onBranchSelected}
      />
    )
  }

  return null
}

const PublicRepositoryLinkSelection = ({
  onSelect
}: {
  onSelect?: (repo: { id: string, owner: string, repo: string }) => void
}) => {

  const searchRequest = useAjax((arg: { owner: string, repo: string }) => {
    const octokit = new Octokit()
    return octokit.request('GET /repos/{owner}/{repo}', {
      owner: arg.owner,
      repo: arg.repo
    })
  })

  const handleLink = async ({ owner, repo }: { owner: string, repo: string }) => {
    const [err, res] = await searchRequest.fetch({ owner, repo })
    if (err) {
      toaster.danger('Error asking GitHub for repos.')
      console.error(err)
      return
    }
    if (!res.data) {
      toaster.danger('Could not find a matching repository in GitHub')
    }
  }

  const match = searchRequest.data?.data ? {
    id: `${searchRequest.data.data.id}`,
    owner: searchRequest.data.data.owner.login,
    repo: searchRequest.data.data.name
  } : null

  const selectMatchedRepo = () => {
    if (!match) return
    onSelect?.(match)
  }

  return (
    <>
      <GitHubSourceInput
        onChange={handleLink}
      />
      {(match || searchRequest.loading) && (
        <SelectList
          loading={searchRequest.loading}
          items={[{
            id: 'linked',
            label: match?.repo ?? '',
            subtitle: match?.owner ?? '',
            link: `https://github.com/${match?.owner}/${match?.repo}`
          }]}
          onSelect={() => selectMatchedRepo()}
        />
      )}
    </>
  )
}

const ConnectedRepositorySelection = ({
  platform,
  idToken,
  onSelect
}: {
  platform: t.Platform,
  idToken: string
  onSelect?: (repo: { id: string, repo: string, owner: string, installationId: string }) => void
}) => {

  const [filter, setFilter] = useState('')
  const repositoriesRequest = useFetch(api.platforms.listAvailableRepositories)
  const [isGithubConnected, setIsGithubConnected] = useState(platform.hasConnectedGithubApp)

  const repositories = repositoriesRequest.data?.repositories ?? []

  const connectedRepositories = repositories.filter(r => {
    return filter.length > 0
      ? `${r.owner}/${r.repo}`.toLowerCase().includes(filter)
      : true
  }) ?? []

  const platformPolling = usePollingFetch(api.platforms.getById, {
    waitMs: 800,
    active: false,
    args: { id: platform.id },
    auth: { token: idToken }
  })

  useEffect(() => {
    if (platform.hasConnectedGithubApp) return
    const hasConnectedGithubApp = platformPolling.data?.platform?.hasConnectedGithubApp
    if (!hasConnectedGithubApp) return
    platformPolling.pause()
    repositoriesRequest.fetch({}, { token: idToken })
    setIsGithubConnected(true)
  }, [platformPolling.data])

  useEffect(() => {
    return () => {
      platformPolling.pause()
    }
  }, [])

  const openGithubApp = () => {
    platformPolling.poll()
    window.open('https://github.com/apps/exobase-bot/installations/new', '')?.focus()
  }

  const refresh = () => {
    repositoriesRequest.fetch({}, { token: idToken })
  }

  if (isGithubConnected) return (
    <>
      {!repositoriesRequest.loading && (
        <RepositoryResultListHeader
          onFilterChange={setFilter}
          onRefresh={refresh}
          onEditConfig={openGithubApp}
        />
      )}
      <SelectList
        maxHeight='50vh'
        loading={repositoriesRequest.loading}
        items={connectedRepositories.map((repo) => ({
          id: repo.id,
          label: repo.repo,
          subtitle: repo.owner,
          link: `https://github.com/${repo.owner}/${repo.repo}`
        })) ?? []}
        onSelect={(item) => onSelect?.(repositories.find(r => r.id === item.id)!)}
      />
    </>
  )

  if (!isGithubConnected) return (
    <Center>
      <ConnectGithubButton
        onClick={openGithubApp}
        iconBefore={<BsGithub color='#FAFAFA' />}
      >
        Connect GitHub
      </ConnectGithubButton>
    </Center>
  )

  return null
}

const ConnectGithubButton = styled(Button)`
  color: #FAFAFA;
  background-color: #333333;
  &:hover {
    color: #FAFAFA;
    background-color: #333333 !important;
  }
`

const RepositoryResultListHeader = ({
  onFilterChange,
  onRefresh,
  onEditConfig
}: {
  onFilterChange: (f: string) => void
  onRefresh: () => void
  onEditConfig: () => void
}) => {
  const updateFilter: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onFilterChange(e.target.value)
  }
  return (
    <Split
      marginBottom={majorScale(2)}
    >
      <SearchInput
        placeholder="Filter repositories"
        width='100%'
        onChange={updateFilter}
        marginRight={majorScale(2)}
      />
      <IconButton
        icon={<HiRefresh />}
        appearance='primary'
        onClick={onRefresh}
        marginRight={majorScale(2)}
      />
      <IconButton
        icon={<HiOutlineCog />}
        appearance='default'
        onClick={onEditConfig}
      />
    </Split>
  )
}

const BranchListAndSelect = ({
  installationId,
  owner,
  repo,
  idToken,
  onBack,
  onSelect
}: {
  installationId: string | null
  owner: string
  repo: string
  idToken: string
  onBack?: () => void
  onSelect?: (name: string) => void
}) => {

  const branchListRequest = useAjax(() => {
    if (installationId) {
      return api.platforms.listAvailableBranches({
        owner, repo, installationId
      }, { token: idToken }).then(res => res.data.branches)
    } else {
      const octokit = new Octokit()
      return octokit.request('GET /repos/{owner}/{repo}/branches', {
        owner, repo
      }).then(res => res.data.map(b => ({ name: b.name })))
    }
  })

  useEffect(() => {
    branchListRequest.fetch({})
  }, [`${owner}:${repo}`])

  const branches = branchListRequest.data ?? []

  return (
    <>
      <SelectList
        items={[{
          id: 'any',
          label: repo,
          subtitle: owner,
          link: `https://github.com/${owner}/${repo}`,
          selectLabel: 'change',
          selectAppearance: 'minimal'
        }]}
        onSelect={onBack}
      />
      <Center>
        <Text
          size={600}
          fontWeight='bold'
          marginBottom={majorScale(3)}
        >
          select branch
        </Text>
      </Center>
      <SelectList
        maxHeight='50vh'
        loading={branchListRequest.loading}
        items={branches?.map((branch) => ({
          id: branch.name,
          label: branch.name,
          link: `https://github.com/${owner}/${repo}/tree/${branch.name}`
        })) ?? []}
        onSelect={({ id }) => onSelect?.(id as string)}
      />
    </>
  )
}

const GitHubSourceInput = ({
  onChange
}: {
  onChange: (source: { repo: string, owner: string }) => void
}) => {
  const handleLink = debounce((link: string) => {
    if (!link) return
    const { name: repo, owner } = GitUrlParse(link)
    onChange({ repo, owner })
  }, 600)
  return (
    <TextInputField
      label="Open Source Link"
      placeholder="https://github.com/exobase-inc/exobase-api"
      onChange={(e: any) => handleLink(e.target.value)}
    />
  )
}