import _ from 'radash'
import { useState } from 'react'
import * as t from '../../types'
import { useCurrentWidth } from 'react-socks'
import Recoil from 'recoil'
import { workspaceState, idTokenState } from '../../state/app'
import { PROVIDER_LOGOS } from '../../const'
import { Center, Stack } from '../layout'
import api from '../../api'
import { useFetch } from '../../hooks'
import {
  majorScale,
  Pane,
  Text,
  Image,
  Button,
  TextInputField,
  toaster
} from 'evergreen-ui'
import { useParams } from 'react-router-dom'


export default function ProviderGrid() {
  const { platformId } = useParams() as { platformId: string }
  const workspace = Recoil.useRecoilValue(workspaceState)
  const platform = workspace?.platforms.find(p => p.id === platformId) ?? null
  const idToken = Recoil.useRecoilValue(idTokenState)
  const width = useCurrentWidth()
  const columns = Math.round(width / 350)
  if (!platform || !idToken || !workspace) return null
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
      <ProviderGridItem
        provider="aws"
      >
        <AWSConfigForm platform={platform} idToken={idToken} workspaceId={workspace.id} />
      </ProviderGridItem>
      <ProviderGridItem
        provider="gcp"
        comingSoon
      />
    </Pane>
  )
}

const ProviderGridItem = ({
  provider,
  children,
  comingSoon = false
}: {
  provider: t.CloudProvider
  children?: React.ReactNode
  comingSoon?: boolean
}) => {
  const logoUrl = PROVIDER_LOGOS[provider]
  return (
    <Stack
      backgroundColor="#FFFFFF"
      borderRadius={4}
      padding={majorScale(2)}
      elevation={2}
      minHeight={400}
    >
      <Center marginBottom={majorScale(3)} flex={1}>
        <Image
          src={logoUrl}
          maxWidth={100}
        />
      </Center>
      {comingSoon && (
        <Center>
          <Text>Coming Soon</Text>
        </Center>
      )}
      {!comingSoon && (
        <>{children}</>
      )}
    </Stack>
  )
}

const AWSConfigForm = ({
  workspaceId,
  platform,
  idToken
}: {
  workspaceId: string
  platform: t.Platform
  idToken: string
}) => {

  const aws = platform.providers.aws
  const isConfigured = platform?.providers?.aws?.configured ?? false
  const [accessKeyId, setAccessKeyId] = useState<string>(aws.configured ? '*************' : '')
  const [accessKeySecret, setAccessKeySecret] = useState<string>(aws.configured ? '*************' : '')
  const [region, setRegion] = useState<string>(aws.region ?? '')
  const updateAwsConfig = useFetch(api.platforms.updateProvider)

  const submit = async () => {
    const value: t.AWSProvider['auth'] = {
      accessKeyId,
      accessKeySecret,
      region
    }
    const { error } = await updateAwsConfig.fetch({
      workspaceId,
      platformId: platform.id,
      provider: 'aws',
      value
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    toaster.success('AWS has been configured')
    setAccessKeyId('***************')
    setAccessKeySecret('***************')
  }
  return (
    <Pane>
      <Pane>
        <TextInputField
          label="Access Key ID"
          placeholder='************'
          value={accessKeyId}
          onChange={(e: any) => setAccessKeyId(e.target.value)}
        />
        <TextInputField
          label="Access Key Secret"
          placeholder='************'
          value={accessKeySecret}
          onChange={(e: any) => setAccessKeySecret(e.target.value)}
        />
        <TextInputField
          label="Region"
          placeholder='us-east-1'
          value={region}
          onChange={(e: any) => setRegion(e.target.value)}
        />
      </Pane>
      <Button
        onClick={submit}
        width='100%'
        appearance='primary'
        disabled={updateAwsConfig.loading || accessKeyId.startsWith('****') || accessKeySecret.startsWith('****')}
        isLoading={updateAwsConfig.loading}
      >
        {isConfigured ? 'Update' : 'Setup'}
      </Button>
    </Pane>
  )
}
