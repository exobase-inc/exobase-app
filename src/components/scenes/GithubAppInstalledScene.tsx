/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Recoil from 'recoil'
import { Split, Center } from '../layout'
import {
  Pane,
  Heading,
  Paragraph,
  majorScale,
  toaster,
  Spinner
} from 'evergreen-ui'
import { useFetch } from '../../hooks'
import api from '../../api'
import { HiOutlineExclamationCircle, HiOutlineCheckCircle } from 'react-icons/hi'
import storage from '../../storage'
import theme from '../../styles'
import { Logo } from '../ui'


export default function GithubAppInstalledScene() {

  const setInstallationIdRequest = useFetch(api.source.addInstallation)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    updateAppInstallationId()
  }, [])

  const updateAppInstallationId = async () => {
    const token = storage.token.get()
    if (!token) {
      setError('You may have been directed to this route by accident. No user is currently logged in.')
      return
    }
    if (token.exp < +new Date()) {
      setError('You may have been directed to this route by accident. The previous session is expired')
      return
    }
    const params = new URLSearchParams(window.location.search)
    const installationId = params.get("installation_id")
    if (!installationId) {
      setError('You may have been directed to this route by accident. No instillation id was provided.')
      return
    }
    // const response = await setInstallationIdRequest.fetch({
    //   installationId
    // }, { token: token.idToken })
    // if (response.error) {
    //   console.error(response.error)
    //   toaster.danger(response.error.details)
    //   setError('There was an error connecting the GitHub app you installed. Try to click the install app link again. If you get another error, contact us.')
    //   return
    // }
  }

  return (
    <>
      <Pane
        paddingLeft={majorScale(2)}
        paddingTop={majorScale(2)}
        backgroundColor={theme.colors.grey100}
      >
        <Logo width={30} color={theme.colors.grey999} />
      </Pane>
      <Center
        width='100vw'
        height='100vh'
        backgroundColor={theme.colors.grey100}
      >
        <Pane
          backgroundColor={theme.colors.white}
          borderRadius={4}
          maxWidth='500px'
          padding={majorScale(4)}
        >
          {error && (
            <>
              <Split alignItems='center' marginBottom={majorScale(2)}>
                <Heading flex={1} size={800}>Error</Heading>
                <HiOutlineExclamationCircle size={30} color='red' />
              </Split>
              <Paragraph size={500}>
                {error}
              </Paragraph>
            </>
          )}
          {!error && setInstallationIdRequest.loading && (
            <>
              <Split alignItems='center' marginBottom={majorScale(2)}>
                <Heading flex={1} size={800}>One Moment</Heading>
                <Spinner size={30} />
              </Split>
              <Paragraph size={500}>
                We're connecting the Exobase GitHub app you installed to your Exobase platform...
              </Paragraph>
            </>
          )}
          {!error && !setInstallationIdRequest.loading && (
            <>
              <Split alignItems='center' marginBottom={majorScale(2)}>
                <Heading flex={1} size={800}>All Set!</Heading>
                <HiOutlineCheckCircle size={30} color='green' />
              </Split>
              <Paragraph size={500}>
                The GitHub app has been connected to your platform. You can close this browser window and continue your work.
              </Paragraph>
            </>
          )}
        </Pane>
      </Center>
    </>
  )
}
