import React, { memo } from 'react'
import { Box, Flex } from 'src/components/layout'
import { Theme } from 'src/styles/theme'

type Props = {
  size?: number
  color?: keyof Theme['colors']
}

export const TripleDot = memo(({ size = 5, color = 'textSecondary' }: Props) => {
  return (
    <Flex row gap="xxs">
      <Box bg={color} borderRadius="full" height={size} width={size} />
      <Box bg={color} borderRadius="full" height={size} width={size} />
      <Box bg={color} borderRadius="full" height={size} width={size} />
    </Flex>
  )
})
