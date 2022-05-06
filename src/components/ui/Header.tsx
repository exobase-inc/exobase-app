import _ from 'radash'
import { useState } from 'react'
import * as yup from 'yup'
import {
  Pane,
  Button,
  Heading,
  Paragraph,
  SelectMenu,
  majorScale,
  Image,
  Dialog,
  TextInputField,
  toaster
} from 'evergreen-ui'
import { HiSwitchHorizontal, HiPlus } from 'react-icons/hi'
import { Split } from '../layout'
import * as t from '../../types'
import { useFetch, useFormation } from '../../hooks'
import api from '../../api'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { appState as appStateAtom, idTokenState, platformsState } from '../../state/app'
import storage from '../../storage'

export default function Header({
  title,
  subtitle,
  workspaces,
  currentWorkspaceId,
  user
}: {
  title?: string
  subtitle?: string
  workspaces?: { name: string; id: string }[]
  currentWorkspaceId?: string
  user?: t.User | null
}) {
  // const [showCreatePlatformDialog, setShowCreatePlatformDialog] = useState(false)
  const platforms = useRecoilValue(platformsState)
  const [appState, setAppState] = useRecoilState(appStateAtom)

  const switchPlatform = async (newPlatformId: string) => {
    setAppState({
      ...appState,
      platformId: newPlatformId
    })
  }

  return (
    <Split padding={majorScale(4)} alignItems='center' borderBottom="muted">
      {/* <Dialog
        isShown={showCreatePlatformDialog}
        hasHeader={false}
        hasFooter={false}
      >
        <CreatePlatformForm
          onCancel={() => setShowCreatePlatformDialog(false)}
          onComplete={() => setShowCreatePlatformDialog(false)}
        />
      </Dialog> */}
      <Pane flex={1}>
        <Split alignItems='center'>
          <Heading
            size={800}
            fontWeight={700}
          >
            {title}
          </Heading>
          <SelectMenu
            title="Select Platform"
            options={platforms?.map(p => ({ label: p.name, value: p.id })) ?? []}
            selected={currentWorkspaceId}
            onSelect={(item) => switchPlatform(item.value as string)}
          >
            <Button
              appearance='minimal'
              iconBefore={<HiSwitchHorizontal />}
              borderRadius={20}
              marginLeft={majorScale(1)}
              paddingY={majorScale(1)}
              paddingX={majorScale(2)}
            >
              switch
            </Button>
          </SelectMenu>
          {/* <Button
            onClick={() => setShowCreatePlatformDialog(true)}
            marginLeft={majorScale(1)}
            appearance='minimal'
            iconBefore={<HiPlus />}
            borderRadius={20}
            paddingY={majorScale(1)}
            paddingX={majorScale(2)}
          >
            new
          </Button> */}
        </Split>
        <Paragraph>{subtitle}</Paragraph>
      </Pane>
      <Image
        marginLeft={majorScale(2)}
        borderRadius={4}
        width={35}
        src={`https://picsum.photos/seed/${user?.id ?? 'x'}/200?grayscale`}
      />
    </Split>
  )
}

// const CreatePlatformForm = ({
//   onCancel,
//   onComplete
// }: {
//   onCancel?: () => void
//   onComplete?: () => void
// }) => {
//   const createPlatformRequest = useFetch(api.platforms.create)
//   const switchPlatformsRequest = useFetch(api.auth.switchPlatform)
//   const idToken = useRecoilValue(idTokenState) as string
//   const setAppState = useSetRecoilState(appState)
//   const form = useFormation({
//     name: yup.string().required()
//   }, {
//     name: ''
//   })

//   const createPlatform = async () => {
//     const platformResponse = await createPlatformRequest.fetch({
//       name: form.watch().name
//     }, { token: idToken })
//     if (platformResponse.error) {
//       console.error(platformResponse.error)
//       toaster.danger(platformResponse.error.details)
//       return
//     }
//     const newPlatform = platformResponse.data.platform
//     const switchResponse = await switchPlatformsRequest.fetch({
//       platformId: newPlatform.id
//     }, { token: idToken })

//     setAppState({
//       user: switchResponse.data.user,
//       idToken: switchResponse.data.idToken,
//       platforms: switchResponse.data.platforms,
//       currentPlatform: newPlatform,
//       currentPlatformId: newPlatform.id,
//     })

//     storage.token.set({
//       ...storage.token.get()!,
//       idToken: switchResponse.data.idToken,
//       exp: switchResponse.data.exp,
//     })

//     onComplete?.()
//   }

//   return (
//     <Pane>
//       <Heading>New Platform</Heading>
//       <Pane>
//         <TextInputField
//           label='Name'
//           description='What should we call your new platform?'
//           placeholder='A Better Stripe'
//           validationMessage={form.errors.name?.message}
//           {...form.register('name')}
//         />
//         <Split justifyContent='space-between'>
//           <Button
//             onClick={onCancel}
//             appearance='minimal'
//           >
//             cancel
//           </Button>
//           <Button
//             disabled={!form.isDirty}
//             isLoading={createPlatformRequest.loading || switchPlatformsRequest.loading}
//             onClick={createPlatform}
//             appearance='primary'
//           >
//             create
//           </Button>
//         </Split>
//       </Pane>
//     </Pane>
//   )
// }