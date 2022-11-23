import React from 'react';
import { Box, Flex, HStack, Skeleton, VStack } from 'native-base';

const SkeletonView = () => (
  <Box>
    <Flex direction="row" m={5} justifyContent="space-evenly">
      <HStack>
        <Skeleton w={20} h={5} mr={2} />
        <Skeleton w={12} h={5} rounded={10} startColor="violet.200" />
      </HStack>
      <HStack>
        <Skeleton w={20} h={5} mr={2} />
        <Skeleton w={12} h={5} rounded={10} startColor="violet.200" />
      </HStack>
      <HStack>
        <Skeleton w={20} h={5} mr={2} />
        <Skeleton w={12} h={5} rounded={10} startColor="violet.200" />
      </HStack>
    </Flex>

    <Box mt={2}>
      <Skeleton maxW="150px" h={5} mr={2} mb={2} />
      <Skeleton maxW="300px" h={8} mr={2} rounded={4} />

      <HStack space={4} my={2}>
        <VStack w="300px">
          <Skeleton maxW="150px" h={5} mr={2} mb={2} />
          <Skeleton maxW="300px" h={8} mr={2} rounded={4} />
        </VStack>

        <VStack w="300px">
          <Skeleton maxW="150px" h={5} mr={2} mb={2} />
          <Skeleton maxW="300px" h={8} mr={2} rounded={4} />
        </VStack>
      </HStack>

      <HStack space={4} my={2}>
        <VStack w="300px">
          <Skeleton maxW="150px" h={5} mr={2} mb={2} />
          <Skeleton maxW="300px" h={8} mr={2} rounded={4} />
        </VStack>

        <VStack w="300px">
          <Skeleton maxW="150px" h={5} mr={2} mb={2} />
          <Skeleton maxW="300px" h={8} mr={2} rounded={4} />
        </VStack>
      </HStack>
    </Box>
  </Box>
);

export default SkeletonView;
