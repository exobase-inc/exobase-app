import _ from 'radash'
import { useState } from 'react'
import * as t from '../../types'
import { useNavigate, useParams } from 'react-router'
import Recoil from 'recoil'
import { Split, Center } from '../layout'
import {
  Pane,
  Heading,
  Button,
  TextInputField,
  toaster,
  Strong,
  majorScale,
  Paragraph
} from 'evergreen-ui'
import { 
  idTokenState,
  appState as appStateAtom,
  workspaceState
} from '../../state/app'
import { useFetch, useFormation } from '../../hooks'
import api from '../../api'
import * as yup from 'yup'
import { SceneLayout, GridBoxSelect } from '../ui'


type Step = 'provider' | 'domain'

type State = {
  provider: t.CloudProvider | null
  step: Step
}

export default function CreateServiceScene() {

  const navigate = useNavigate()
  const { platformId } = useParams() as { platformId: string}
  const idToken = Recoil.useRecoilValue(idTokenState)
  const workspace = Recoil.useRecoilValue(workspaceState)
  const [appState, setAppState] = Recoil.useRecoilState(appStateAtom)
  const addDomainRequest = useFetch(api.platforms.addDomain)
  
  const [state, setState] = useState<State>({
    step: 'provider',
    provider: null
  })

  if (!workspace) {
    return (
      <span>no workspace</span>
    )
  }

  const platform = workspace.platforms.find(p => p.id === platformId)

  if (!platform) {
    return (
      <span>no platform</span>
    )
  }

  const title = (() => {
    if (state.step === 'provider') return 'Where is your domain registered?'
    if (state.step === 'domain') return 'What\'s the name?'
  })()

  const handleCloudProvider = (cp: t.CloudProvider) => {
    setState({ ...state, provider: cp, step: 'domain' })
  }

  const submit = async ({ name }: GeneralData) => {

    const { error, data } = await addDomainRequest.fetch({
      workspaceId: workspace.id,
      platformId,
      domain: name,
      provider: state.provider!
    }, { token: idToken! })

    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    const providers = platform.providers as any
    setAppState({
      ...appState,
      workspace: {
        ...workspace,
        platforms: _.replace(workspace.platforms, {
          ...platform,
          providers: {
            ...platform.providers,
            [state.provider! as any]: {
              ...providers[state.provider!],
              domains: [...providers[state.provider!].domains, data.domain]
            }
          }
        }, (p) => p.id === platformId)
      }
    })
    navigate(`/platform/${platformId}/domains`)
  }


  const cancel = () => {
    navigate(`/platform/${platformId}/domains`)
  }

  const setStep = (step: Step) => () => {
    setState({ ...state, step })
  }

  return (
    <SceneLayout>
      <Center>
        <Pane
          maxWidth='500px'
        >
          <Pane width='100%'>
            <Heading flex={1} size={800}>{title}</Heading>
            <Paragraph>
              Configure a domain in the <Strong>{platform.name}</Strong> platform. This process will setup any required domain certificates and validation and allow Exobase to use it when deploying services. You must already own the domain in the selected cloud provider.
            </Paragraph>
          </Pane>
          {state.step === 'provider' && (
            <CloudProviderForm
              onSelect={handleCloudProvider}
              onBack={cancel}
            />
          )}
          {state.step === 'domain' && (
            <DomainForm
              onBack={setStep('provider')}
              onSubmit={submit}
              loading={addDomainRequest.loading}
            />
          )}
        </Pane>
      </Center>
    </SceneLayout>
  )
}


type GeneralData = {
  name: string
}

function DomainForm({
  loading = false,
  onSubmit,
  onBack
}: {
  loading?: boolean
  onSubmit: (data: GeneralData) => void
  onBack: () => void
}) {

  const form = useFormation({
    name: yup.string().matches(/^(?=.{1,253}\.?$)(?:(?!-|[^.]+_)[A-Za-z0-9-_]{1,63}(?<!-)(?:\.|$)){2,}$/, {
      message: 'invalid format'
    }).required()
  }, {
    name: ''
  })

  const handleSubmit = (formData: GeneralData) => {
    onSubmit(formData)
  }

  return (
    <>
      <Pane width='100%' marginTop={majorScale(2)}>
        <TextInputField
          label="Domain Name"
          placeholder="exobase.cloud"
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
          isLoading={loading}
        >
          Finish
        </Button>
      </Split>
    </>
  )
}


const CloudProviderForm = ({
  onSelect,
  onBack
}: {
  onSelect: (type: t.CloudProvider) => void
  onBack: () => void
}) => {
  return (
    <Pane marginTop={majorScale(2)}>
      <GridBoxSelect
        choices={[{
          label: 'AWS',
          key: 'aws'
        }, {
          label: 'GCP',
          key: 'gcp',
          comingSoon: true
        }]}
        onSelect={onSelect}
      />
      <Split marginTop={majorScale(2)}>
        <Button onClick={onBack}>
          Back
        </Button>
      </Split>
    </Pane>
  )
}