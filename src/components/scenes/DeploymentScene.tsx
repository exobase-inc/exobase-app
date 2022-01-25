/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Recoil from 'recoil'
import { Center, Split } from '../layout'
import * as t from '../../types'
import theme from '../../styles'
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
  currentPlatformState
} from '../../state/app'
import ServiceGrid from '../ui/ServiceGrid'
import { SceneLayout, ServiceDetailSideSheet } from '../ui'


export default function DeploymentScene() {

  const { id: deploymentId } = useParams() as { id: string }

  // Global State
  const idToken = Recoil.useRecoilValue(idTokenState)
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)
  // API Requests
  const getLogStreamRequest = useFetch(api.deployments.getLogStream)

  const getLogStream = async () => {
    const { error } = await getLogStreamRequest.fetch({
      deploymentId
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
    }
  }

  useEffect(() => {
    if (!currentPlatform?.id) return
    if (!deploymentId) return
    getLogStream()
  }, [currentPlatform?.id])

  // useEffect(() => {
  //   const iid = setInterval(() => {
  //     getLogStream()
  //   }, 1000)
  //   return () => {
  //     clearInterval(iid)
  //   }
  // }, [])

  // const services = _.sort(currentPlatform?.services ?? [], s => s.createdAt ?? 0)
  // const currentService = services.find(s => s.id === selectedServiceId) ?? null

  // const createService = () => {
  //   navigate('/services/new')
  // }

  // const handleServiceSelection = (service: t.Service) => {
  //   setSelectedServiceId(service.id)
  // }

  const chunks = _.sort(getLogStreamRequest.data?.logStream.chunks ?? [], c => c.timestamp)

  return (
    <SceneLayout subtitle='Services'>

      <Center padding={majorScale(4)}>
        <Pane
          padding={majorScale(2)}
          backgroundColor={theme.colors.grey900}
          maxWidth='800px'
          minHeight='60vh'
        >
          {chunks.map(chunk => (
            <p 
              key={chunk.timestamp}
              style={{ 
                color: '#FFFFFF', 
                overflowWrap: 'anywhere',
                marginBottom: `${majorScale(1)}px`
              }} 
            >
              {chunk.content}
            </p>
          ))}
        </Pane>
      </Center>
    </SceneLayout>
  )
}