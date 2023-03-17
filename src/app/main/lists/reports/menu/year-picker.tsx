import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, HStack, Icon, Text } from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

export type YearPickerRef = {
  getValue: () => number;
};

const YearPicker = forwardRef<YearPickerRef, { value: number }>(
  ({ value }, ref) => {
    const [year, setYear] = useState<number>(value);
    useImperativeHandle(ref, () => ({ getValue }));

    function getValue(): number {
      return year;
    }

    return (
      <HStack>
        <HStack alignItems="flex-start">
          <Button
            onPress={() => setYear(v => v - 1)}
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
            minW="30px"
            fontSize="xl"
            fontWeight="bold"
            color="muted.500"
            textAlign="center">
            {year}
          </Text>
          <Button
            onPress={() => setYear(v => v + 1)}
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

export default YearPicker;
