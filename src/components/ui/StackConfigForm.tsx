/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import * as t from '../../types'
import {
  Pane,
  majorScale,
} from 'evergreen-ui'
import {
  EnvironmentVariableForm,
  CloseablePane
} from '../ui'
import StackForm from '../stacks/Form'


export default function StackConfigForm({
  value,
  platformName,
  serviceName,
  stack,
  onStackConfigChange,
  onEnvVarChange
}: {
  value: t.ServiceConfig
  platformName: string
  serviceName: string
  stack: t.StackKey
  onStackConfigChange?: (update: {
    isValid: boolean
    config: t.AnyStackConfig
  }) => void
  onEnvVarChange?: (envvars: t.EnvironmentVariable[]) => void
}) {

  const [envVars, setEnvVars] = useState<t.EnvironmentVariable[]>(value.environmentVariables ?? [{
    name: '',
    value: '',
    isSecret: false
  }])

  const handleEnvVarsChange = async (newEnvVars: t.EnvironmentVariable[]) => {
    setEnvVars(newEnvVars)
    onEnvVarChange?.(newEnvVars.filter(e => (e.name?.length ?? 0) > 0))
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
            value: `${platformName}`,
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
        <StackForm
          stack={stack}
          value={value.stack}
          onChange={onStackConfigChange}
        />
      </CloseablePane>
    </Pane>
  )
}
