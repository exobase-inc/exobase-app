import {
  Pane,
  Button,
  Heading,
  Paragraph,
  SelectMenu,
  majorScale,
  Image
} from 'evergreen-ui'
import { HiSwitchHorizontal } from 'react-icons/hi'
import { Split } from '../layout'
import * as t from '../../types'


export default function Header({
  title,
  subtitle,
  platforms,
  currentPlatformId,
  user,
  onSwitchPlatform
}: {
  title?: string
  subtitle?: string
  platforms?: t.PlatformPreview[]
  currentPlatformId?: string
  user?: t.User | null
  onSwitchPlatform?: (platformId: string) => void
}) {

  return (
    <Split padding={majorScale(4)} alignItems='center' borderBottom="muted">
      <Pane flex={1}>
        <Split alignItems='center'>
          <Heading
            size={800}
            fontWeight={700}
          >
            {title}
          </Heading>
          <SelectMenu
            title="Select Platform"
            options={platforms?.map(p => ({ label: p.name, value: p.id })) ?? []}
            selected={currentPlatformId}
            onSelect={(item) => onSwitchPlatform?.(item.value as string)}
          >
            <Button
              appearance='minimal'
              iconBefore={<HiSwitchHorizontal />}
              borderRadius={20}
              marginLeft={majorScale(1)}
              paddingY={majorScale(1)}
              paddingX={majorScale(2)}
            >
              switch
            </Button>
          </SelectMenu>
        </Split>
        <Paragraph>{subtitle}</Paragraph>
      </Pane>
      <Image
        marginLeft={majorScale(2)}
        borderRadius={4}
        width={35}
        src={`https://picsum.photos/seed/${user?.id ?? 'x'}/200?grayscale`}
      />
    </Split>
  )
}