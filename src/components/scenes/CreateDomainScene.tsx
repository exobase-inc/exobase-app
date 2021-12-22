import { useState } from 'react'
import * as t from '../../types'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Split, Center } from '../layout'
import styled from 'styled-components'
import {
  Pane,
  Heading,
  Button,
  TextInputField,
  Text,
  toaster,
  Strong,
  majorScale,
  Paragraph
} from 'evergreen-ui'
import { currentPlatformState, idTokenState } from '../../state/app'
import { useFetch, useFormation } from '../../hooks'
import api from '../../api'
import * as yup from 'yup'
import { SceneLayout } from '../ui'
import theme from '../../styles'


type Step = 'provider' | 'domain'

type State = {
  provider: t.CloudProvider | null
  step: Step
}

export default function CreateServiceScene() {

  const navigate = useNavigate()
  const idToken = Recoil.useRecoilValue(idTokenState)
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)
  const addDomain = useFetch(api.domains.add)
  const [state, setState] = useState<State>({
    step: 'provider',
    provider: null
  })

  const title = (() => {
    if (state.step === 'provider') return 'Where is your domain registered?'
    if (state.step === 'domain') return 'What\'s the name?'
  })()

  const handleCloudProvider = (cp: t.CloudProvider) => {
    setState({ ...state, provider: cp, step: 'domain' })
  }

  const submit = async ({ name }: GeneralData) => {

    if (!currentPlatform) return

    const { error } = await addDomain.fetch({
      domain: name,
      provider: state.provider!
    }, { token: idToken! })

    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }

    navigate('/domains')
  }


  const cancel = () => {
    navigate('/domains')
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
              Configure a domain in the <Strong>{currentPlatform?.name}</Strong> platform. This process will setup any required domain certificates and validation and allow Exobase to use it when deploying services. You must already own the domain in the selected cloud provider.
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
  onSubmit,
  onBack
}: {
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
        >
          Finish
        </Button>
      </Split>
    </>
  )
}

const GridChoicePane = styled(Center)`
  transition: background-color 0.3s ease-out;
  > span {
    transition: color 0.3s ease-out;
    font-weight: 600;
  }
  &:hover {
    background-color: #145cfe;
    cursor: pointer;
    > span {
      color: #FFFFFF;
    }
  }
` as typeof Center

const GridChoice = ({
  children,
  onClick
}: {
  children: React.ReactNode
  onClick?: () => void
}) => {
  return (
    <GridChoicePane
      padding={majorScale(2)}
      backgroundColor={theme.colors.grey100}
      onClick={onClick}
      borderRadius={4}
    >
      {children}
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
        <GridChoice onClick={select('aws')}>
          <Text>AWS</Text>
        </GridChoice>
        <GridChoice onClick={select('gcp')}>
          <Text>GCP</Text>
        </GridChoice>
        <GridChoice onClick={select('vercel')}>
          <Text>Vercel</Text>
        </GridChoice>
        <GridChoice onClick={select('azure')}>
          <Text>Azure</Text>
        </GridChoice>
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