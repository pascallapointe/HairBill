import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Center, Flex, FormControl, Icon } from 'native-base';
import { z } from 'zod';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import ValidationErrors from '@components/form/validation-errors';

export type InclusionType =
  | 'cash'
  | 'transfer'
  | 'check'
  | 'pending'
  | 'deleted';

export type InclusionPickerRef = {
  getValue: () => InclusionType[];
  validate: (val?: InclusionType[]) => boolean;
};

const InclusionPicker = forwardRef<
  InclusionPickerRef,
  { value?: InclusionType[] }
>(({ value = ['cash', 'transfer', 'check'] }, ref) => {
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [inclusions, setInclusions] = useState<InclusionType[]>(value);
  useImperativeHandle(ref, () => ({ getValue, validate }));

  const options: InclusionType[] = [
    'cash',
    'transfer',
    'check',
    'pending',
    'deleted',
  ];

  function getValue(): InclusionType[] {
    return inclusions;
  }

  function validate(val?: InclusionType[]): boolean {
    let result = z
      .string()
      .array()
      .min(1, t<string>('lists.includeAtLeast1'))
      .safeParse(
        val?.filter(v => v !== 'deleted') ??
          inclusions.filter(v => v !== 'deleted'),
      );

    setError(!result.success);
    setErrorMessages([]);

    if (!result.success) {
      setErrorMessages(result.error.issues.map(issue => issue.message));
    }

    return result.success;
  }

  return (
    <FormControl isInvalid={error} isRequired={true}>
      <Center>
        <ValidationErrors error={error} errorMessages={errorMessages} />
      </Center>
      <Flex
        py={2}
        direction="row"
        maxW={{ md: '500px', lg: '700px' }}
        wrap="wrap"
        justifyContent="center">
        {options.map((v, i) => (
          <Button
            key={`format-${i}`}
            m={2}
            leftIcon={
              inclusions.includes(v) ? (
                <Icon as={FontAwesomeIcon} name="check" />
              ) : undefined
            }
            size="md"
            minW="120px"
            colorScheme={
              inclusions.includes(v)
                ? v === 'deleted'
                  ? 'danger'
                  : 'lime'
                : 'muted'
            }
            shadow={4}
            onPress={() =>
              setInclusions(
                inclusions.includes(v)
                  ? inclusions.filter(incl => incl !== v)
                  : [...inclusions, v],
              )
            }>
            {t<string>(`lists.${v}`)}
          </Button>
        ))}
      </Flex>
    </FormControl>
  );
});

export default InclusionPicker;
