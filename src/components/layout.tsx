import styled from 'styled-components'
import { Pane } from 'evergreen-ui'

/**
 * flex-direction: row
 */
export const Split = styled(Pane)`
  display: flex;
  flex-direction: row;
` as typeof Pane

/**
 * flex-direction: column
 */
export const Stack = styled(Pane)`
  display: flex;
  flex-direction: column;
` as typeof Pane

/**
 * align: center center
 */
export const Center = styled(Pane)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
` as typeof Pane

export const Axis = ({
  children,
  stack,
  split,
  default: defaultOrientation = 'stack'
}: {
  children: React.ReactNode
  stack?: boolean
  split?: boolean
  default?: 'stack' | 'split'
}) => {
  if (stack) return <Stack>{children}</Stack>
  if (split) return <Split>{children}</Split>
  if (defaultOrientation === 'stack') return <Stack>{children}</Stack>
  return <Split>{children}</Split>
}