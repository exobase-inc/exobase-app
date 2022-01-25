import * as t from '../../types'
import StaticWebsiteAWSS3ConfigForm from '../stacks/static-website:aws:s3/Form'
import ApiAWSLambdaConfigForm from '../stacks/api:aws:lambda/Form'
import TaskRunnerAWSCodeBuildConfigForm from '../stacks/task-runner:aws:code-build/Form'


export const getDefaultStackConfig = (stack: t.StackKey) => {
  if (stack === 'api:aws:lambda') return ApiAWSLambdaConfigForm.defaultConfig
  if (stack === 'static-website:aws:s3') return StaticWebsiteAWSS3ConfigForm.defaultConfig
  if (stack === 'task-runner:aws:code-build') return TaskRunnerAWSCodeBuildConfigForm.defaultConfig
  return null
}