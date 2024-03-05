import React, { memo } from 'react';
import { Button, HStack, Icon, Text } from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { ClientType } from '@app/main/invoice/client/client.repository.ts';

const ListItem: React.FC<{
  item: ClientType;
  edit: (client: ClientType) => void;
  remove: (client: ClientType) => void;
}> = ({ item, edit, remove }) => {
  return (
    <HStack py={2} borderBottomWidth={1} borderColor="muted.300">
      <HStack height={'38px'} alignItems={'center'}>
        <Text
          width={'250px'}
          mr="20px"
          isTruncated={true}
          fontSize="md"
          fontWeight="bold"
          color="fuchsia.600">
          {item.name}
        </Text>
        <Text
          isTruncated={true}
          fontSize="sm"
          fontWeight="bold"
          color="muted.500">
          {item.phone.length ? item.phone : ' '}
        </Text>
      </HStack>
      <HStack ml="auto" maxH="40px">
        <Button
          onPress={() => edit(item)}
          ml={2}
          variant="outline"
          colorScheme="amber">
          <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
        </Button>
        <Button
          onPress={() => (item.id ? remove(item) : null)}
          ml={2}
          variant="outline"
          colorScheme="danger">
          <Icon
            left="1px"
            as={FontAwesome5Icon}
            name="trash"
            color="muted.500"
          />
        </Button>
      </HStack>
    </HStack>
  );
};

export default memo(ListItem);
