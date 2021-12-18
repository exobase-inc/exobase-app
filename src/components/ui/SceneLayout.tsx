/* eslint-disable react-hooks/exhaustive-deps */
import { useLocation } from 'react-router'
import Recoil from 'recoil'
import { Split } from '../layout'
import {
  Pane,
  majorScale
} from 'evergreen-ui'
import { Header, Sidebar } from '../ui'
import {
  appState,
  userState,
  currentPlatformState
} from '../../state/app'


export default function SceneLayout({
  children
}: {
  children: React.ReactNode
}) {

  const { pathname } = useLocation()
  const [currentPlatform, setCurrentPlatform] = Recoil.useRecoilState(currentPlatformState)
  const { platforms } = Recoil.useRecoilValue(appState)
  const user = Recoil.useRecoilValue(userState)

  const changeSelectedProject = (platformId: string) => {
    setCurrentPlatform(platformId as any)
  }

  return (
    <Split>
      <Sidebar 
        currentPath={pathname}
      />
      <Pane flex={1}>
        <Header
          title={currentPlatform?.name}
          subtitle='Services'
          platforms={platforms}
          currentPlatformId={currentPlatform?.id}
          user={user}
          onSwitchPlatform={changeSelectedProject}
        />
        <Pane
          flex={1}
          minHeight={'100vh'}
          paddingX={majorScale(4)}
          paddingTop={majorScale(4)}
        >
          {children}
        </Pane>
      </Pane>
    </Split>
  )
}
