import { atom, selector } from 'recoil'


type Scene = 'dashboard' | 'services' | 'providers'

interface UIState {
    scene: Scene,
    windowWidth: number
    windowHeight: number
    breakpoint: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
}

export const uiState = atom<UIState>({
    key: 'ln.state.global-ui',
    default: {
        scene: 'dashboard',
        windowWidth: 1000,
        windowHeight: 1000,
        breakpoint: 'medium'
    }
})

export const windowSizeState = selector<{ width: number, height: number }>({
    key: 'ln.state.global-ui.window-size',
    get: ({ get }) => {
        const state = get(uiState)
        return {
            width: state.windowWidth,
            height: state.windowHeight
        }
    },
    set: ({ get, set }, size: { width: number, height: number } | any) => {
        set(uiState, {
            ...get(uiState),
            windowWidth: size.width,
            windowHeight: size.height,
        })
    }
})

export const windowBreakpointState = selector<'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'>({
    key: 'ln.state.global-ui.window-breakpoint',
    get: ({ get }) => {
        return get(uiState).breakpoint
    },
    set: ({ get, set }, breakpoint: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | any) => {
        set(uiState, {
            ...get(uiState),
            breakpoint
        })
    }
})
