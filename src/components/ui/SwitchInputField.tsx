import * as t from '../../types'
import {
  TextInputField,
  FormField,
  Switch
} from 'evergreen-ui'


export default function SwitchInputField(props: t.ArgumentTypes<typeof TextInputField>[0] & {
  boolValue: boolean
  onBoolChange: (value: boolean) => void
}) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onBoolChange(e.target.checked)
  }
  return (
    <FormField
      labelFor={props.name}
      marginTop={props.marginTop}
      label={props.label}
      hint={props.hint}
      description={props.description}
      validationMessage={props.validationMessage}
      onBlur={props.onBlur}
      name={props.name}
      required={props.required}
      disabled={props.disabled}
    >
      <Switch
        name={props.name}
        checked={props.boolValue}
        onChange={onChange}
      />
    </FormField >
  )
}