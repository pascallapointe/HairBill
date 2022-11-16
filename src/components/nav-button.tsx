import React from 'react';
import { Box, Button, Center, Text } from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

interface Props {
  action: () => void;
  text: string;
  icon: string;
}

const NavButton: React.FC<Props> = ({ action, text, icon }) => {
  return (
    <Button
      onPress={action}
      bg="violet.800"
      _pressed={{ opacity: '40' }}
      m={4}
      p={4}
      height="180px"
      width="200px"
      shadow={6}>
      <Center>
        <Box mb={4}>
          <FontAwesome5Icon name={icon} size={40} color="#fff" />
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="white">
          {text}
        </Text>
      </Center>
    </Button>
  );
};

export default NavButton;
