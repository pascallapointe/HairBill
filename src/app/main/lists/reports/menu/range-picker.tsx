import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Divider,
  FormControl,
  Heading,
  HStack,
  Icon,
  Text,
} from 'native-base';
import { z } from 'zod';
import ValidationErrors from '@components/form/validation-errors';
import DatePicker from 'react-native-date-picker';
import { useTranslation } from 'react-i18next';
import { createTimestamp, generateDateRange } from '@lib/utils';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

export type DateRange = { startTime: number; endTime: number };

export type RangePickerRef = {
  getValue: () => DateRange;
  validate: (val?: DateRange) => boolean;
};

const RangePicker = forwardRef<RangePickerRef>(({}, ref) => {
  const { t, i18n } = useTranslation();
  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [startOn, setStartOn] = useState(new Date());
  const [endOn, setEndOn] = useState(new Date());
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  useImperativeHandle(ref, () => ({ getValue, validate }));

  function getValue(): DateRange {
    return generateDateRange(startOn, endOn);
  }

  function validate(val?: DateRange): boolean {
    let range: DateRange;

    if (val) {
      range = val;
    } else {
      range = generateDateRange(startOn, endOn);
    }

    let result = z
      .number()
      .min(range.startTime, t<string>('lists.rangeError'))
      .safeParse(range.endTime);

    setError(!result.success);
    setErrorMessages([]);

    if (!result.success) {
      setErrorMessages(result.error.issues.map(issue => issue.message));
    }

    return result.success;
  }

  return (
    <FormControl isInvalid={error} isRequired={true}>
      <HStack>
        <Box mb={4} mx={2} alignItems="center">
          <Heading size="md" mt={2} color="violet.700">
            {t<string>('lists.startOn')}
          </Heading>
          <Divider mb={2} bg="violet.700" />
          <HStack justifyContent="center" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" mr={2}>
              {createTimestamp(startOn, false)}
            </Text>
            <Button
              variant="outline"
              colorScheme="purple"
              onPress={() => setOpenStart(true)}>
              <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
            </Button>
          </HStack>
          <DatePicker
            modal
            title={t<string>('selectDate')}
            confirmText={t<string>('select')}
            locale={i18n.language}
            mode="date"
            open={openStart}
            date={startOn}
            onConfirm={d => {
              setOpenStart(false);
              setStartOn(d);
            }}
            onCancel={() => {
              setOpenStart(false);
            }}
          />
        </Box>
        <Box mb={4} mx={2} alignItems="center">
          <Heading size="md" mt={2} color="violet.700">
            {t<string>('lists.endOn')}
          </Heading>
          <Divider mb={2} bg="violet.700" />
          <HStack justifyContent="center" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" mr={2}>
              {createTimestamp(endOn, false)}
            </Text>
            <Button
              variant="outline"
              colorScheme="purple"
              onPress={() => setOpenEnd(true)}>
              <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
            </Button>
          </HStack>
          <DatePicker
            modal
            title={t<string>('selectDate')}
            confirmText={t<string>('select')}
            locale={i18n.language}
            mode="date"
            open={openEnd}
            date={endOn}
            onConfirm={d => {
              setOpenEnd(false);
              if (validate(generateDateRange(startOn, d))) {
                setEndOn(d);
              }
            }}
            onCancel={() => {
              setOpenEnd(false);
            }}
          />
        </Box>
      </HStack>
      <Center>
        <ValidationErrors error={error} errorMessages={errorMessages} />
      </Center>
    </FormControl>
  );
});

export default RangePicker;
