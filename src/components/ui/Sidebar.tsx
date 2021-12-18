import { Stack, Split } from '../layout'
import { Link } from 'react-router-dom'
import {
  HiCube,
  HiGlobeAlt,
  HiCloud,
  HiUsers,
  HiViewGrid
} from 'react-icons/hi'
import theme from '../../styles'
import styled from 'styled-components'
import type { IconType } from 'react-icons'
import {
  Heading,
  majorScale,
  Text
} from 'evergreen-ui'
import Logo from './Logo'

export default function Sidebar({
  currentPath
}: {
  currentPath?: string
}) {

  return (
    <Stack
      padding={majorScale(4)}
      paddingRight={majorScale(10)}
    >
      <Split
        alignItems='flex-end'
        marginBottom={majorScale(5)}
      >
        <Logo width={35} />
        <Heading
          marginLeft={majorScale(2)}
          size={600}
          fontWeight={700}
        >
          Exobase
        </Heading>
      </Split>
      <SidebarItem
        label='Dashboard'
        isActive={currentPath === '/platform'}
        icon={HiViewGrid}
        route='/platform'
      />
      <Text
        marginTop={majorScale(2)}
        marginBottom={majorScale(1)}
        size={300}
        fontWeight={600}
        color={theme.colors.grey300}
      >
        Platform
      </Text>
      <SidebarItem
        label='Services'
        isActive={currentPath === '/services'}
        icon={HiCube}
        route='/services'
      />
      <SidebarItem
        label='Domains'
        isActive={currentPath === '/domains'}
        icon={HiGlobeAlt}
        route='/domains'
      />
      <SidebarItem
        label='Clouds'
        isActive={currentPath === '/providers'}
        icon={HiCloud}
        route='/providers'
      />
      <Text
        marginTop={majorScale(2)}
        marginBottom={majorScale(1)}
        size={300}
        fontWeight={600}
        color={theme.colors.grey300}
      >
        Management
      </Text>
      <SidebarItem
        label='Users'
        isActive={currentPath === '/users'}
        icon={HiUsers}
        route='/users'
      />
    </Stack>
  )
}

const SidebarItemLink = styled(Link)`
  text-decoration: none;
` as typeof Link

const SidebarItem = ({
  label,
  icon: Icon,
  isActive: active = false,
  route
}: {
  label: string
  icon: IconType
  isActive: boolean
  route: string
}) => {
  return (
    <SidebarItemLink to={route}>
      <Split
        alignItems='center'
        marginBottom={majorScale(3)}
      >
        <Icon
          size={20}
          color={active ? theme.colors.accent : theme.colors.black}
        />
        <Text
          size={500}
          marginLeft={majorScale(2)}
          fontWeight={600}
          color={active ? theme.colors.accent : theme.colors.black}
        >
          {label}
        </Text>
      </Split>
    </SidebarItemLink>
  )
}