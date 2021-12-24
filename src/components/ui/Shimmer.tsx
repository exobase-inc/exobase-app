import { Pane } from 'evergreen-ui'
import styled, { keyframes } from 'styled-components'


const shimmer = keyframes`
  0% {
    background-position: -1200px 0;
  }
  100% {
    background-position: 1200px 0;
  }
`

const Card = styled(Pane)`
  animation-duration: 2.2s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: ${shimmer};
  animation-timing-function: linear;
  background: #ddd;
  background: linear-gradient(to right, #F6F6F6 8%, #F0F0F0 18%, #F6F6F6 33%);
  background-size: 1200px 100%;
`

const Shimmer = (props: any) => {
  return (
    <Card {...props} />
  )
}

export default Shimmer as typeof Pane