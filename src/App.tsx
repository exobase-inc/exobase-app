import { RecoilRoot } from 'recoil'
import { BreakpointProvider } from 'react-socks'

import AppRoutes from './Routes'

import './styles/reset.css'
import './styles/index.css'

export default function App() {
  return (
    <RecoilRoot>
      <BreakpointProvider>
        <AppRoutes />
      </BreakpointProvider>
    </RecoilRoot>
  )
}
