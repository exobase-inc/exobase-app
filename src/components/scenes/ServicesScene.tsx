/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Center, Split } from '../layout'
import * as t from '../../types'
import {
  Pane,
  Heading,
  Button,
  Paragraph,
  majorScale,
  toaster
} from 'evergreen-ui'
import { HiPlusSm } from 'react-icons/hi'
import { useFetch } from '../../hooks'
import api from '../../api'
import {
  idTokenState,
  workspaceState
} from '../../state/app'
import ServiceGrid from '../ui/ServiceGrid'
import { SceneLayout, ServiceDetailSideSheet } from '../ui'
import { useParams } from 'react-router-dom'


export default function ServicesScene() {

  const { platformId } = useParams() as { platformId: string }
  const navigate = useNavigate()

  // Local State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  // Global State
  const idToken = Recoil.useRecoilValue(idTokenState)
  const workspace = Recoil.useRecoilValue(workspaceState)
  const platform = workspace?.platforms.find(p => p.id === platformId)
  
  // API Requests
  const deployRequest = useFetch(api.units.deployFromUI)

  if (!platform) {
    return (<span>no platfrom</span>)
  }


  const deployService = async (service: t.Unit) => {
    const { error } = await deployRequest.fetch({
      workspaceId: workspace!.id,
      platformId,
      unitId: service.id,
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
    }
  }

  const services = _.sort(platform.units.filter(u => u.type === 'user-service') ?? [], s => s.createdAt ?? 0)
  const currentService = services.find(s => s.id === selectedServiceId) ?? null

  const createService = () => {
    navigate(`/platform/${platformId}/services/new`)
  }

  const handleServiceSelection = (service: t.Unit) => {
    setSelectedServiceId(service.id)
  }

  return (
    <SceneLayout subtitle='Services'>
      <ServiceDetailSideSheet
        platform={platform}
        isShown={currentService !== null}
        service={currentService!}
        onClose={() => setSelectedServiceId(null)}
      />
      <Split marginBottom={majorScale(4)}>
        <Pane flex={1} />
        <Button appearance='primary' iconBefore={<HiPlusSm />} onClick={createService}>
          Add Service
        </Button>
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
              This platform has no service
            </Paragraph>
            <Pane>
              <Button onClick={createService}>Create</Button>
            </Pane>
          </Pane>
        </Center>
      )}
      {services.length > 0 && (
        <Pane paddingBottom={majorScale(4)}>
          <ServiceGrid
            services={services}
            onSelect={handleServiceSelection}
            onDeploy={deployService}
          />
        </Pane>
      )}
    </SceneLayout>
  )
}