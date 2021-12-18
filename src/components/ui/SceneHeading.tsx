import Recoil from 'recoil'
import { currentPlatformState } from '../../state/app'
import {
  Pane,
  Heading,
  Paragraph
} from 'evergreen-ui'


export default function SceneHeading ({
  subtitle
}: {
  subtitle: string
}) {
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState)
  return (
    <Pane>
      <Heading size={900}>{currentPlatform?.name}</Heading>
      <Paragraph>{subtitle}</Paragraph>
    </Pane>
  )
}