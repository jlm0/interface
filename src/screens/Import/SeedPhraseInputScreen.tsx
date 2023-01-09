import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from 'src/app/hooks'
import { OnboardingStackParamList } from 'src/app/navigation/types'
import { Button } from 'src/components/buttons/Button'
import { Flex } from 'src/components/layout'
import { useLockScreenOnBlur } from 'src/features/authentication/lockScreenContext'
import { GenericImportForm } from 'src/features/import/GenericImportForm'
import { importAccountActions, IMPORT_WALLET_AMOUNT } from 'src/features/import/importAccountSaga'
import { ImportAccountType } from 'src/features/import/types'
import { SafeKeyboardOnboardingScreen } from 'src/features/onboarding/SafeKeyboardOnboardingScreen'
import { ElementName } from 'src/features/telemetry/constants'
import { OnboardingScreens } from 'src/screens/Screens'
import {
  MnemonicValidationError,
  userFinishedTypingWord,
  validateMnemonic,
  validateSetOfWords,
} from 'src/utils/mnemonics'

type Props = NativeStackScreenProps<OnboardingStackParamList, OnboardingScreens.ImportMethod>

export function SeedPhraseInputScreen({ navigation, route: { params } }: Props) {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  /**
   * If paste permission modal is open, we need to manually disable the splash screen that appears on blur,
   * since the modal triggers the same `inactive` app state as does going to app switcher
   *
   * Technically seed phrase will be blocked if user pastes from keyboard,
   * but that is an extreme edge case.
   **/
  const [pastePermissionModalOpen, setPastePermissionModalOpen] = useState(false)
  useLockScreenOnBlur(pastePermissionModalOpen)

  const [value, setValue] = useState<string | undefined>(undefined)
  const [submitEnabled, setSubmitEnabled] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  useEffect(() => {
    if (!errorMessage) {
      setSubmitEnabled(true)
    } else {
      setSubmitEnabled(false)
    }
  }, [errorMessage, setSubmitEnabled])

  // Add all accounts from mnemonic.
  const onSubmit = useCallback(() => {
    // Check phrase validation
    const { validMnemonic, error, invalidWord } = validateMnemonic(value)
    if (!validMnemonic) {
      setShowSuccess(false)
      if (error === MnemonicValidationError.InvalidPhrase) {
        setErrorMessage(t('Invalid phrase'))
      } else if (error === MnemonicValidationError.InvalidWord) {
        setErrorMessage(t('Invalid word: {{word}}', { word: invalidWord }))
      } else if (
        error === MnemonicValidationError.TooManyWords ||
        error === MnemonicValidationError.NotEnoughWords
      ) {
        setErrorMessage(t('Recovery phrase must be 12-24 words'))
      }
      return
    }

    dispatch(
      importAccountActions.trigger({
        type: ImportAccountType.Mnemonic,
        validatedMnemonic: validMnemonic,
        indexes: Array.from(Array(IMPORT_WALLET_AMOUNT).keys()),
      })
    )
    navigation.navigate({ name: OnboardingScreens.SelectWallet, params, merge: true })
  }, [dispatch, navigation, params, t, value])

  const onChange = (text: string | undefined) => {
    const { error, invalidWord, isValidLength } = validateSetOfWords(text)

    // always show success UI if phrase is valid length
    if (isValidLength) {
      setShowSuccess(true)
    } else {
      setShowSuccess(false)
    }

    // suppress error messages if the  user is not done typing a word
    const suppressError =
      (error === MnemonicValidationError.InvalidWord && !userFinishedTypingWord(text)) ||
      error === MnemonicValidationError.NotEnoughWords

    if (!error || suppressError) {
      setErrorMessage('')
    } else if (error === MnemonicValidationError.InvalidWord) {
      setErrorMessage(t('Invalid word: {{word}}', { word: invalidWord }))
    } else if (error === MnemonicValidationError.TooManyWords) {
      setErrorMessage(t('Recovery phrase must be 12-24 words'))
    }

    setValue(text)
  }

  return (
    <SafeKeyboardOnboardingScreen
      subtitle={t('Your recovery phrase will only be stored locally on your device.')}
      title={t('Enter your recovery phrase')}>
      <Flex>
        <GenericImportForm
          autoCorrect
          blurOnSubmit
          liveCheck
          afterPasteButtonPress={() => setPastePermissionModalOpen(false)}
          beforePasteButtonPress={() => setPastePermissionModalOpen(true)}
          errorMessage={errorMessage}
          placeholderLabel={t('recovery phrase')}
          showSuccess={showSuccess}
          value={value}
          onChange={onChange}
        />
      </Flex>
      <Button
        disabled={!submitEnabled}
        label={t('Continue')}
        name={ElementName.Next}
        onPress={onSubmit}
      />
    </SafeKeyboardOnboardingScreen>
  )
}
