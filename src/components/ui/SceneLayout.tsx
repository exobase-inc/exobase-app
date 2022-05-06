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
  appState as appStateAtom,
  platformState,
  userState,
  workspaceState
} from '../../state/app'

export default function SceneLayout({
  subtitle,
  children
}: {
  subtitle?: string
  children: React.ReactNode
}) {

  const { pathname } = useLocation()
  const workspace = Recoil.useRecoilValue(workspaceState)
  const platform = Recoil.useRecoilValue(platformState)
  const [appState, setAppState] = Recoil.useRecoilState(appStateAtom)
  const user = Recoil.useRecoilValue(userState)

  return (
    <Split>
      <Sidebar 
        currentPath={pathname}
      />
      <Pane flex={1}>
        <Header
          title={platform?.name}
          subtitle={subtitle}
          workspaces={user?.workspaces}
          currentWorkspaceId={workspace?.id}
          user={user}
        />
        <Pane
          flex={1}
          minHeight={'100vh'}
          paddingX={majorScale(4)}
          paddingTop={majorScale(4)}
          background="tint1"
        >
          {children}
        </Pane>
      </Pane>
    </Split>
  )
}
