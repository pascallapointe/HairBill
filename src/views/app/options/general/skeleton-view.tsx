import React from 'react';
import { Box, Center, Skeleton, Stack, VStack } from 'native-base';

const SkeletonView = () => (
  <Box>
    <Stack
      direction={{ md: 'column', lg: 'row' }}
      alignItems={{ md: 'center', lg: 'baseline' }}
      justifyContent="space-evenly">
      <VStack w="300px" mb={3}>
        <Skeleton maxW="150px" h={5} mr={2} mb={2} />
        <Skeleton maxW="300px" h={8} mr={2} rounded={4} />
      </VStack>

      <VStack w="300px" mb={3}>
        <Skeleton maxW="150px" h={5} mr={2} mb={2} />
        <Skeleton maxW="300px" h={8} mr={2} rounded={4} />
      </VStack>
    </Stack>

    <Stack
      direction={{ md: 'column', lg: 'row' }}
      alignItems={{ md: 'center', lg: 'baseline' }}
      justifyContent="space-evenly">
      <VStack w="300px" mb={3}>
        <Skeleton maxW="150px" h={5} mr={2} mb={2} />
        <Skeleton maxW="300px" h={8} mr={2} rounded={4} />
      </VStack>

      <VStack w="300px" mb={3}>
        <Skeleton maxW="150px" h={5} mr={2} mb={2} />
        <Skeleton maxW="300px" h="100px" mr={2} rounded={4} />
      </VStack>
    </Stack>
    <Center>
      <Skeleton h={10} w="150px" rounded={4} />
    </Center>
  </Box>
);

export default SkeletonView;
