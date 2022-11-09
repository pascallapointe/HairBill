import React, { PropsWithChildren } from 'react';
import { Box, Heading, Divider, IBoxProps } from 'native-base';

interface Props extends IBoxProps {
  title: string;
  titleAlign?: 'left' | 'center' | 'right';
}

const Card: React.FC<PropsWithChildren<Props>> = ({
  children,
  title,
  titleAlign,
  ...props
}) => {
  return (
    <Box backgroundColor="white" rounded="md" shadow={5} {...props}>
      <Heading
        textAlign={titleAlign ? titleAlign : 'left'}
        color="purple.600"
        size="lg"
        p={2}>
        {title}
      </Heading>
      <Divider mb="2" bg="muted.400" />
      <Box px={4}>{children}</Box>
    </Box>
  );
};

export default Card;
