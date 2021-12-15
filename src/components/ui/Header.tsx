import {
  Pane,
  Button,
  IconButton,
  Heading,
  SelectMenu,
  majorScale,
  Image
} from 'evergreen-ui'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'
import { Split } from '../layout'
import Logo from './Logo'
import Recoil from 'recoil'
import { appState, currentPlatformState, userState } from '../../state/app'


export default function Header() {

  const { platforms } = Recoil.useRecoilValue(appState)
  const [currentPlatform, setCurrentPlatform] = Recoil.useRecoilState(currentPlatformState)
  const user = Recoil.useRecoilValue(userState)

  const changeSelectedProject = (platformId: string) => {
    // TODO: Fetch detailed project data from API
    setCurrentPlatform(platformId as any)
  }

  return (
    <Split padding={majorScale(2)} alignItems='center'>
      <Split flex={1} alignItems='center'>
        <Pane marginRight={majorScale(4)}>
          <Logo width={35} />
        </Pane>
        <Split alignItems='center'>
          <Heading marginRight={majorScale(1)}>{currentPlatform?.name}</Heading>
          <SelectMenu
            title="Select Platform"
            options={platforms.map(p => ({ label: p.name, value: p.id }))}
            selected={currentPlatform?.id}
            onSelect={(item) => changeSelectedProject(item.value as string)}
          >
            <IconButton 
              appearance='minimal'
              icon={<HiOutlineSwitchHorizontal />} 
            />
          </SelectMenu>
        </Split>
      </Split>
      <Image
        marginLeft={majorScale(2)}
        borderRadius={4}
        width={35}
        src={`https://picsum.photos/seed/${user?.id ?? 'x'}/200?grayscale`}
      />
    </Split>
  )
}