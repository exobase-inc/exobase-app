import styled, { keyframes, css } from 'styled-components'


const blinkingKeyframe = keyframes`
50% {
  opacity: 0;
}
`

const Blink = styled.div<{ $blink?: boolean }>`
  ${({ $blink }) => $blink && css`
    animation: ${blinkingKeyframe} 1s linear infinite;
  `}
`

export default Blink