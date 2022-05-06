import { Stack, Split } from '../layout'
import { Link } from 'react-router-dom'
import {
  HiCube,
  HiGlobeAlt,
  HiCloud,
  HiUsers,
  HiViewGrid,
  HiOutlineCubeTransparent,
  HiChevronDown
} from 'react-icons/hi'
import styled from 'styled-components'
import type { IconType } from 'react-icons'
import {
  Heading,
  majorScale,
  Text
} from 'evergreen-ui'
import Logo from './Logo'
import { useRecoilValue } from 'recoil'
import { appState, platformState, userState } from '../../state/app'

export default function Sidebar({
  currentPath
}: {
  currentPath?: string
}) {

  const { user, workspace } = useRecoilValue(appState)
  const platform = useRecoilValue(platformState)
  if (!user) return null

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-end mb-5 p-6 pr-10">
        <Logo width={35} />
        <h4 className="ml-2 text-2xl font-bold">
          Exobase
        </h4>
      </div>
      <div className="grow p-6 pr-10">
        <SidebarItem
          label='Dashboard'
          isActive={currentPath === '/dashboard'}
          icon={HiViewGrid}
          route='/dashboard'
        />
        <Text
          marginTop={majorScale(2)}
          marginBottom={majorScale(1)}
          size={300}
          fontWeight={600}
          className="text-slate-400 uppercase"
        >
          Platform
        </Text>
        <SidebarItem
          label='Services'
          isActive={currentPath === `/platform/${platform?.id}/services`}
          icon={HiCube}
          route={`/platform/${platform?.id}/services`}
        />
        <SidebarItem
          label='Domains'
          isActive={currentPath === `/platform/${platform?.id}/domains`}
          icon={HiGlobeAlt}
          route={`/platform/${platform?.id}/domains`}
        />
        <SidebarItem
          label='Clouds'
          isActive={currentPath === `/platform/${platform?.id}/providers`}
          icon={HiCloud}
          route={`/platform/${platform?.id}/providers`}
        />
        <Text
          marginTop={majorScale(2)}
          marginBottom={majorScale(1)}
          size={300}
          fontWeight={600}
          className="text-slate-400 uppercase"
        >
          Management
        </Text>
        <SidebarItem
          label='Users'
          isActive={currentPath === '/users'}
          icon={HiUsers}
          route='/users'
        />
        {user.role === 'admin' && (
          <>
            <Text
              marginTop={majorScale(2)}
              marginBottom={majorScale(1)}
              size={300}
              fontWeight={600}
              className="text-slate-400 uppercase"
            >
              Admin
            </Text>
            <SidebarItem
              label='Packs'
              isActive={currentPath === '/packs'}
              icon={HiOutlineCubeTransparent}
              route='/packs'
            />
          </>
        )}
      </div>
      <div className="border-slate-200 border-t border-solid flex flex-row p-6">
        <img src={user.thumbnailUrl} className="rounded-xl mr-4 object-cover h-5 w-5 bg-slate-200" />
        <span className="inline-block grow">{workspace?.name}</span>
        <button className="">
          <HiChevronDown className="" />
        </button>
      </div>
    </div>
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
        className="group"
      >
        <Icon
          size={20}
          className="group-hover:text-blue-700 text-black"
        />
        <Text
          size={500}
          marginLeft={majorScale(2)}
          fontWeight={600}
          className="group-hover:text-blue-700 text-black"
        >
          {label}
        </Text>
      </Split>
    </SidebarItemLink>
  )
}