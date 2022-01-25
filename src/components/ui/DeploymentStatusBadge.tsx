import * as t from '../../types'
import {
  Badge, StatusIndicator 
} from 'evergreen-ui'
import Blink from './Blink'
import { Split } from '../layout'


export default function DeploymentStatusBadge ({
  deployment
}: {
  deployment?: t.Deployment | null
}) {
  const statusColor = (): 'red' | 'green' | 'yellow' | 'neutral' => {
    if (!deployment) return 'neutral'
    const statusMap: Record<t.DeploymentStatus, 'red' | 'green' | 'yellow' | 'neutral'> = {
      'canceled': 'yellow',
      'success': 'green',
      'failed': 'red',
      'in_progress': 'yellow',
      'queued': 'yellow',
      'partial_success': 'red'
    }
    return statusMap[deployment.status]
  }
  const statusLabel = (): string => {
    if (!deployment) return 'not-deployed'
    if (deployment.type === 'destroy' && deployment.status === 'success') {
      return 'destroyed'
    }
    const statusMap: Record<t.DeploymentStatus, string> = {
      'canceled': 'canceled',
      'success': 'active',
      'failed': 'failed',
      'in_progress': 'deploying',
      'queued': 'queued',
      'partial_success': 'partial-success'
    }
    return statusMap[deployment.status]
  }
  return (
    <Split>
      <Blink $blink={deployment?.status === 'in_progress'}>
        <StatusIndicator color={statusColor()} />
      </Blink>
      <Badge color={statusColor()}>{statusLabel()}</Badge>
    </Split>
  )
}