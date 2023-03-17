import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, HStack, Icon, Text } from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

export type QuarterPickerRef = {
  getValue: () => number;
};

/**
 * Value must be in [1, 4] range
 */
const QuarterPicker = forwardRef<QuarterPickerRef, { value: number }>(
  ({ value = 1 }, ref) => {
    const [quarter, setQuarter] = useState<number>(value - 1);
    useImperativeHandle(ref, () => ({ getValue }));

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    function getValue(): number {
      return quarter + 1;
    }

    return (
      <HStack>
        <HStack alignItems="flex-start">
          <Button
            onPress={() => setQuarter(v => (v ? (v - 1) % 4 : 3))}
            p={2}
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
            p={1}
            minW="40px"
            fontSize="xl"
            fontWeight="bold"
            color="muted.500"
            textAlign="center">
            {quarters[quarter]}
          </Text>
          <Button
            onPress={() => setQuarter(v => (v + 1) % 4)}
            p={2}
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

export default QuarterPicker;
