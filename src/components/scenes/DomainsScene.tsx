/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
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
  workspaceState
} from '../../state/app'
import { SceneLayout } from '../ui'
import { HiPlus } from 'react-icons/hi'
import * as t from '../../types'


export default function DomainsScene() {

  const { platformId } = useParams() as { platformId: string }
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const idToken = Recoil.useRecoilValue(idTokenState)
  
  const deployRequest = useFetch(api.units.deployFromUI)
  const workspace = Recoil.useRecoilValue(workspaceState)
  const platform = workspace?.platforms.find(p => p.id === platformId) ?? null
  const domains = platform ? _.flat(Object.values(platform.providers).map(p => p.domains)) : []

  const lookupUnit = (domainId: string): t.Unit | null => {
    if (!platform || !workspace) return null
    const domain = domains.find(d => d.id === domainId)
    if (!domain) return null
    const unit = platform.units.find(u => u.id === domain.unitId)
    if (!unit) return null
    return unit
  }

  const setupDomain = () => {
    navigate(`/platform/${platformId}/domains/new`)
  }

  const gotoLogs = (deploymentId: string) => {
    const unit = lookupUnit(deploymentId)
    navigate(`/platform/${platformId}/services/${unit?.id}/deployments/${deploymentId}`)
  }

  const deployDomain = async (domainId: string) => {
    const unit = lookupUnit(domainId)
    const response = await deployRequest.fetch({
      unitId: unit?.id ?? '',
      workspaceId: workspace?.id ?? '',
      platformId: platform?.id ?? ''
    }, { token: idToken! })
    if (response.error) {
      console.error(response.error)
      toaster.danger(response.error.details)
      return
    }
    toaster.success('Deploy started')
  }

  const updateSelectedDomain = () => {

  }

  const filteredDomains = domains.length > 0 && !!searchTerm
    ? domains.filter(d => d.domain.toLowerCase().includes(searchTerm.toLowerCase()))
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
              onViewLogs={gotoLogs}
              onDeploy={deployDomain}
              domains={filteredDomains.map(d => ({ domain: d, unit: lookupUnit(d.id)! }))}
              loading={false}
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
  onViewLogs,
  onDeploy,
  domains,
  loading
}: {
  searchTerm: string
  onSearchTermChange: (st: string) => void
  onDomainSelected: (d: t.Domain) => void
  onViewLogs?: (id: string) => void
  onDeploy?: (id: string) => void
  domains: { domain: t.Domain, unit: t.Unit }[]
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
        <Table.TextHeaderCell>Action</Table.TextHeaderCell>
      </Table.Head>
      <Table.Body height={240}>
        {domains.map(({ domain, unit }) => (
          <Table.Row key={domain.id} isSelectable onSelect={() => onDomainSelected(domain)}>
            <Table.TextCell>{domain.domain}</Table.TextCell>
            <Table.Cell><Badge>{domain.provider}</Badge></Table.Cell>
            {loading && (
              <Table.Cell>
                <Spinner />
              </Table.Cell>
            )}
            {!loading && unit.latestDeployment && (
              <Table.Cell>
                <StatusIndicator>{unit.latestDeployment.status}</StatusIndicator>
              </Table.Cell>
            )}
            {!loading && !unit.latestDeployment && (
              <Table.TextCell></Table.TextCell>
            )}
            <Table.Cell>
              <Pane>
                <Button
                  onClick={() => unit.latestDeployment && onViewLogs?.(unit.latestDeployment.id)}
                >
                  View Logs
                </Button>
                {unit.latestDeployment?.status === 'failed' && (
                  <Button
                    onClick={() => onDeploy?.(domain.id)}
                  >
                    Redeploy
                  </Button>
                )}
              </Pane>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}


