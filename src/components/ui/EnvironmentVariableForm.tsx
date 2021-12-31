import _ from 'radash'
import {
  Pane,
  Button,
  majorScale,
  Text,
  TextInput,
  Switch,
  IconButton,
} from 'evergreen-ui'
import { Split } from '../layout'
import * as t from '../../types'
import { HiMinus, HiPlus } from 'react-icons/hi'


type EnvVar = t.EnvironmentVariable & {
  id: string
}

const toStars = (value: string) => {
  if (!value) return ''
  return _.range(0, value.length).map(x => '').join('*')
}

export default function EnvironmentVariableForm({
  hideHeader = false,
  values,
  hideSecrets = false,
  disabled = false,
  onChange
}: {
  hideHeader?: boolean
  values: t.EnvironmentVariable[]
  hideSecrets?: boolean
  disabled?: boolean
  onChange?: (envars: t.EnvironmentVariable[]) => void
}) {

  const vars: EnvVar[] = values.map((v, i) => ({
    ...v,
    id: `id_${i}`
  }))

  const addNew = () => {
    onChange?.([...values, {
      name: '',
      value: '',
      isSecret: false
    }])
  }

  const handleChange = (original: EnvVar) => (envvar: EnvVar) => {
    onChange?.(vars.map(v => v.id === original.id ? envvar : v))
  }

  const remove = (envvar: EnvVar) => () => {
    onChange?.(vars.filter(v => v.id !== envvar.id))
  }

  return (
    <Pane>
      {!hideHeader && (
        <Split>
          <Text flex={1}>Name</Text>
          <Text flex={1}>Value</Text>
          <Text marginRight={disabled ? 0 : majorScale(2)}>Secret</Text>
          {!disabled && (
            <IconButton
              icon={<HiMinus />}
              visibility='hidden'
            />
          )}
        </Split>
      )}
      {vars.map((value) => (
        <EnvironmentVariableField
          key={value.id}
          envvar={value}
          hideSecrets={hideSecrets}
          onChange={handleChange(value)}
          disabled={disabled}
          onRemove={remove(value)}
        />
      ))}
      {!disabled && (
        <Split justifyContent='flex-end'>
          <Button
            iconBefore={<HiPlus />}
            appearance='minimal'
            onClick={addNew}
          >
            Add Variable
          </Button>
        </Split>
      )}
    </Pane>
  )
}

const EnvironmentVariableField = ({
  envvar,
  disabled = false,
  hideSecrets = false,
  onRemove,
  onChange
}: {
  envvar: EnvVar
  hideSecrets?: boolean
  disabled?: boolean
  onChange?: (envvar: EnvVar) => void
  onRemove?: () => void
}) => {
  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.({
      ...envvar,
      name: e.target.value
    })
  }
  const handleValueChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.({
      ...envvar,
      value: e.target.value
    })
  }
  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      ...envvar,
      isSecret: e.target.checked
    })
  }
  return (
    <Split
      alignItems='center'
      marginBottom={majorScale(1)}
    >
      <TextInput
        flex={1}
        onChange={handleNameChange}
        value={envvar.name}
        disabled={disabled}
        marginRight={majorScale(2)}
      />
      <TextInput
        flex={1}
        onChange={handleValueChange}
        value={(hideSecrets && envvar.isSecret) ? toStars(envvar.value) : envvar.value}
        disabled={disabled}
        marginRight={majorScale(2)}
      />
      <Switch
        disabled={disabled}
        onChange={handleSecretChange}
        checked={envvar.isSecret}
        marginRight={(disabled || !onRemove) ? 0 : majorScale(2)}
      />
      {!disabled && onRemove && (
        <IconButton
          icon={<HiMinus />}
          appearance={'primary'}
          intent={'danger'}
          onClick={onRemove}
        />
      )}
    </Split>
  )
}