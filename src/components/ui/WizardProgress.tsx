import { majorScale, Pane } from 'evergreen-ui'
import { Split } from '../layout'
import theme from '../../styles'
import { ArgumentTypes } from '../../types'


export default function WizardProgress ({
  steps,
  current,
  ...rest
}: {
  steps: string[]
  current: string
} & ArgumentTypes<typeof Pane>[0]) {
  const stepIndexMap = steps.reduce((acc, step, idx) => ({
    ...acc,
    [step]: idx
  }), {} as Record<string, number>)
  const currentStepIndex = stepIndexMap[current] ?? 0
  const isLast = (step: string) => {
    return stepIndexMap[step] === steps.length
  }
  const isActive = (step: string) => {
    return stepIndexMap[step] <= currentStepIndex
  }
  return (
    <Split {...rest}>
      {steps.map((step) => (
        <Pane 
          key={step}
          flex={1}
          borderRadius={8}
          backgroundColor={isActive(step) ? theme.colors.accent : theme.colors.grey200}
          height={8}
          marginRight={isLast(step) ? 0 : majorScale(2)}
        />
      ))}
    </Split>
  )
}