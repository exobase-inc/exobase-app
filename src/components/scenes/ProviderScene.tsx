/* eslint-disable react-hooks/exhaustive-deps */
import { Pane } from 'evergreen-ui'
import ProviderGrid from '../ui/ProviderGrid'
import { SceneLayout } from '../ui'


export default function ProviderScene() {

  return (
    <SceneLayout>
      <Pane
        flex={1}
        minHeight={'100vh'}
      >
        <ProviderGrid />
      </Pane>
    </SceneLayout>
  )
}