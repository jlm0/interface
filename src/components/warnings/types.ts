import { Theme } from 'src/styles/theme'

export enum WarningSeverity {
  None = 0,
  Medium = 5,
  High = 10,
}

export type WarningColor = {
  text: keyof Theme['colors']
  background: keyof Theme['colors']
}

export enum WarningAction {
  None = 'none',

  // prevents users from continuing to the review screen
  DisableReview = 'disable_review',

  // allows users to continue to review screen, but requires them to
  // acknowledge a popup warning before submitting
  WarnBeforeSubmit = 'warn_before_submit',

  // same as WarnBeforeSubmit but pops up after recipient is selected (transfer only)
  WarnAfterRecipientSelect = 'warn_after_recipient_select',

  // prevents submission altogether
  DisableSubmit = 'disable_submit',
}

export enum WarningLabel {
  InsufficientFunds = 'insufficient_funds',
  InsufficientGasFunds = 'insufficient_gas_funds',
  FormIncomplete = 'form_incomplete',
  UnsupportedNetwork = 'unsupported_network',
  PriceImpactMedium = 'price_impact_medium',
  PriceImpactHigh = 'price_impact_high',
  LowLiquidity = 'low_liquidity',
  SwapRouterError = 'swap_router_error',
  RecipientZeroBalances = 'recipient_zero_balances',
}

export enum WarningModalType {
  INFORMATIONAL, // contains text that users can acknowledge
  ACTION, // calls callback functions on cancel / confirm
  NONE, // no warning modal
}

export interface Warning {
  type: WarningLabel
  severity: WarningSeverity
  action: WarningAction
  title?: string
  message?: string
  warningModal?: WarningModalType
}
