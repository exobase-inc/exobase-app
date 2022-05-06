import { atom, DefaultValue, selector } from 'recoil'
import * as t from '../types'


interface AppState {
  user: t.User | null
  idToken: string | null
  workspace: t.Workspace | null
  platformId: string | null
}

export const appState = atom<AppState>({
  key: 'exo.state.app',
  default: {
    user: null,
    idToken: null,
    workspace: null,
    platformId: null
  }
})

export const workspaceState = selector<t.Workspace | null>({
  key: 'exo.state.app.current-workspace',
  get: ({ get }) => {
    return get(appState).workspace
  }
})

export const platformsState = selector<t.Platform[]>({
  key: 'exo.state.app.platforms',
  get: ({ get }) => {
    return get(appState).workspace?.platforms ?? []
  }
})

export const platformState = selector<t.Platform | null>({
  key: 'exo.state.app.platform',
  get: ({ get }) => {
    const { workspace, platformId } = get(appState)
    return workspace?.platforms.find(p => p.id === platformId) ?? null
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
  }
})
