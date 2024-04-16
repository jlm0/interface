import { ChainId } from '@uniswap/sdk-core'
import { CapsuleEthersSigner } from '@usecapsule/ethers-v6-integration'
import Capsule, { Branding, CapsuleModal, ConstructorOpts, Environment, OAuthMethod } from '@usecapsule/react-sdk'
import { useAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { APP_RPC_URLS } from 'constants/networks'
import { ethers } from 'ethersv6'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { lightTheme } from 'theme/colors'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'

const capsuleBetaAPIKey = '2627ac16f827521a370bd988e8780422'

const capsuleConstructOpts:ConstructorOpts = {
  portalBackgroundColor: lightTheme.background,
  portalPrimaryButtonColor: lightTheme.accent1,
  portalTextColor: lightTheme.neutral1,
  portalPrimaryButtonTextColor: lightTheme.white,
}
const capsuleClient = new Capsule(Environment.DEVELOPMENT, capsuleBetaAPIKey,capsuleConstructOpts)

export const capsuleEthersProvider = new ethers.JsonRpcProvider(APP_RPC_URLS[ChainId.SEPOLIA][0], ChainId.SEPOLIA)
export const capsuleEthersSigner = new CapsuleEthersSigner(capsuleClient, capsuleEthersProvider)

const capsuleModalOAuthMethods = [
  OAuthMethod.GOOGLE,
  OAuthMethod.FACEBOOK,
  OAuthMethod.APPLE,
  OAuthMethod.TWITTER,
  OAuthMethod.DISCORD,

]

const capsuleModalBranding:Branding = {
  colors: {
    primaryButton: {
      surface: {
        default: lightTheme.accent1,
      },
      border: {
        default: 'transparent',
        disabled: 'transparent',
      },
    },
    input: {
      surface: {
        disabled: 'red',
        default: lightTheme.surface1,
      },
      border: {
        placeholder: lightTheme.neutral3,
        active: lightTheme.neutral3,
      },
    },
  },
}

const capsuleModalOpenAtom = atom<boolean>(false)
export const capsuleLoggedInAtom = atom<boolean>(false)
export const capsuleWalletAddressAtom = atom<string | undefined>(undefined)

export const useResetCapsule = () => {
  const [, setIsOpen] = useAtom(capsuleModalOpenAtom)
  const [, setLoggedIn] = useAtom(capsuleLoggedInAtom)
  const [, setWalletAddress] = useAtom(capsuleWalletAddressAtom)

  return useCallback(() => {
    setIsOpen(false)
    setLoggedIn(false)
    setWalletAddress(undefined)
    capsuleClient.logout()
  }, [setIsOpen, setLoggedIn, setWalletAddress])
}

const Wrapper = styled.div<{ disabled: boolean }>`
  align-items: stretch;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  width: 100%;
  background-color: ${({ theme }) => theme.surface2};
  &:hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    background-color: ${({ theme, disabled }) => !disabled && theme.surface3};
  }
  &:focus {
    background-color: ${({ theme, disabled }) => !disabled && theme.surface3};
  }
`

const OptionCardClickable = styled.button<{ selected: boolean }>`
  align-items: center;
  background-color: unset;
  border: none;
  cursor: pointer;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  justify-content: space-between;
  padding: 18px;
  transition: ${({ theme }) => theme.transition.duration.fast};
  opacity: ${({ disabled, selected }) => (disabled && !selected ? '0.5' : '1')};
`

const OptionCardLeft = styled.div`
  ${flexColumnNoWrap};
  flex-direction: row;
  align-items: center;
`

const IconWrapper = styled.div`
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  img {
    ${({ theme }) => !theme.darkMode && `border: 1px solid ${theme.surface3}`};
    border-radius: 12px;
  }
  & > img,
  span {
    height: 40px;
    width: 40px;
  }
`

const HeaderText = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.neutral1};
  font-size: 16px;
  font-weight: 535;
  padding: 0 8px;
`

export default function UseCapsuleOption() {
  const [isOpen, setIsOpen] = useAtom(capsuleModalOpenAtom)

  const handleOptionClick = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  return (
    <Wrapper disabled={false}>
      <OptionCardClickable disabled={false} onClick={handleOptionClick} selected={false}>
        <OptionCardLeft>
          <IconWrapper>
            <img src={'/images/256x256_App_Icon_Pink.svg'} alt="Capsule Icon" />
          </IconWrapper>
          <HeaderText>Continue with Email</HeaderText>
        </OptionCardLeft>
      </OptionCardClickable>
    </Wrapper>
  )
}

export function CapsuleModalSetup() {
  const [isOpen, setIsOpen] = useAtom(capsuleModalOpenAtom)
  const [isLoggedIn, setLoggedIn] = useAtom(capsuleLoggedInAtom)
  const [, setWalletAddress] = useAtom(capsuleWalletAddressAtom)
  const [walletDrawerOpen, toggleWalletDrawer] = useAccountDrawer()
  const navigate = useNavigate()

  const updateLoginStatus = useCallback(async () => {
    const isLoggedIn = await capsuleClient.isSessionActive()
    setLoggedIn(isLoggedIn)
    if (isLoggedIn) {
      const wallets = capsuleClient.getWallets()
      const firstKey = Object.keys(wallets)[0]
      const currentWalletAddress = wallets[firstKey]?.address
      const currentWalletId = wallets[firstKey]?.id

      setWalletAddress(currentWalletAddress)
    } else {
      setWalletAddress(undefined)
    }
  }, [setLoggedIn, setWalletAddress])

  useEffect(() => {
    if (!isOpen) {
      if (isLoggedIn && walletDrawerOpen) {
        toggleWalletDrawer()
      }
    }
    updateLoginStatus()
  }, [isOpen, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/swap')
    }
  }, [isLoggedIn])

  return (
    <CapsuleModal
      capsule={capsuleClient}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      oAuthMethods={capsuleModalOAuthMethods}
      branding={capsuleModalBranding}
      logo={'/images/uniswap-horizontal.png'}
      appName='Uniswap'
    />
  )
}
