import React from 'react';
import { Button, Flex, Icon } from 'native-base';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

export type FilterType = 'all' | 'pending';

const Filters: React.FC<{
  value: FilterType;
  setFilter: (filter: FilterType) => void;
}> = ({ value = 'annual', setFilter }) => {
  const { t } = useTranslation();

  const options: FilterType[] = ['all', 'pending'];

  return (
    <Flex
      direction="row"
      wrap="wrap"
      alignContent={'center'}
      alignItems={'center'}>
      {options.map((v, i) => (
        <Button
          key={`format-${i}`}
          mx={1}
          leftIcon={
            value === v ? <Icon as={FontAwesomeIcon} name="eye" /> : undefined
          }
          size="sm"
          colorScheme={value === v ? 'lime' : 'muted'}
          shadow={4}
          onPress={() => setFilter(v)}>
          {t<string>(`lists.${v}`)}
        </Button>
      ))}
    </Flex>
  );
};

export default Filters;
