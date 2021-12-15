import { Pane, IconButton, majorScale } from 'evergreen-ui'
import { Stack } from '../layout'
import { 
  HiOutlineCube,
  HiOutlineGlobeAlt,
  HiOutlineCloud
} from 'react-icons/hi'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const activeButtonProps = {
    backgroundColor: '#000000',
    color: '#FFFFFF'
  }

  const isActiveProps = (path: string) => {
    return pathname === path ? activeButtonProps : {}
  }

  return (
    <Stack padding={majorScale(2)}>
      <IconButton
        icon={<HiOutlineCube size={25} />} 
        border='none'
        marginBottom={majorScale(4)}
        onClick={() => navigate('/services')}
        {...isActiveProps('/services')}
      />
      <IconButton
        icon={<HiOutlineGlobeAlt size={25} />} 
        border='none'
        marginBottom={majorScale(4)}
        onClick={() => navigate('/domains')}
        {...isActiveProps('/domains')}
      />
      <IconButton
        icon={<HiOutlineCloud size={25} />} 
        border='none'
        onClick={() => navigate('/providers')}
        {...isActiveProps('/providers')}
      />
    </Stack>
  )
}