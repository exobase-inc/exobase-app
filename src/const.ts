import * as t from './types'


export const PROVIDER_LOGOS: Record<t.CloudProvider, string> = {
  'aws': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1200px-Amazon_Web_Services_Logo.svg.png',
  'vercel': 'https://logovtor.com/wp-content/uploads/2020/10/vercel-inc-logo-vector.png',
  'gcp': 'data:image/png;base64,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',
  'heroku': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Heroku_logo.svg/2560px-Heroku_logo.svg.png'
} as Record<t.CloudProvider, string>

export const CLOUD_SERVICE_LOGOS: Record<t.CloudService, string> = {
  'lambda': 'https://cdn.worldvectorlogo.com/logos/aws-lambda-1.svg',
  'ec2': 'https://cdn.worldvectorlogo.com/logos/aws-ec2.svg',
  'ecs': 'https://cdn-boeab.nitrocdn.com/wIHbutmjexPJyeFpJDOeteQCpxUFwjzf/assets/static/optimized/rev-d7b5fdf/wp-content/uploads/2019/05/Compute_AmazonECS_LARGE2-273x300.png',
  'cloud-run': 'https://seeklogo.com/images/G/google-cloud-run-logo-895F1305FF-seeklogo.com.png',
  'cloud-function': 'https://seeklogo.com/images/G/google-cloud-functions-logo-AECD57BFA2-seeklogo.com.png'
}

export const PROVIDER_AUTH = {
  'vercel': [{
    label: 'Token',
    name: 'token'
  }],
  'aws': [{
    label: 'Client Id',
    name: 'clientId'
  }, {
    label: 'Client Secret',
    name: 'clientSecret'
  }],
  'gcp': [{
    label: 'JSON Credentials',
    name: 'jsonCredentials'
  }]
}