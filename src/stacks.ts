import * as t from './types'

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

const stackConfigs: t.StackConfig[] = [{
  stack: 'websocket-server:aws:lambda',
  inputs: [{
    label: 'Connect Route',
    description: 'Which function should be called to register a new webscoket connection?',
    infoLink: '',
    key: 'connectRoute',
    type: 'handler',
    placeholder: 'main.onConnect',
    init: ''
  }, {
    label: 'Disconnect Route',
    description: 'Which function should be called to handle the disconnect of an existing webscoket connection?',
    infoLink: '',
    key: 'disconnectRoute',
    type: 'handler',
    placeholder: 'main.onDisconnect',
    init: ''
  }, {
    label: 'Default Route',
    description: 'Which function should be called if no other lambda functions match the \'action\' parameter in the request?',
    infoLink: '',
    key: 'defaultRoute',
    type: 'handler',
    placeholder: 'main.onDefault',
    init: ''
  }]
}, {
  stack: 'api:aws:lambda',
  inputs: [{
    label: 'Timeout',
    description: 'How long should a lambda function be allowed to run before AWS terminates the connection?',
    infoLink: '',
    key: 'timeout',
    type: 'number',
    placeholder: '60',
    init: '60'
  }, {
    label: 'Memory',
    description: 'How much memory should each function in this service be allocated when responding to requests?',
    infoLink: '',
    key: 'memory',
    type: 'number',
    placeholder: '300',
    init: '300'
  }]
}]

export const stackConfigDefaults = (stackConfig: t.StackConfig) => {
  return stackConfig.inputs.reduce((acc, input) => ({
    ...acc, [input.key]: input.init
  }), {})
}

export const STACK_CONFIGS = stackConfigs.reduce((acc, config) => ({ 
  ...acc, 
  [config.stack]: config 
}), {} as Record<t.ExobaseServiceKey, t.StackConfig>)