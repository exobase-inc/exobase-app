/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import * as t from '../../types'
import {
  Pane,
  TextInputField,
  majorScale,
  Link,
} from 'evergreen-ui'
import { useFormation } from '../../hooks'
import * as yup from 'yup'
import {
  EnvironmentVariableForm,
  CloseablePane
} from '../ui'


export default function StackConfigForm({
  value,
  platform,
  serviceName,
  stackConfig,
  onChange
}: {
  value: t.ServiceConfig
  platform: t.Platform
  serviceName: string
  stackConfig: t.StackConfig
  onChange?: (config: t.ServiceConfig) => void
}) {

  const [envVars, setEnvVars] = useState<t.EnvironmentVariable[]>(value.environmentVariables ?? [{
    name: '',
    value: '',
    isSecret: false
  }])

  const yupSchemaForInputType = (type: t.StackConfigInputType) => {
    if (type === 'handler') {
      return yup.string().matches(/^\w+?\.\w+?$/, {
        excludeEmptyString: true,
        message: 'Requires {module}.{function} format'
      }).required('Field is required')
    }
    if (type === 'number') {
      return yup.number().min(0)
    }
    return yup.mixed()
  }

  const schema = stackConfig.inputs.reduce((acc, input) => ({
    ...acc, [input.key]: yupSchemaForInputType(input.type)
  }), {})

  const form = useFormation(schema, value.stack ?? {})
  const formValue = form.watch()

  const getConfigInputComponent = (type: t.StackConfigInputType) => {
    if (type === 'handler') return TextInputField
    if (type === 'number') return TextInputField
    return TextInputField
  }

  const inputs = stackConfig.inputs.map(input => ({
    ...input,
    Component: getConfigInputComponent(input.type)
  }))

  const handleStackConfigChange = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      return
    }
    onChange?.({
      type: stackConfig.stack,
      environmentVariables: envVars.filter(e => (e.name?.length ?? 0) > 0),
      stack: formValue as Record<string, string | number | boolean>
    })
  }

  const handleEnvVarsChange = async (newEnvVars: t.EnvironmentVariable[]) => {
    setEnvVars(newEnvVars)
    const isValid = await form.trigger()
    if (!isValid) {
      return
    }
    onChange?.({
      type: stackConfig.stack,
      environmentVariables: newEnvVars.filter(e => (e.name?.length ?? 0) > 0),
      stack: formValue as Record<string, string | number | boolean>
    })
  }

  return (
    <Pane marginTop={majorScale(3)}>
      <CloseablePane
        initOpen={true}
        label='Environment Variables'
      >
        <EnvironmentVariableForm
          values={envVars}
          onChange={handleEnvVarsChange}
        />
      </CloseablePane>
      <CloseablePane
        label='Default Variables'
        marginTop={majorScale(3)}
      >
        <EnvironmentVariableForm
          disabled
          values={[{
            name: 'EXOBASE_MODULE',
            value: '{{module}}',
            isSecret: false
          }, {
            name: 'EXOBASE_FUNCTION',
            value: '{{function}}',
            isSecret: false
          }, {
            name: 'EXOBASE_PLATFORM',
            value: `${platform.name}`,
            isSecret: false
          }, {
            name: 'EXOBASE_SERVICE',
            value: `${serviceName}`,
            isSecret: false
          }]}
        />
      </CloseablePane>
      <CloseablePane
        label='Advanced Configuration'
        marginTop={majorScale(3)}
      >
        <Pane width='100%' marginTop={majorScale(2)}>
          {inputs.map((input) => {
            const props = form.register(input.key as any as never)
            const overrideProps = {
              ...props,
              onChange: (e: any) => {
                props.onChange(e)
                handleStackConfigChange()
              }
            }
            return (
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
                {...overrideProps}
              />
            )
          })}
        </Pane>
      </CloseablePane>
    </Pane>
  )
}