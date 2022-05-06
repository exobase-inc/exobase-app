/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import * as yup from 'yup'
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
import { useFetch, useFormation } from '../../hooks'
import api from '../../api'
import {
  idTokenState,
  workspaceState
} from '../../state/app'
import { SceneLayout } from '../ui'
import * as t from '../../types'
import Modal from '../ui/Modal'

export default function AdminPacksScene() {

  const navigate = useNavigate()
  const listPacksRequest = useFetch(api.registry.search)
  const [addPackModal, setAddPackModal] = useState(false)

  useEffect(() => {
    listPacksRequest.fetch({})
  }, [])

  const showAddPackModal = () => setAddPackModal(true)

  const addPack = async () => {

  }

  const packs = listPacksRequest.data?.packs ?? []

  return (
    <SceneLayout>
      {addPackModal && (<AddBuildPackModal 
        onClose={() => setAddPackModal(false)}
        onComplete={() => {
          setAddPackModal(false)
          listPacksRequest.fetch({})
        }}
      />)}
      <div className="flex flex-row items-center justify-center w-full">
        <div className="w-full max-w-2xl">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-2xl font-bold">Build Packs</h3>
            <button onClick={showAddPackModal} className="bg-blue-600 hover:bg-blue-700 rounded px-2 py-1 text-white">
              Add
            </button>
          </div>
          <div>
            {packs.length === 0 && (
              <span>No Build packs</span>
            )}
            {packs.map(pack => (
              <div key={pack.id} className="flex flex-row items-center justify-between rounded-xl border border-slate-100 p-8 mb-4">
                <span>{pack.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneLayout>
  )
}

const AddBuildPackModal = ({
  onClose,
  onComplete
}: {
  onClose?: () => void
  onComplete?: () => void
}) => {

  const idToken = useRecoilValue(idTokenState)
  const addPackRequest = useFetch(api.registry.add)

  const form = useFormation({
    url: yup.string().url().required()
  }, {
    url: ''
  })

  const addPack = async (value: { url: string }) => {
    const { error, data } = await addPackRequest.fetch({
      url: value.url
    }, { token: idToken! })
    if (error) {
      console.error(error)
      toaster.danger(error.details)
      return
    }
    onComplete?.()
  }

  return (
    <Modal open onClose={onClose}>
      <span className="text-2xl font-bold">Add Build Package</span>
      <p className="max-w-prose">
        Build packages are managed via Terraform. Follow Terraform's guide
        to upload a module package. Once your package is uploaded pase the
        link to it on Terraform here.
      </p>
      <div className="my-4 border-b border-slate-800">
        <label>Url</label>
        <input className="p-2 w-full" type="text" {...form.register('url')} placeholder="https://registry.terraform.io/modules/exobase-inc/exo-ts-lambda-api/aws/latest" />
        {form.errors.url?.message && (
          <span className="text-red-700">{form.errors.url?.message}</span>
        )}
      </div>
      <div className="flex flex-row justify-end">
        <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white" onClick={form.createHandler(addPack)}>Add</button>
      </div>
    </Modal>
  )
}