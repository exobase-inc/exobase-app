import { useState } from 'react'
import {
  Pane,
  majorScale,
  Text,
  Button
} from 'evergreen-ui'
import { HiArrowDown, HiArrowUp } from 'react-icons/hi'
import { Split } from '../layout'
import theme from '../../styles'
import type { ArgumentTypes } from '../../types'


export default function CloseablePane({
  label,
  isOpen,
  initOpen,
  children,
  disabled = false,
  onChange,
  ...rest
}: {
  label: string
  isOpen?: boolean
  initOpen?: boolean
  disabled?: boolean
  children: React.ReactNode
  onChange?: (isOpen: boolean) => void
} & ArgumentTypes<typeof Pane>[0]) {

  const [isControlled] = useState(isOpen === true || isOpen === false)
  const [open, setOpen] = useState(isOpen ?? initOpen ?? false)

  const handleToggle = () => {
    if (isControlled) {
      onChange?.(!isOpen)
    } else {
      setOpen(!open)
    }
  }

  const currentlyOpen = isControlled ? isOpen : open

  return (
    <Pane {...rest}>
      <Split
        alignItems='baseline'
        borderBottomStyle='solid'
        borderBottomWidth='1px'
        borderBottomColor={theme.colors.grey200}
        paddingBottom={majorScale(1)}
        marginBottom={majorScale(1)}
      >
        <Text fontWeight='bold' flex={1}>{label}</Text>
        {!disabled && (
          <Button
            onClick={handleToggle}
            appearance='minimal'
            iconBefore={currentlyOpen ? (<HiArrowUp />) : (<HiArrowDown />)}
          >
            {currentlyOpen ? 'hide' : 'show'}
          </Button>
        )}
      </Split>
      {currentlyOpen && (
        <Pane>
          {children}
        </Pane>
      )}
    </Pane>
  )
}
