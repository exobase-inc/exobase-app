import { useCurrentBreakpointName, useCurrentWidth } from 'react-socks'


export type Breakpoint = 'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'

export type Modifier = 'only' | 'up' | 'down'

const breakpointMap: Record<Breakpoint, number> = {
  'xsmall': 0,
  'small': 1,
  'medium': 2,
  'large': 3,
  'xlarge': 4
}

type BreakpointMap<T> = {
  'xsmall': T
  'small': T
  'medium': T
  'large': T
  'xlarge': T
}

export const useBreakpoint = () => {

  const currentBreakpoint = useCurrentBreakpointName() as Breakpoint
  const currentWidth = useCurrentWidth()

  const showAt = (breakpoint: Breakpoint, modifier: Modifier = 'only') => {
    const current = breakpointMap[currentBreakpoint] // xsmall => 0
    const given = breakpointMap[breakpoint]         // small => 1 & up
    if (current === given) return true
    if (modifier === 'up') return current > given
    if (modifier === 'down') return current < given
    return false
  }

  const select = <T> (choices: Partial<BreakpointMap<T>>, defaultValue?: T): T => {
    const value = choices[currentBreakpoint]
    return value ?? defaultValue ?? undefined as any as T
  }

  const use = <T> (value: T, {
    at: breakpoint,
    and: modifier = 'only',
    else: defaultValue = null
  }: {
    at: Breakpoint
    and?: Modifier
    else?: T | null
  }): T => {
    const current = breakpointMap[currentBreakpoint] // xsmall => 0
    const given = breakpointMap[breakpoint]          // small => 1 & up
    if (current === given) return value
    if (modifier === 'up') return current > given ? value : defaultValue as T
    if (modifier === 'down') return current < given ? value : defaultValue as T
    return defaultValue as T
  }

  return {
    breakpoint: currentBreakpoint,
    width: currentWidth,
    select,
    use,
    showAt
  }
}

export default useBreakpoint