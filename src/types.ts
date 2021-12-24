import * as t from '@exobase/client-js'

export interface EntityIdentifier {
  id: string
  label: string
}

export type Language = t.Language
export type CloudProvider = t.CloudProvider
export type CloudService = t.CloudService
export type ExobaseService = t.ExobaseService
export type StackKey = t.StackKey
export type ExobaseServiceKey = t.ExobaseServiceKey
export type DeploymentStatus = t.DeploymentStatus

export type Domain = {
  id: string
  platformId: string
  domain: string
  provider: CloudProvider
  latestDeploymentId: string | null
}

export type ServiceSource = t.ServiceSource

export type Platform = t.Platform

export interface PlatformPreview {
  id: string
  name: string
}

export type Service = t.Service

export type Deployment = t.Deployment

export type DomainDeployment = {
  id: string
  platformId: string
  domainId: string
  startedAt: number
  finishedAt: number | null
  status: DeploymentStatus
  ledger: DeploymentLedgerItem[]
  logs: string
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