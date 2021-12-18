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
    type: 'function-route',
    placeholder: 'main.onConnect',
    init: ''
  }, {
    label: 'Disconnect Route',
    description: 'Which function should be called to handle the disconnect of an existing webscoket connection?',
    infoLink: '',
    key: 'disconnectRoute',
    type: 'function-route',
    placeholder: 'main.onDisconnect',
    init: ''
  }, {
    label: 'Default Route',
    description: 'Which function should be called if no other lambda functions match the \'action\' parameter in the request?',
    infoLink: '',
    key: 'defaultRoute',
    type: 'function-route',
    placeholder: 'main.onDefault',
    init: ''
  }]
}]

export const STACK_CONFIGS = stackConfigs.reduce((acc, config) => ({ 
  ...acc, 
  [config.stack]: config 
}), {} as Record<t.ExobaseServiceKey, t.StackConfig>)