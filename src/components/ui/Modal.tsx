import React, { SyntheticEvent, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'


interface Props {
  open?: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export default function ModalWrapper(props: Props) {
  const [isBrowser, setIsBrowser] = useState(false)

  // Makes sure render only happens in browser
  // not in next ssr
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (isBrowser) {
    const root = document.getElementById('modal-root')
    if (root) {
      return ReactDOM.createPortal((<Modal {...props} />), root) as JSX.Element
    }
  }
  return null
}

const BodyScrollLock = createGlobalStyle`
  body {
    overflow: hidden;
  }
`

const Modal = ({
  open = false,
  onClose,
  children
}: Props) => {
  const handleCloseClick = (e: SyntheticEvent) => {
    e.preventDefault()
    onClose?.()
  }
  return !open ? null : (
    <>
      <BodyScrollLock />
      <div
        className="flex flex-col items-center justify-center fixed w-screen h-screen top-0 left-0 bg-black-opaque"
        onClick={handleCloseClick}
      >
        <div
          className="overflow-y-scroll lg:max-h-[80vh] lg:max-w-2xl p-4 md:p-12 bg-white lg:rounded"
          onClick={(e: SyntheticEvent) => e.stopPropagation()}
        >
          <div>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}