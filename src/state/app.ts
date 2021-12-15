import { atom, selector } from 'recoil'
import * as t from '../types'


interface AppState {
  user: t.User | null
  idToken: string | null
  platforms: t.PlatformPreview[]
  currentPlatform: t.Platform | null
  currentPlatformId: string | null,
  currentEnvironmentId: string | null
}

export const appState = atom<AppState>({
  key: 'exo.state.app',
  default: {
    user: null,
    idToken: null,
    platforms: [],
    currentPlatform: null,
    currentPlatformId: null,
    currentEnvironmentId: null
  }
})

export const currentPlatformState = selector<t.Platform | null>({
  key: 'exo.state.app.current-platform',
  get: ({ get }) => {
    return get(appState).currentPlatform
  },
  set: ({ get, set }, currentPlatform: t.Platform | any) => {
    set(appState, {
      ...get(appState),
      currentPlatform
    })
  }
})

export const environmentListState = selector<t.Environment[]>({
  key: 'exo.state.app.environment-list',
  get: ({ get }) => {
    return get(currentPlatformState)?.environments ?? []
  }
})

export const currentEnvironmentIdState = selector<string>({
  key: 'exo.state.app.current-envrionment-id',
  get: ({ get }) => {
    return get(appState).currentEnvironmentId ?? ''
  },
  set: ({ get, set }, currentEnvironmentId: string | any) => {
    set(appState, {
      ...get(appState),
      currentEnvironmentId
    })
  }
})

export const currentPlatformIdState = selector<string>({
  key: 'exo.state.app.current-platform-id',
  get: ({ get }) => {
    return get(appState).currentPlatformId ?? ''
  },
  set: ({ get, set }, currentPlatformId: string | any) => {
    set(appState, {
      ...get(appState),
      currentPlatformId
    })
  }
})

export const currentEnvironmentState = selector<t.Environment | null>({
  key: 'exo.state.app.current-environment',
  get: ({ get }) => {
    const environmentId = get(currentEnvironmentIdState)
    const environmentList = get(environmentListState)
    return (environmentList ?? []).find(e => e.id === environmentId) ?? null
  },
  set: ({ get, set }, currentEnvironmentId: string | any) => {
    set(appState, {
      ...get(appState),
      currentEnvironmentId
    })
  }
})

export const currentServiceInstancesState = selector<t.ServiceInstance[]>({
  key: 'exo.state.app.current-service-instances',
  get: ({ get }) => {
    const environmentId = get(currentEnvironmentIdState)
    const platform = get(currentPlatformState)
    if (!platform) return []
    return platform.services.reduce((acc, service) => {
      const instance = service.instances.find(i => i.environmentId === environmentId)
      return instance ? [...acc, instance] : acc
    }, [] as t.ServiceInstance[])
  }
})

export const platformsState = selector<t.PlatformPreview[] | null>({
  key: 'exo.state.app.platforms',
  get: ({ get }) => {
    return get(appState).platforms
  },
  set: ({ get, set }, platforms: t.Platform[] | any) => {
    set(appState, {
      ...get(appState),
      platforms
    })
  }
})

export const idTokenState = selector<string | null>({
  key: 'exo.state.app.id-token',
  get: ({ get }) => {
    return get(appState).idToken
  },
  set: ({ get, set }, newIdToken: string | any) => {
    set(appState, {
      ...get(appState),
      idToken: newIdToken
    })
  }
})

export const userState = selector<t.User | null>({
  key: 'exo.state.app.user',
  get: ({ get }) => {
    return get(appState).user
  },
  set: ({ get, set }, data: { user: t.User, idToken: string } | any) => {
    set(appState, {
      ...get(appState),
      ...data
    })
  }
})

// export const windowBreakpointState = selector<'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'>({
//   key: 'ln.state.global-ui.window-breakpoint',
//   get: ({ get }) => {
//     return get(uiState).breakpoint
//   },
//   set: ({ get, set }, breakpoint: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | any) => {
//     set(uiState, {
//       ...get(uiState),
//       breakpoint
//     })
//   }
// })