import * as t from '../../types'
import StaticWebsiteAWSS3ConfigForm from '../stacks/static-website:aws:s3/Form'
import ApiAWSLambdaConfigForm from '../stacks/api:aws:lambda/Form'
import TaskRunnerAWSCodeBuildConfigForm from '../stacks/task-runner:aws:code-build/Form'


export default function Form({
  stack,
  value,
  onChange
}: {
  stack: t.StackKey
  value?: t.AnyStackConfig
  onChange?: (update: { 
    config: t.AnyStackConfig, 
    isValid: boolean 
  }) => void
}) {
  if (stack === 'api:aws:lambda') return (
    <ApiAWSLambdaConfigForm
      value={(value as t.ApiAWSLambdaStackConfig) ?? ApiAWSLambdaConfigForm.defaultConfig}
      onChange={onChange}
    />
  )
  if (stack === 'static-website:aws:s3') return (
    <StaticWebsiteAWSS3ConfigForm
      value={(value as t.StaticWebsiteAWSS3StackConfig) ?? StaticWebsiteAWSS3ConfigForm.defaultConfig}
      onChange={onChange}
    />
  )
  if (stack === 'task-runner:aws:code-build') return (
    <TaskRunnerAWSCodeBuildConfigForm
      value={(value as t.TaskRunnerAWSCodeBuildStackConfig) ?? TaskRunnerAWSCodeBuildConfigForm.defaultConfig}
      onChange={onChange}
    />
  )
  return null
}
