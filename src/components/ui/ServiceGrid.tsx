import * as t from '../../types'
import Recoil from 'recoil'
import { useCurrentWidth } from 'react-socks'
import Skeleton from 'react-loading-skeleton'
import { Split, Center } from '../layout'
import { PROVIDER_LOGOS, CLOUD_SERVICE_LOGOS } from '../../const'
import { HiCog, HiOutlineDotsVertical, HiUpload } from 'react-icons/hi'
import { idTokenState } from '../../state/app'
import { useFetch } from '../../hooks'
import * as api from '../../api'
import {
  majorScale,
  Pane,
  Image,
  Heading,
  Button,
  IconButton
} from 'evergreen-ui'


export default function ServiceGrid({
  loading = false,
  environmentId,
  services
}: {
  loading?: boolean
  environmentId?: string | null
  services: t.Service[]
}) {
  const width = useCurrentWidth()
  const columns = Math.round(width / 350)
  return (
    <Pane
      flex={1}
      display='grid'
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {!loading && services.map(service => (
        <ServiceGridItem
          key={service.id}
          service={service}
          environmentId={environmentId ?? null}
        />
      ))}
      {loading && [0, 1, 2, 3, 4].map((i) => (
        <Pane key={i}>
          <Pane marginBottom={8}>
            <Skeleton
              width='100%'
              height={170}
            />
          </Pane>
          <Pane marginBottom={8}>
            <Skeleton
              width='40%'
              height={24}
            />
          </Pane>
          <Pane>
            <Skeleton
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
  environmentId
}: {
  service: t.Service
  environmentId: string | null
}) => {

  const idToken = Recoil.useRecoilValue(idTokenState)
  const deployRequest = useFetch(api.deployService)

  const instance = service.instances.find(i => i.environmentId === environmentId)
  const deployments = instance?.deployments ?? []
  const hasBeenDeployed = deployments.length > 0
  const cloudServiceLogoUrl = CLOUD_SERVICE_LOGOS[service.service]
  const version = instance?.attributes.version ?? 'unknown'

  const deploy = async () => {
    deployRequest.fetch({
      idToken: idToken!,
      serviceId: service.id,
      instanceId: instance?.id ?? ''
    })
  }

  return (
    <Pane
      backgroundColor="#FFFFFF"
      borderRadius={4}
      padding={majorScale(2)}
    >
      <Split
        alignItems='center'
        paddingBottom={majorScale(2)}
      >
        <Image
          src={cloudServiceLogoUrl}
          height={23}
          marginRight={majorScale(2)}
        />
        <Heading flex={1}>{service.name}</Heading>
      </Split>
      <Split>
        {!hasBeenDeployed && (
          <Button
            flex={1}
            appearance='minimal'
            iconBefore={<HiUpload size={20} />}
            onClick={deploy}
          >
            Deploy
          </Button>
        )}
      </Split>
    </Pane>
  )
}