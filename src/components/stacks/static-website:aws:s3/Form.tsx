import * as t from '../../../types'
import {
  Pane,
  TextInputField,
  majorScale,
  Link,
} from 'evergreen-ui'
import { useFormation } from '../../../hooks'
import * as yup from 'yup'


export const defaultConfig: t.StaticWebsiteAWSS3StackConfig = {
  stack: 'static-website:aws:s3',
  distDir: 'dist',
  buildCommand: 'yarn build',
  preBuildCommand: 'yarn'
}

Form.defaultConfig = defaultConfig

export default function Form({
  value,
  onChange
}: {
  value: t.StaticWebsiteAWSS3StackConfig
  onChange?: (update: {
    config: t.StaticWebsiteAWSS3StackConfig,
    isValid: boolean
  }) => void
}) {

  const form = useFormation({
    distDir: yup.string().required(),
    buildCommand: yup.string().required(),
    preBuildCommand: yup.string()
  }, value as Omit<t.StaticWebsiteAWSS3StackConfig, 'stack'>)

  const handleChange = async () => {
    const isValid = await form.trigger()
    const values = form.watch()
    onChange?.({
      isValid,
      config: {
        stack: 'static-website:aws:s3',
        distDir: values.distDir,
        buildCommand: values.buildCommand,
        preBuildCommand: values.preBuildCommand
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
        label='Distribution Directory'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          Which directory in the project should be used as the 
          source of the hosted static files? Use relative files 
          from the project root directory. Use '.' to specify the 
          root directory.
        `}
        {...register('distDir')}
      />
      <TextInputField
        marginTop={majorScale(3)}
        label='Pre-Build Command'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          Optionally, specify a command to run before the build 
          command is run. Typically used to install dependencies. 
          Command is run from the project\'s root directory.
        `}
        {...register('preBuildCommand')}
      />
      <TextInputField
        required
        marginTop={majorScale(3)}
        label='Build Command'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          Optionally, specify a command to build the static files 
          from the project source. Command is run from the project's 
          root directory.
        `}
        {...register('buildCommand')}
      />
    </Pane>
  )
}