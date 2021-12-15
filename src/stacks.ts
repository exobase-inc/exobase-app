

export const STACKS = {
  'api': [
    {
      provider: 'aws',
      service: 'lambda'
    }, {
      provider: 'aws',
      service: 'ec2'
    }, {
      provider: 'aws',
      service: 'ecs'
    }, {
      provider: 'gcp',
      service: 'gcf'
    }, {
      provider: 'gcp',
      service: 'gce'
    }, {
      provider: 'gcp',
      service: 'gke'
    }, {
      provider: 'vercel',
      service: 'serverless-functions'
    }, {
      provider: 'digital-ocean',
      service: ''
    }, {
      provider: 'heroku',
      service: ''
    }, {
      provider: 'netlify',
      service: 'functions'
    }
  ]
}