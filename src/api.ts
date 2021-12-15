import _ from 'radash'
import config from './config'
import * as t from './types'


export interface ApiError {
  message: string
  details: string
}

export interface ApiResponse<T> {
  error: ApiError | null
  data: T
}

const networkError = {
  message: 'Network Error',
  details: 'We\'re not sure whats wrong, there was an issue using the network.'
}

//
//
// HOW TO FETCH
//
//

export default async function fetcher<T = any>(endpoint: string, options: RequestInit): Promise<[ApiError | null, T | null]> {
  const { apiUrl } = config
  const [netErr, response] = await _.tryit<Response>(fetch)(`${apiUrl}${endpoint}`, {
    ...options,
    method: 'POST',
    headers: {
      ...options?.headers,
      'content-type': 'application/json'
    }
  })
  if (netErr || !response) return [networkError, null]
  const [parseErr, json] = await _.tryit<any>(() => response.json())()
  if (parseErr) return [networkError, null]
  if (json.error) {
    console.error(json.error)
    return [json.error, null]
  }
  return [null, json]
}


//
//
// API FUNCTIONS
//
//

export async function loginOrCreateUser({
  didToken
}: {
  didToken: string
}): Promise<ApiResponse<{
  user: t.User
  idToken: string
  exp: number
  platformId: string
  environmentId: string
  platforms: t.PlatformPreview[]
}>> {
  const [error, json] = await fetcher('/auth/loginOrCreateUser', {
    headers: {
      'Authorization': `Bearer ${didToken}`
    },
    body: JSON.stringify({
      didToken
    })
  })
  return { error, data: json?.result }
}

export async function getPlatformById({
  idToken,
  platformId
}: {
  idToken: string
  platformId: string
}): Promise<ApiResponse<{
  platform: t.Platform
}>> {
  const [error, json] = await fetcher('/platforms/getPlatformById', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      id: platformId
    })
  })
  return { error, data: json?.result }
}

export async function listPlatformsForUser({
  idToken
}: {
  idToken: string
}): Promise<ApiResponse<{
  platforms: t.Platform[]
}>> {
  const [error, json] = await fetcher('/platforms/listPlatformsForUser', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({})
  })
  return { error, data: json?.result }
}

export async function createService({
  idToken,
  service
}: {
  idToken: string
  service: {
    name: string
    type: t.ExobaseService
    provider: t.CloudProvider
    service: t.CloudService
    language: t.Language
    source: {
      repository: string
      branch: string
    }
  }
}): Promise<ApiResponse<{
  service: t.Service
}>> {
  const [error, json] = await fetcher('/platforms/createService', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      ...service
    })
  })
  return { error, data: json?.result }
}

export async function deployService({
  idToken,
  serviceId,
  instanceId
}: {
  idToken: string
  serviceId: string
  instanceId: string
}): Promise<ApiResponse<{
  service: t.Service
}>> {
  const [error, json] = await fetcher('/platforms/deployService', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      serviceId,
      instanceId
    })
  })
  return { error, data: json?.result }
}

export async function updateProviderConfig({
  idToken,
  provider,
  config: providerConfig
}: {
  idToken: string
  provider: t.CloudProvider
  config: t.VercelProviderConfig | t.GCPProviderConfig | t.AWSProviderConfig
}): Promise<ApiResponse<{
  message: string
}>> {
  const [error, json] = await fetcher('/platforms/updateProviderConfig', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      provider, 
      config: providerConfig
    })
  })
  return { error, data: json?.result }
}
