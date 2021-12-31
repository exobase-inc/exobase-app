import styled from 'styled-components'
import {
  Pane,
  Card,
  Text,
  majorScale,
} from 'evergreen-ui'
import theme from '../../styles'
import type { ArgumentTypes } from '../../types'


const GridChoicePane = styled(Card) <{ $comingSoon: boolean, $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease-out;
  border: 1px solid transparent;
  > span {
    transition: color 0.3s ease-out;
    color: ${({ $comingSoon }) => $comingSoon ? theme.colors.grey300 : theme.colors.grey999};
    font-weight: 600;
  }
  ${({ $comingSoon }) => !$comingSoon && `
    &:hover {
      background-color: ${theme.colors.accent};
      cursor: pointer;
      > span {
        color: ${theme.colors.white};
      }
    }
  `}
  ${({ $active }) => !!$active && `
    border-color: ${theme.colors.accent};
  `}
`

export default function GridBoxSelect<TKey = string>({
  choices,
  selected,
  onSelect,
  ...rest
}: {
  selected?: TKey
  choices: {
    label: string
    key: TKey
    comingSoon?: boolean
  }[]
  onSelect?: (key: TKey) => void
} & ArgumentTypes<typeof Pane>[0]) {
  console.log('selected: ', selected)
  console.log('keys: ', choices.map(c => c.key))
  return (
    <Pane
      display='grid'
      gridTemplateColumns={`repeat(3, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      {...rest}
    >
      {choices.map(choice => (
        <GridBoxSelectItem
          key={choice.key as any}
          active={!!selected && selected === choice.key}
          label={choice.label}
          comingSoon={choice.comingSoon ?? false}
          onClick={() => onSelect?.(choice.key)}
        />
      ))}
    </Pane>
  )
}

const GridBoxSelectItem = ({
  label,
  active = false,
  comingSoon = false,
  onClick
}: {
  label: string
  active?: boolean
  comingSoon?: boolean
  onClick?: () => void
}) => {
  return (
    <GridChoicePane
      elevation={1}
      backgroundColor={theme.colors.white}
      padding={majorScale(2)}
      onClick={onClick}
      position='relative'
      $comingSoon={comingSoon}
      $active={active}
    >
      <Text
        textAlign='center'
      >
        {label}
      </Text>
      {comingSoon && (
        <Text
          position='absolute'
          bottom='4px'
          size={300}
        >
          coming soon
        </Text>
      )}
    </GridChoicePane>
  )
}