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
import { Header, Sidebar } from '../ui'
import { currentEnvironmentState, currentPlatformState, idTokenState } from '../../state/app'
import { useFetch, useFormation } from '../../hooks'
import * as api from '../../api'
import * as yup from 'yup'



type Step = 'language'
  | 'service-type'
  | 'cloud-provider'
  | 'provider-service'
  | 'config'


export default function CreateServiceScene() {

  const [step, setStep] = useState<Step>('language')
  const [serviceType, setServiceType] = useState<t.ExobaseService | null>(null)
  const [cloudProvider, setCloudProvider] = useState<t.CloudProvider | null>(null)
  const [cloudService, setCloudService] = useState<t.CloudService | null>(null)
  const [language, setLanguage] = useState<t.Language | null>(null)
  const navigate = useNavigate()
  const idToken = Recoil.useRecoilValue(idTokenState)
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)
  const currentProject = Recoil.useRecoilValue(currentEnvironmentState)
  const createService = useFetch(api.createService)

  const title = (() => {
    if (step === 'language') return 'What language is your service written in?'
    if (step === 'cloud-provider') return 'Where should we deploy it?'
    if (step === 'config') return 'A Few Details'
    if (step === 'service-type') return 'What do you want to make?'
    if (step === 'provider-service') return 'What service do you want to run on?'
  })()

  const subtitle = (() => {
    if (step === 'cloud-provider') return 'Where should we deploy it?'
    if (step === 'config') return 'A Few Details'
    if (step === 'service-type') return 'What do you want to make?'
  })()

  const handleLanguage = (l: t.Language) => {
    setLanguage(l)
    setStep('service-type')
  }

  const handleServiceType = (st: t.ExobaseService) => {
    setServiceType(st)
    setStep('cloud-provider')
  }

  const handleCloudProvider = (cp: t.CloudProvider) => {
    setCloudProvider(cp)
    setStep('provider-service')
  }

  const handleCloudService = (cs: t.CloudService) => {
    setCloudService(cs)
    setStep('config')
  }

  const submit = async (config: ConfigData) => {

    if (!currentPlatform || !currentProject) return

    const { error } = await createService.fetch({
      idToken: idToken!,
      service: {
        name: config.name,
        source: {
          repository: config.repository,
          branch: config.branch
        },
        service: cloudService!,
        language: language!,
        type: serviceType!,
        provider: cloudProvider!
      }
    })

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

  return (
    <Pane>
      <Header />
      <Split flex={1}>
        <Sidebar />
        <Center
          flex={1}
          backgroundColor='#F2F2F2'
          minHeight={'100vh'}
          paddingX={majorScale(4)}
          paddingTop={majorScale(4)}
        >
          <Pane
            maxWidth='500px'
          >
            <Pane>
              <Heading flex={1} size={800}>{title}</Heading>
              <Paragraph>
                Create a new service in the <Strong>{currentProject?.name}</Strong> environment of the <Strong>{currentPlatform?.name}</Strong> platform.
              </Paragraph>
            </Pane>
            {step === 'language' && (
              <LanguageForm
                onSelect={handleLanguage}
                onBack={cancel}
              />
            )}
            {step === 'service-type' && (
              <ServiceTypeForm
                onSelect={handleServiceType}
                onBack={() => setStep('language')}
              />
            )}
            {step === 'cloud-provider' && (
              <CloudProviderForm
                onSelect={handleCloudProvider}
                onBack={() => setStep('service-type')}
              />
            )}
            {step === 'provider-service' && (
              <CloudServiceForm
                serviceType={serviceType!}
                provider={cloudProvider!}
                onSelect={handleCloudService}
                onBack={() => setStep('cloud-provider')}
              />
            )}
            {step === 'config' && (
              <ConfigForm
                onBack={() => setStep('cloud-provider')}
                onSubmit={submit}
              />
            )}
          </Pane>
        </Center>
      </Split>
    </Pane>
  )
}


type ConfigData = {
  name: string
  repository: string
  branch: string
}

function ConfigForm({
  onSubmit,
  onBack
}: {
  onSubmit: (config: ConfigData) => void
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

  const handleSubmit = (formData: ConfigData) => {
    onSubmit(formData)
  }

  return (
    <>
      <Pane marginTop={majorScale(2)}>
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
      backgroundColor="#FFFFFF"
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
        flex={1}
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
        <GridChoice onClick={select('heroku')}>
          <Text>Heroku</Text>
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
        flex={1}
        display='grid'
        gridTemplateColumns={`repeat(3, 1fr)`}
        columnGap={majorScale(4)}
        rowGap={majorScale(4)}
        paddingTop={majorScale(4)}
        paddingBottom={majorScale(4)}
      >
        <GridChoice onClick={select('static-website')}>
          <Text textAlign='center'>Static<br />Website</Text>
        </GridChoice>
        <GridChoice onClick={select('api')}>
          <Text textAlign='center'>API</Text>
        </GridChoice>
        <GridChoice onClick={select('websocket-server')}>
          <Text textAlign='center'>Websocket<br />Server</Text>
        </GridChoice>
        <GridChoice onClick={select('spa-app')}>
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
        flex={1}
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
        flex={1}
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