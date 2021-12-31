/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Split, Center } from '../layout'
import {
  Pane,
  Heading,
  Button,
  Paragraph,
  majorScale,
  toaster,
  Badge,
  Spinner,
  Table,
  StatusIndicator
} from 'evergreen-ui'
import { useFetch } from '../../hooks'
import api from '../../api'
import {
  idTokenState,
  currentPlatformIdState,
  currentPlatformState
} from '../../state/app'
import { SceneLayout } from '../ui'
import { HiPlus } from 'react-icons/hi'
import * as t from '../../types'


export default function DomainsScene() {

  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const idToken = Recoil.useRecoilValue(idTokenState)
  const getDeploymentsRequest = useFetch(api.domainDeployments.getLatest)
  const currentPlatformId = Recoil.useRecoilValue(currentPlatformIdState)
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)

  useEffect(() => {
    if (!currentPlatformId) return
    getDomainDeployments()
  }, [currentPlatformId])

  const getDomainDeployments = async () => {
    const { error } = await getDeploymentsRequest.fetch({}, {
      token: idToken!
    })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
    }
  }

  const setupDomain = () => {
    navigate('/domains/new')
  }

  const updateSelectedDomain = () => {

  }

  const deployments = getDeploymentsRequest.data?.deployments ?? []
  const domains = (currentPlatform?.domains ?? []).map((domain) => {
    return {
      domain,
      deployment: deployments.find(d => d.domainId === domain.id) ?? null
    }
  })

  console.log({ domains, deployments })

  const filteredDomains = domains.length > 0 && !!searchTerm
    ? domains.filter(d => d.domain.domain.toLowerCase().includes(searchTerm.toLowerCase()))
    : domains

  return (
    <SceneLayout
      subtitle='Domains'
    >
      {domains.length === 0 && (
        <Center height='50vh'>
          <Pane
            backgroundColor='#FFFFFF'
            padding={majorScale(4)}
            borderRadius={4}
          >
            <Heading>No Domains</Heading>
            <Paragraph marginBottom={majorScale(2)}>
              This platform has no domains configured
            </Paragraph>
            <Pane>
              <Button onClick={setupDomain}>Setup a Domain</Button>
            </Pane>
          </Pane>
        </Center>
      )}
      {domains.length > 0 && (
        <Split>
          <Pane flex={1}>
            <Split marginBottom={majorScale(2)}>
              <Pane flex={1} />
              <Button onClick={setupDomain} iconBefore={<HiPlus />}>Add</Button>
            </Split>
            <DomainTable
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onDomainSelected={updateSelectedDomain}
              domains={filteredDomains}
              loading={getDeploymentsRequest.loading}
            />
          </Pane>
          <Pane
            width='33%'
            paddingLeft={majorScale(4)}
          >
            
          </Pane>
        </Split>
      )}
    </SceneLayout>
  )
}

export const DomainTable = ({
  searchTerm,
  onSearchTermChange,
  onDomainSelected,
  domains,
  loading
}: {
  searchTerm: string
  onSearchTermChange: (st: string) => void
  onDomainSelected: (d: t.Domain) => void
  domains: { domain: t.Domain, deployment: t.DomainDeployment | null }[]
  loading: boolean
}) => {

  return (
    <Table>
      <Table.Head>
        <Table.SearchHeaderCell
          value={searchTerm}
          onChange={onSearchTermChange}
        />
        <Table.TextHeaderCell>Cloud</Table.TextHeaderCell>
        <Table.TextHeaderCell>Status</Table.TextHeaderCell>
      </Table.Head>
      <Table.Body height={240}>
        {domains.map(({ domain, deployment }) => (
          <Table.Row key={domain.id} isSelectable onSelect={() => onDomainSelected(domain)}>
            <Table.TextCell>{domain.domain}</Table.TextCell>
            <Table.Cell><Badge>{domain.provider}</Badge></Table.Cell>
            {loading && (
              <Table.Cell>
                <Spinner />
              </Table.Cell>
            )}
            {!loading && deployment && (
              <Table.Cell>
                <StatusIndicator>{deployment.status}</StatusIndicator>
              </Table.Cell>
            )}
            {!loading && !deployment && (
              <Table.TextCell></Table.TextCell>
            )}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}


