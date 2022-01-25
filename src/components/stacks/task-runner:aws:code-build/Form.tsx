import * as t from '../../../types'
import {
  Pane,
  TextInputField,
  majorScale,
  Link,
} from 'evergreen-ui'
import { SwitchInputField } from '../../ui'
import { useFormation } from '../../../hooks'
import * as yup from 'yup'


export const defaultConfig: t.TaskRunnerAWSCodeBuildStackConfig = {
  stack: 'task-runner:aws:code-build',
  buildTimeoutSeconds: 5,
  useBridgeApi: true,
  dockerImage: 'node:16',
  buildCommand: 'yarn build',
  bridgeApiKey: 'CHANGE_THIS'
}

Form.defaultConfig = defaultConfig

export default function Form({
  value,
  onChange
}: {
  value: t.TaskRunnerAWSCodeBuildStackConfig
  onChange?: (update: {
    config: t.TaskRunnerAWSCodeBuildStackConfig,
    isValid: boolean
  }) => void
}) {

  const form = useFormation({
    buildTimeoutSeconds: yup.number().min(0).max(200).required(),
    useBridgeApi: yup.boolean().required(),
    buildCommand: yup.string().required(),
    dockerImage: yup.string().required(),
    bridgeApiKey: yup.string().when('useBridgeApi', {
      is: true,
      then: yup.string().required()
    })
  }, value as Omit<t.TaskRunnerAWSCodeBuildStackConfig, 'stack'>)

  const values = form.watch()

  const handleChange = async () => {
    const isValid = await form.trigger()
    const values = form.watch()
    onChange?.({
      isValid,
      config: {
        stack: 'task-runner:aws:code-build',
        buildTimeoutSeconds: values.buildTimeoutSeconds,
        useBridgeApi: values.useBridgeApi,
        dockerImage: values.dockerImage,
        buildCommand: values.buildCommand,
        bridgeApiKey: values.bridgeApiKey
      }
    })
  }

  const register = (name: t.ArgumentTypes<typeof form.register>[0]) => {
    const props = form.register(name)
    return {
      ...props,
      onChange: (e: any) => {
        props.onChange(e)
        handleChange()
      },
      validationMessage: form.errors[name]?.message
    }
  }

  return (
    <Pane width='100%' marginTop={majorScale(2)}>
      <TextInputField
        required
        label='Timeout'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          How long should AWS Code Build wait until it considers 
          a build failed and kills it? Value is in minutes between 
          5-300.
        `}
        {...register('buildTimeoutSeconds')}
      />
      <TextInputField
        marginTop={majorScale(3)}
        label='Build Command'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          Which command should be run to execute the build? 
          Command is run from the project's root directory.
        `}
        {...register('buildCommand')}
      />
      <TextInputField
        marginTop={majorScale(3)}
        label='Docker Image'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          You can specify a custom docker image to run your
          builds on.
        `}
        {...register('dockerImage')}
      />
      <SwitchInputField
        marginTop={majorScale(3)}
        label='Bridge API'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          Do you want Exobase to deploy a bridge API that will 
          exopose an https endpoint for you to call to trigger 
          builds?
        `}
        {...register('useBridgeApi')}
        ref={undefined}
        boolValue={values.useBridgeApi}
        onBoolChange={(isOn: boolean) => {
          form.setValue('useBridgeApi', isOn, { shouldDirty: true })
        }}
      />
      <TextInputField
        required={values.useBridgeApi === true}
        disabled={values.useBridgeApi === false}
        marginTop={majorScale(3)}
        paddingLeft={majorScale(3)}
        label='Bridge API Key'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          Required if you choose to deploy the bridge API. We'll use 
          this value as the api key in the trigger/build endpoint.
        `}
        {...register('bridgeApiKey')}
      />
    </Pane>
  )
}