/* eslint-disable react-hooks/exhaustive-deps */
import Recoil from 'recoil'
import { Split } from '../layout'
import {
  Pane,
  Heading,
  majorScale
} from 'evergreen-ui'
import { Header, Sidebar } from '../ui'
import {
  currentPlatformState
} from '../../state/app'
import ProviderGrid from '../ui/ProviderGrid'


export default function ProviderScene() {

  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)

  return (
    <Pane>
      <Header />
      <Split flex={1}>
        <Sidebar />
        <Pane
          flex={1}
          backgroundColor='#F2F2F2'
          minHeight={'100vh'}
          paddingX={majorScale(4)}
          paddingTop={majorScale(4)}
        >
          <Split alignItems='center'>
            <Heading flex={1}>The {currentPlatform?.name} Platform</Heading>
          </Split>
          <ProviderGrid />
        </Pane>
      </Split>
    </Pane>
  )
}