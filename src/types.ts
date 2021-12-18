
export interface EntityIdentifier {
  id: string
  label: string
}

export type Language = 'typescript'
  | 'javascript'
  | 'python'
  | 'swift'

export type CloudProvider = 'aws'
  | 'gcp'
  | 'vercel'
  | 'azure'
  | 'netlify'
  | 'ibm'
  | 'heroku'

export type CloudService = 'lambda'
  | 'ec2'
  | 'ecs'
  | 'cloud-run'
  | 'cloud-function'

export type ExobaseService = 'api'
  | 'app'
  | 'websocket-server'
  | 'static-website'
  | 'spa-app'

export type StackKey = `${ExobaseService}:${CloudProvider}:${CloudService}:${Language}`
export type ExobaseServiceKey = `${ExobaseService}:${CloudProvider}:${CloudService}`

export interface Platform {
  id: string
  name: string
  environments: Environment[]
  services: Service[]
  providers: {
    aws: {
      accessKeyId: '***************' | null
      accessKeySecret: '***************' | null
      region: string
      configured: boolean
    }
    gcp: GCPProviderConfig & {
      configured: boolean
    }
    vercel: VercelProviderConfig & {
      configured: boolean
    }
    heroku: HerokuProviderConfig & {
      configured: boolean
    }
  }
}

export interface PlatformPreview {
  id: string
  name: string
}

export interface Environment {
  id: string
  name: string
}

export interface Service {
  id: string
  name: string
  platformId: string
  provider: CloudProvider
  service: CloudService
  type: ExobaseService
  language: Language
  source: {
    repository: string
    branch: string
  }
  key: StackKey
  instances: ServiceInstance[]
}

export interface ServiceInstance {
  id: string
  serviceId: string
  environmentId: string
  mute: boolean
  config: Record<string, string | number>
  deployments: Deployment[]
  attributes: Record<string, string | number>
  latestDeploymentId: string | null
}

export type DeploymentStatus = 'queued'
  | 'canceled'
  | 'in_progress'
  | 'success'
  | 'partial_success'
  | 'failed'

export interface Deployment {
  id: string
  platformId: string
  serviceId: string
  environmentId: string
  instanceId: string
  startedAt: number
  finishedAt: number | null
  logs: string
  status: DeploymentStatus
  ledger: DeploymentLedgerItem[]
}

export interface DeploymentLedgerItem {
  status: DeploymentStatus
  timestamp: number
  source: string
}

export interface User {
  id: string
  email: string
}

export type VercelProviderConfig = {
  token: string
}

export type AWSProviderConfig = {
  accessKeyId: string
  accessKeySecret: string
  region: string
}

export type GCPProviderConfig = {
  jsonCredentials: string
}

export type HerokuProviderConfig = {

}

//
//  STACK CONFIGS
//

export type StackConfigInputType = 'function-route'

export interface StackConfig {
  stack: ExobaseServiceKey
  inputs: {
    label: string
    description: string
    infoLink: string
    key: string
    type: StackConfigInputType
    init: string | number | boolean
    placeholder?: string
  }[]
}