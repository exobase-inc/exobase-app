import * as t from '../../../types'
import {
  Pane,
  TextInputField,
  majorScale,
  Link,
} from 'evergreen-ui'
import { useFormation } from '../../../hooks'
import * as yup from 'yup'


export const defaultConfig: t.ApiAWSLambdaStackConfig = {
  stack: 'api:aws:lambda',
  timeout: 3,
  memory: 128
}

Form.defaultConfig = defaultConfig

export default function Form({
  value,
  onChange
}: {
  value: t.ApiAWSLambdaStackConfig
  onChange?: (update: {
    config: t.ApiAWSLambdaStackConfig,
    isValid: boolean
  }) => void
}) {

  const form = useFormation({
    timeout: yup.number().min(1).max(900).required(),
    memory: yup.number().min(0).max(10240).required()
  }, value as Omit<t.ApiAWSLambdaStackConfig, 'stack'>)

  const handleChange = async () => {
    const isValid = await form.trigger()
    const values = form.watch()
    onChange?.({
      isValid,
      config: {
        stack: 'api:aws:lambda',
        timeout: values.timeout,
        memory: values.memory
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
          How long should a lambda function be allowed to run before AWS 
          terminates the connection? Value is in seconds between 1-900.
        `}
        {...register('timeout')}
      />
      <TextInputField
        required
        marginTop={majorScale(3)}
        label='Memory'
        hint={(
          <Link href={'#'}>learn more</Link>
        )}
        description={`
          How much memory should each function in this service be 
          allocated when responding to requests? Value is in MB between 128-10,240.
        `}
        {...register('memory')}
      />
    </Pane>
  )
}