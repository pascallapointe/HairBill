import React, { memo } from 'react';
import { InvoiceType } from '@app/main/invoice/invoice.repository';
import { Box, Button, HStack, Icon, Text, VStack } from 'native-base';
import { createTimestamp } from '@lib/utils';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const ListItem: React.FC<{
  item: InvoiceType;
  edit: (invoice: InvoiceType) => void;
  remove: (id: string, restore: boolean) => void;
  viewReceipt: (receipt: InvoiceType) => void;
}> = ({ item, viewReceipt, edit, remove }) => {
  return (
    <HStack py={2} borderBottomWidth={1} borderColor="muted.300">
      <VStack w="240px">
        <HStack>
          <Text
            w="80px"
            fontFamily="Menlo"
            fontSize="md"
            fontWeight="bold"
            color={
              item.deletedAt
                ? 'red.500'
                : item.updatedAt
                ? 'purple.500'
                : 'muted.500'
            }>
            {item.invoiceNumber}
          </Text>
          <Text
            ml={4}
            w="160px"
            fontFamily="Menlo"
            fontSize="md"
            fontWeight="bold"
            color="muted.500">
            {createTimestamp(new Date(item.date))}
          </Text>
        </HStack>
        {item.updatedAt && !item.deletedAt ? (
          <Text
            fontFamily="Menlo"
            fontSize="sm"
            fontWeight="bold"
            color="purple.500">
            Mod: {createTimestamp(new Date(item.updatedAt))}
          </Text>
        ) : (
          ''
        )}
        {item.deletedAt ? (
          <Text
            fontFamily="Menlo"
            fontSize="sm"
            fontWeight="bold"
            color="red.500">
            Del: {createTimestamp(new Date(item.deletedAt))}
          </Text>
        ) : (
          ''
        )}
        <Box
          flexDirection="row"
          display={
            (item.updatedAt && item.updateNote.length && !item.deletedAt) ||
            (item.deletedAt && item.deleteNote.length)
              ? 'flex'
              : 'none'
          }>
          <Text fontWeight="bold" color="muted.500">
            Note:
          </Text>
          <Text ml={1} color="muted.500">
            {item.deletedAt ? item.deleteNote : item.updateNote}
          </Text>
        </Box>
      </VStack>

      <VStack ml={4} w={{ md: '210px', lg: '200px' }}>
        <Text
          isTruncated={true}
          fontSize="md"
          fontWeight="bold"
          color="fuchsia.600"
          textAlign="center">
          {item.client.name}
        </Text>
        <Text
          isTruncated={true}
          fontSize="sm"
          fontWeight="bold"
          color="muted.500"
          textAlign="center">
          {item.client.phone.length ? item.client.phone : ' '}
        </Text>
      </VStack>
      <HStack ml="auto" maxH="45px">
        <Button
          onPress={() => viewReceipt(item)}
          ml={4}
          variant="outline"
          colorScheme="amber">
          <Icon
            as={FontAwesome5Icon}
            left="2px"
            name="receipt"
            color="violet.400"
          />
        </Button>
        <Button
          onPress={() => edit(item)}
          ml={2}
          variant="outline"
          colorScheme="amber">
          <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
        </Button>
        <Button
          onPress={() =>
            item.id ? remove(item.id, item.deletedAt != null) : null
          }
          ml={2}
          variant="outline"
          colorScheme="danger">
          <Icon
            left={item.deletedAt != null ? '0px' : '1px'}
            as={FontAwesome5Icon}
            name={item.deletedAt ? 'recycle' : 'trash'}
            color={item.deletedAt ? 'lime.500' : 'muted.500'}
          />
        </Button>
      </HStack>
    </HStack>
  );
};

export default memo(ListItem);
