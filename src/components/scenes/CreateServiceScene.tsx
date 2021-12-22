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
  Link,
  Paragraph
} from 'evergreen-ui'
import { currentPlatformState, idTokenState } from '../../state/app'
import { useFetch, useFormation } from '../../hooks'
import api from '../../api'
import * as yup from 'yup'
import { SceneLayout } from '../ui'
import theme from '../../styles'
import { STACK_CONFIGS } from '../../stacks'


type Step = 'language'
  | 'service-type'
  | 'cloud-provider'
  | 'provider-service'
  | 'data'
  | 'config'

type State = {
  language: t.Language | null
  service: t.CloudService | null
  provider: t.CloudProvider | null
  type: t.ExobaseService | null
  step: Step
  config: any
}

export default function CreateServiceScene() {

  const navigate = useNavigate()
  const idToken = Recoil.useRecoilValue(idTokenState)
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)
  const createService = useFetch(api.services.create)
  const [state, setState] = useState<State>({
    step: 'language',
    language: null,
    service: null,
    provider: null,
    type: null,
    config: null
  })

  const serviceKey = `${state.type}:${state.provider}:${state.service}` as t.ExobaseServiceKey
  const stackConfig = STACK_CONFIGS[serviceKey]

  const title = (() => {
    if (state.step === 'language') return 'What language is your service written in?'
    if (state.step === 'cloud-provider') return 'Where should we deploy it?'
    if (state.step === 'config') return 'A Few Details'
    if (state.step === 'data') return 'A Few Details'
    if (state.step === 'service-type') return 'What do you want to make?'
    if (state.step === 'provider-service') return 'What service do you want to run on?'
  })()

  // const subtitle = (() => {
  //   if (step === 'cloud-provider') return 'Where should we deploy it?'
  //   if (step === 'config') return 'A Few Details'
  //   if (step === 'service-type') return 'What do you want to make?'
  // })()

  const handleLanguage = (l: t.Language) => {
    setState({ ...state, language: l, step: 'service-type' })
  }

  const handleServiceType = (st: t.ExobaseService) => {
    setState({ ...state, type: st, step: 'cloud-provider' })
  }

  const handleCloudProvider = (cp: t.CloudProvider) => {
    setState({ ...state, provider: cp, step: 'provider-service' })
  }

  const handleCloudService = (cs: t.CloudService) => {
    const stackC = STACK_CONFIGS[`${state.type}:${state.provider}:${cs}` as t.ExobaseServiceKey]
    if (!stackC) {
      setState({ ...state, service: cs, step: 'data' })
    } else {
      setState({ ...state, service: cs, step: 'config' })
    }
  }

  const handleConfig = (c: any) => {
    setState({ ...state, config: c, step: 'data' })
  }

  const submit = async (config: GeneralData) => {

    if (!currentPlatform) return

    const { error } = await createService.fetch({
      name: config.name,
      source: {
        repository: config.repository,
        branch: config.branch
      },
      service: state.service!,
      language: state.language!,
      type: state.type!,
      provider: state.provider!,
      config: {
        type: serviceKey,
        ...state.config
      }
    }, { token: idToken! })

    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }

    navigate('/services')
  }

  const cancel = () => {
    navigate('/services')
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
              Create a new service in the <Strong>{currentPlatform?.name}</Strong> platform.
            </Paragraph>
          </Pane>
          {state.step === 'language' && (
            <LanguageForm
              onSelect={handleLanguage}
              onBack={cancel}
            />
          )}
          {state.step === 'service-type' && (
            <ServiceTypeForm
              onSelect={handleServiceType}
              onBack={setStep('language')}
            />
          )}
          {state.step === 'cloud-provider' && (
            <CloudProviderForm
              onSelect={handleCloudProvider}
              onBack={setStep('service-type')}
            />
          )}
          {state.step === 'provider-service' && (
            <CloudServiceForm
              serviceType={state.type!}
              provider={state.provider!}
              onSelect={handleCloudService}
              onBack={setStep('cloud-provider')}
            />
          )}
          {state.step === 'config' && (
            <StackConfigForm
              stackConfig={stackConfig}
              onBack={setStep('cloud-provider')}
              onSubmit={handleConfig}
            />
          )}
          {state.step === 'data' && (
            <GeneralDataForm
              onBack={setStep('cloud-provider')}
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
  repository: string
  branch: string
}

function GeneralDataForm({
  onSubmit,
  onBack
}: {
  onSubmit: (config: GeneralData) => void
  onBack: () => void
}) {

  const form = useFormation({
    name: yup.string().required(),
    repository: yup.string().required(), // github repo url
    branch: yup.string().required()
  }, {
    name: '',
    repository: '',
    branch: ''
  })

  const handleSubmit = (formData: GeneralData) => {
    onSubmit(formData)
  }

  return (
    <>
      <Pane width='100%' marginTop={majorScale(2)}>
        <TextInputField
          label="Name"
          placeholder="Auth"
          validationMessage={form.errors.name?.message}
          {...form.register('name')}
        />
        <TextInputField
          label="GitHub Repository Url"
          placeholder="https://github.com/exobase/example"
          validationMessage={form.errors.repository?.message}
          {...form.register('repository')}
        />
        <TextInputField
          label="Branch Name"
          placeholder="deploy-production"
          validationMessage={form.errors.branch?.message}
          {...form.register('branch')}
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
          Create
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


const ServiceTypeForm = ({
  onSelect,
  onBack
}: {
  onSelect: (type: t.ExobaseService) => void
  onBack: () => void
}) => {
  const select = (type: t.ExobaseService) => () => onSelect(type)
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
        <GridChoice onClick={select('api')}>
          <Text textAlign='center'>Static<br />Website</Text>
        </GridChoice>
        <GridChoice onClick={select('api')}>
          <Text textAlign='center'>API</Text>
        </GridChoice>
        <GridChoice onClick={select('api')}>
          <Text textAlign='center'>Websocket<br />Server</Text>
        </GridChoice>
        <GridChoice onClick={select('app')}>
          <Text textAlign='center'>SPA App</Text>
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


const LanguageForm = ({
  onSelect,
  onBack
}: {
  onSelect: (language: t.Language) => void
  onBack: () => void
}) => {
  const select = (lang: t.Language) => () => onSelect(lang)
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
        <GridChoice onClick={select('javascript')}>
          <Text textAlign='center'>Javascript</Text>
        </GridChoice>
        <GridChoice onClick={select('typescript')}>
          <Text textAlign='center'>Typescript</Text>
        </GridChoice>
        <GridChoice onClick={select('python')}>
          <Text textAlign='center'>Python</Text>
        </GridChoice>
        <GridChoice onClick={select('swift')}>
          <Text textAlign='center'>Swift</Text>
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


const CloudServiceForm = ({
  serviceType,
  provider,
  onSelect,
  onBack
}: {
  serviceType: t.ExobaseService
  provider: t.CloudProvider
  onSelect: (service: t.CloudService) => void
  onBack: () => void
}) => {
  const select = (service: t.CloudService) => () => onSelect(service)
  const PROVIDER_SERVICE_TYPE = {
    aws: {
      api: [{
        key: 'lambda',
        label: 'Lambda'
      }, {
        key: 'ec2',
        label: 'EC2'
      }, {
        key: 'ecs',
        label: 'ECS'
      }],
      'websocket-server': [{
        key: 'lambda',
        label: 'Lambda'
      }, {
        key: 'ecs',
        label: 'ECS'
      }, {
        key: 'ec2',
        label: 'EC2'
      }]
    },
    vercel: {
      api: [{
        key: 'functions',
        label: 'Functions'
      }],
      'spa-app': [{
        key: 'app',
        label: 'app'
      }]
    }
  } as any as Record<t.CloudProvider, Record<t.ExobaseService, { key: t.CloudService, label: string }[]>>
  const options = PROVIDER_SERVICE_TYPE[provider][serviceType]
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
        {options.map(({ key, label }) => (
          <GridChoice key={key} onClick={select(key)}>
            <Text textAlign='center'>{label}</Text>
          </GridChoice>
        ))}
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


const StackConfigForm = ({
  stackConfig,
  onSubmit,
  onBack
}: {
  stackConfig: t.StackConfig
  onSubmit: (config: any) => void
  onBack: () => void
}) => {

  const yupSchemaForInputType = (type: t.StackConfigInputType) => {
    if (type === 'function-route') {
      return yup.string().matches(/^\w+?\.\w+?$/, {
        excludeEmptyString: true,
        message: 'Requires {module}.{function} format'
      }).required('Field is required')
    }
    return yup.mixed()
  }

  const schema = stackConfig.inputs.reduce((acc, input) => ({
    ...acc, [input.key]: yupSchemaForInputType(input.type)
  }), {})

  const defaults = stackConfig.inputs.reduce((acc, input) => ({
    ...acc, [input.key]: input.init
  }), {})

  const form = useFormation(schema, defaults)

  const getConfigInputComponent = (type: t.StackConfigInputType) => {
    if (type === 'function-route') return TextInputField
    return TextInputField
  }

  const inputs = stackConfig.inputs.map(input => ({
    ...input,
    Component: getConfigInputComponent(input.type)
  }))

  return (
    <>
      <Pane width='100%' marginTop={majorScale(2)}>
        {inputs.map((input) => (
          <input.Component
            key={input.key}
            marginTop={majorScale(3)}
            label={input.label}
            hint={(
              <Link href={input.infoLink ?? '#'}>learn more</Link>
            )}
            description={input.description}
            placeholder={input.placeholder}
            validationMessage={(form.errors as any)[input.key]?.message}
            {...form.register(input.key as any as never)}
          />
        ))}
      </Pane>
      <Split>
        <Button onClick={onBack}>
          Back
        </Button>
        <Pane flex={1} />
        <Button
          onClick={form.createHandler(onSubmit)}
          appearance='primary'
        >
          Next
        </Button>
      </Split>
    </>
  )
}