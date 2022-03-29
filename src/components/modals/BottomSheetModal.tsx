import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal as BaseModal,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { useAppTheme } from 'src/app/hooks'
import { Box } from 'src/components/layout'
import { ModalName } from 'src/features/telemetry/constants'
import { Trace } from 'src/features/telemetry/Trace'

type Props = {
  children: PropsWithChildren<any>
  disableSwipe?: boolean
  hideHandlebar?: boolean
  isVisible: boolean
  name: ModalName
  onClose: () => void
  snapPoints?: Array<string | number>
  fullScreen?: boolean
}

const HandleBar = () => {
  return (
    <Box
      alignSelf="center"
      backgroundColor="gray400"
      borderRadius="xs"
      height={4}
      mt="sm"
      opacity={0.3}
      width={36}
    />
  )
}

const Backdrop = (props: BottomSheetBackdropProps) => {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.7} />
}

const CONTENT_HEIGHT_SNAP_POINTS = ['CONTENT_HEIGHT']
const FULL_HEIGHT_SNAP_POINTS = ['93%']

export function BottomSheetModal({
  isVisible,
  children,
  name,
  onClose,
  snapPoints = CONTENT_HEIGHT_SNAP_POINTS,
  fullScreen,
  hideHandlebar,
}: Props) {
  const modalRef = useRef<BaseModal>(null)
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(fullScreen ? FULL_HEIGHT_SNAP_POINTS : snapPoints)
  const theme = useAppTheme()

  useEffect(() => {
    if (isVisible) {
      modalRef.current?.present()
    } else {
      modalRef.current?.close()
    }
  }, [isVisible])

  return (
    <BaseModal
      ref={modalRef}
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: theme.colors.mainBackground }}
      contentHeight={fullScreen ? undefined : animatedContentHeight}
      handleComponent={hideHandlebar ? null : HandleBar}
      handleHeight={animatedHandleHeight}
      snapPoints={animatedSnapPoints}
      onDismiss={onClose}>
      <Trace logImpression section={name}>
        <BottomSheetView style={BottomSheetStyle.view} onLayout={handleContentLayout}>
          {children}
        </BottomSheetView>
      </Trace>
    </BaseModal>
  )
}

export function BottomSheetScrollModal({
  isVisible,
  children,
  name,
  onClose,
  snapPoints = FULL_HEIGHT_SNAP_POINTS,
}: Props) {
  const modalRef = useRef<BaseModal>(null)

  const theme = useAppTheme()

  useEffect(() => {
    if (isVisible) {
      modalRef.current?.present()
    } else {
      modalRef.current?.close()
    }
  }, [isVisible])

  return (
    <BaseModal
      ref={modalRef}
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: theme.colors.mainBackground }}
      handleComponent={HandleBar}
      snapPoints={snapPoints}
      onDismiss={onClose}>
      <Trace logImpression section={name}>
        <BottomSheetScrollView>{children}</BottomSheetScrollView>
      </Trace>
    </BaseModal>
  )
}

const BottomSheetStyle = StyleSheet.create({
  view: {
    flex: 1,
  },
})
