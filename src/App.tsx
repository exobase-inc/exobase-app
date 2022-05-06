import { RecoilRoot } from 'recoil'

import AppRoutes from './Routes'

import './styles/reset.css'
import './styles/index.css'
import './styles/tailwind.css'

export default function App() {
  return (
    <RecoilRoot>
      <div id="modal-root" />
      <AppRoutes />
    </RecoilRoot>
  )
}
