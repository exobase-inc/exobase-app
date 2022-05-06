/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil, { useRecoilValue } from 'recoil'
import { Center } from '../layout'
import {
  Pane,
  Heading,
  Button,
  Paragraph,
  majorScale,
  toaster
} from 'evergreen-ui'
import { useFetch } from '../../hooks'
import api from '../../api'
import {
  idTokenState,
  workspaceState
} from '../../state/app'
import { SceneLayout } from '../ui'
import * as t from '../../types'

export default function DashboardScene() {

  const navigate = useNavigate()
  const workspace = useRecoilValue(workspaceState)

  console.log(workspace)

  const gotoServices = (platform: t.Platform) => () => {
    navigate(`/platform/${platform.id}/services`)
  }

  return (
    <SceneLayout>
      <div className="flex flex-row items-center justify-center">
        <div>
          {workspace?.platforms.map(platform => (
            <div className="flex flex-row items-center justify-between rounded-xl border border-slate-100 p-8 mb-4">
              <h3>{platform.name}</h3>
              <button onClick={gotoServices(platform)} className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">view</button>
            </div>
          ))}
        </div>
      </div>
    </SceneLayout>
  )
}