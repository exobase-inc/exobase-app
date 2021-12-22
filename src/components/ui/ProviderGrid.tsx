import { useState } from 'react'
import * as t from '../../types'
import { useCurrentWidth } from 'react-socks'
import Recoil from 'recoil'
import { currentPlatformState, idTokenState } from '../../state/app'
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


export default function ProviderGrid() {
  const platform = Recoil.useRecoilValue(currentPlatformState)
  const idToken = Recoil.useRecoilValue(idTokenState)
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
      <ProviderGridItem
        provider="vercel"
      >
        <VercelAuthForm platform={platform} idToken={idToken} />
      </ProviderGridItem>
      <ProviderGridItem
        provider="aws"
      >
        <AWSConfigForm platform={platform} idToken={idToken} />
      </ProviderGridItem>
      <ProviderGridItem
        provider="gcp"
        comingSoon
      />
      <ProviderGridItem
        provider="azure"
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

const VercelAuthForm = ({
  platform,
  idToken
}: {
  platform: t.Platform | null
  idToken: string | null
}) => {
  const isConfigured = platform?.providers?.vercel?.configured ?? false
  const [token, setToken] = useState<string | null>(null)
  const value = token ?? (isConfigured ? '******************' : '')
  const updateVercelAuth = useFetch(api.platforms.updateProvider)
  const submit = async () => {
    const { error } = await updateVercelAuth.fetch({
      provider: 'vercel',
      config: {
        token: token!
      }
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
  }
  return (
    <Pane>
      <Pane>
        <TextInputField
          label="Token"
          placeholder='************'
          value={value}
          onChange={(e: any) => setToken(e.target.value)}
        />
      </Pane>
      <Button
        onClick={submit}
        width='100%'
        appearance='primary'
        disabled={updateVercelAuth.loading}
        isLoading={updateVercelAuth.loading}
      >
        {isConfigured ? 'Update' : 'Setup'}
      </Button>
    </Pane>
  )
}

const AWSConfigForm = ({
  platform,
  idToken
}: {
  platform: t.Platform | null
  idToken: string | null
}) => {

  const config = platform?.providers?.aws ?? {
    accessKeyId: '',
    accessKeySecret: '',
    region: '',
    configured: false
  }
  const isConfigured = platform?.providers?.aws?.configured ?? false
  const [accessKeyId, setAccessKeyId] = useState<string>(config.accessKeyId ?? '')
  const [accessKeySecret, setAccessKeySecret] = useState<string>(config.accessKeySecret ?? '')
  const [region, setRegion] = useState<string>(config.region)
  const updateAwsConfig = useFetch(api.platforms.updateProvider)

  const submit = async () => {
    const { error } = await updateAwsConfig.fetch({
      provider: 'aws',
      config: {
        accessKeyId,
        accessKeySecret,
        region
      }
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
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
        disabled={updateAwsConfig.loading}
        isLoading={updateAwsConfig.loading}
      >
        {isConfigured ? 'Update' : 'Setup'}
      </Button>
    </Pane>
  )
}
