import React from 'react';
import { Button, Flex, Icon } from 'native-base';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

export type ReportFormatType = 'annual' | 'quarterly' | 'monthly' | 'custom';

const FormatPicker: React.FC<{
  value: ReportFormatType;
  setFormat: (format: ReportFormatType) => void;
}> = ({ value = 'annual', setFormat }) => {
  const { t } = useTranslation();

  const options: ReportFormatType[] = [
    'annual',
    'quarterly',
    'monthly',
    'custom',
  ];

  return (
    <Flex py={2} direction="row" wrap="wrap" justifyContent="center">
      {options.map((v, i) => (
        <Button
          key={`format-${i}`}
          m={2}
          leftIcon={
            value === v ? <Icon as={FontAwesomeIcon} name="check" /> : undefined
          }
          size="md"
          minW="120px"
          colorScheme={value === v ? 'lime' : 'muted'}
          shadow={4}
          onPress={() => setFormat(v)}>
          {t<string>(`lists.${v}`)}
        </Button>
      ))}
    </Flex>
  );
};

export default FormatPicker;
