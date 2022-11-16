import React, { PropsWithChildren } from 'react';
import { Box, Heading, Divider, IBoxProps, HStack } from 'native-base';

interface Props extends IBoxProps {
  title?: string;
  titleAlign?: 'left' | 'center' | 'right';
  options?: React.ReactNode;
}

const Card: React.FC<PropsWithChildren<Props>> = ({
  children,
  title,
  titleAlign,
  options,
  ...props
}) => {
  return (
    <Box backgroundColor="white" rounded="md" shadow={5} {...props}>
      <HStack>
        <Heading
          display={title ? 'flex' : 'none'}
          textAlign={titleAlign ? titleAlign : 'left'}
          color="purple.600"
          size="lg"
          px={4}
          py={2}>
          {title}
        </Heading>
        <Box display={options ? 'flex' : 'none'} marginLeft="auto" p={2}>
          {options}
        </Box>
      </HStack>

      <Divider display={title ? 'flex' : 'none'} mb="2" bg="muted.400" />
      <Box px={4}>{children}</Box>
    </Box>
  );
};

export default Card;
