/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import * as t from '../../types'
import {
  Pane,
  majorScale,
  TextInputField,
} from 'evergreen-ui'
import {
  EnvironmentVariableForm,
  CloseablePane
} from '../ui'

export default function StackConfigForm({
  pack,
  config,
  platformName,
  serviceName,
  onChange
}: {
  pack: t.BuildPackageRef
  config: any
  platformName: string
  serviceName: string
  onChange?: (config: any) => void
}) {

  // Filter out exobase provided input variables
  const inputs = pack.version.inputs.filter(
    input => !input.name.startsWith('exo_')
  )

  const handleStringChange = (input: t.BuildPackageRef['version']['inputs'][0]): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    onChange?.({
      ...config,
      [input.name]: event.target.value
    })
  }
  
  const handleNumberChange = (input: t.BuildPackageRef['version']['inputs'][0]): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    const val = event.target.value
    const includesNonNumber = /[^\d]/.exec(val)
    if (includesNonNumber) return
    onChange?.({
      ...config,
      [input.name]: parseInt(val)
    })
  }

  const handleEnvironmentVarsChange = (input: t.BuildPackageRef['version']['inputs'][0]) => (envars: t.EnvironmentVariable[]) => {
    onChange?.({
      ...config,
      [input.name]: envars
    })
  }

  const handleBoolChange = (input: t.BuildPackageRef['version']['inputs'][0]): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    onChange?.({
      ...config,
      [input.name]: event.target.checked
    })
  }

  return (
    <Pane marginTop={majorScale(3)}>
      {inputs.map(input => (
        <div key={input.name}>
          {input.ui === 'string' && (
            <TextInputField 
              label={input.label}
              placeholder={input.placeholder ?? ''}
              value={config[input.name] ?? ''}
              onChange={handleStringChange(input)}
            />
          )}
          {input.ui === 'number' && (
            <TextInputField
              label={input.label}
              placeholder={input.placeholder ?? ''}
              value={config[input.name] ?? ''}
              onChange={handleNumberChange(input)}
            />
          )}
          {input.ui === 'bool' && (
            <>
              <input
                type="checkbox" 
                id={input.name} 
                name="scales" 
                checked={config[input.name] === true} 
                onChange={handleBoolChange(input)} 
              />
              <label htmlFor={input.name}>{input.label}</label>
            </>
          )}
          {input.ui === 'envars' && (
            <>
              <label>{input.label}</label>
              <EnvironmentVariableForm
                hideHeader
                values={config[input.name] ?? []}
                onChange={handleEnvironmentVarsChange(input)}
              />
            </>
          )}
        </div>
      ))}
    </Pane>
  )
}
