import Recoil from 'recoil'
import { workspaceState } from '../../state/app'
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
  const workspace = Recoil.useRecoilValue(workspaceState)
  return (
    <Pane>
      <Heading size={900}>{workspace?.name}</Heading>
      <Paragraph>{subtitle}</Paragraph>
    </Pane>
  )
}