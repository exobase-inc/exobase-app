import { atom, selector } from 'recoil'
import * as t from '../types'


interface AppState {
  user: t.User | null
  idToken: string | null
  platforms: t.PlatformPreview[]
  currentPlatform: t.Platform | null
  currentPlatformId: string | null,
}

export const appState = atom<AppState>({
  key: 'exo.state.app',
  default: {
    user: null,
    idToken: null,
    platforms: [],
    currentPlatform: null,
    currentPlatformId: null
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