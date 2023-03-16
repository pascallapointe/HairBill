import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Button, HStack, Icon, Text } from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';

export type MonthPickerRef = {
  getValue: () => number;
};

/**
 * Value must be in [1, 12] range
 */
const MonthPicker = forwardRef<MonthPickerRef, { value: number }>(
  ({ value = 1 }, ref) => {
    const { t } = useTranslation();
    const [month, setMonth] = useState<number>(value - 1);
    useImperativeHandle(ref, () => ({ getValue }));

    useEffect(() => setMonth(value - 1), [value]);

    const months = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];

    function getValue(): number {
      return month + 1;
    }

    return (
      <HStack>
        <HStack alignItems="flex-start">
          <Button
            onPress={() => setMonth(v => (v ? (v - 1) % 12 : 11))}
            p={1}
            size="md"
            variant="ghost"
            colorScheme="pink">
            <Icon
              as={FontAwesome5Icon}
              left={1.5}
              name="caret-left"
              color="pink.500"
              size="lg"
            />
          </Button>
          <Text
            mx={1}
            minW="110px"
            fontSize="xl"
            fontWeight="bold"
            color="muted.500"
            textAlign="center">
            {t<string>(`months.${months[month]}`)}
          </Text>
          <Button
            onPress={() => setMonth(v => (v + 1) % 12)}
            p={1}
            size="md"
            variant="ghost"
            colorScheme="pink">
            <Icon
              as={FontAwesome5Icon}
              left={2}
              name="caret-right"
              color="pink.500"
              size="lg"
            />
          </Button>
        </HStack>
      </HStack>
    );
  },
);

export default MonthPicker;
