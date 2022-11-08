import React, { PropsWithChildren } from 'react';
import { Box, Heading, Divider, Container } from 'native-base';

const Card: React.FC<
  PropsWithChildren<{
    title: string;
    titleCenter?: boolean;
  }>
> = ({ children, title, titleCenter, ...props }) => {
  return (
    <Box backgroundColor="white" rounded="md" shadow={5} {...props}>
      <Heading
        textAlign={titleCenter ? 'center' : 'left'}
        color="purple.600"
        size="lg"
        p={2}>
        {title}
      </Heading>
      <Divider mb="2" bg="muted.400" />
      <Container p={2}>{children}</Container>
    </Box>
  );
};

export default Card;
