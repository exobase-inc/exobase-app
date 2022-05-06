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

export default function KeyValueForm({
  value,
  onChange
}: {
  value: t.KeyValue[]
  onChange?: (value: t.KeyValue[]) => void
}) {

  const addNew = () => {
    onChange?.([...value, { key: '', value: '' }])
  }

  const handleChange = (val: t.KeyValue, idx: number) => (newVal: t.KeyValue) => {
    onChange?.(_.replace(value, newVal, (v, i) => i === idx))
  }

  const remove = (val: t.KeyValue, idx: number) => () => {
    onChange?.(value.filter((v, i) => i === idx))
  }

  return (
    <Pane>
      <Split>
        <Text flex={1}>Name</Text>
        <Text flex={1}>Value</Text>
      </Split>
      {value.map((val, idx) => (
        <KeyValueField
          key={idx}
          value={{
            key: val.key, value: val.value
          }}
          onChange={handleChange(val, idx)}
          onRemove={remove(val, idx)}
        />
      ))}
      <Split justifyContent='flex-end'>
        <Button
          iconBefore={<HiPlus />}
          appearance='minimal'
          onClick={addNew}
        >
          Add
        </Button>
      </Split>
    </Pane>
  )
}

const KeyValueField = ({
  value,
  onRemove,
  onChange
}: {
  value: t.KeyValue
  onChange?: (kv: t.KeyValue) => void
  onRemove?: () => void
}) => {
  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.({
      key: e.target.value,
      value: value.value
    })
  }
  const handleValueChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.({
      value: e.target.value,
      key: value.key
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
        value={value.key}
        marginRight={majorScale(2)}
      />
      <TextInput
        flex={1}
        onChange={handleValueChange}
        value={value.value}
        marginRight={majorScale(2)}
      />
      <IconButton
        icon={<HiMinus />}
        appearance={'primary'}
        intent={'danger'}
        onClick={onRemove}
      />
    </Split>
  )
}