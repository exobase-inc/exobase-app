import * as t from '@exobase/client-js'

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never

export interface EntityIdentifier {
  id: string
  label: string
}

export type KeyValue = {
  key: string
  value: string
}

export type Language = t.Language
export type CloudProvider = t.CloudProvider
export type CloudService = t.CloudService
export type ExobaseService = t.ExobaseService
export type DeploymentStatus = t.DeploymentStatus
export type Domain = t.Domain
export type Platform = t.Platform
export type Unit = t.Unit
export type Deployment = t.Deployment
export type User = t.User
export type Workspace = t.Workspace
export type BuildPackage = t.BuildPackage
export type BuildPackageRef = t.BuildPackageRef
export type AWSProvider = t.AWSProvider

export interface EnvironmentVariable {
  name: string
  value: string
  isSecret: boolean
}

export type ServiceSource = {
  installationId: string | null
  private: boolean
  repoId: string
  owner: string
  repo: string
  branch: string
  provider: 'github'
}