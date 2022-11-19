import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Button,
  Flex,
  FormControl,
  HStack,
  IFormControlProps,
  ScrollView,
} from 'native-base';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import ValidationErrors from '@components/form/validation-errors';

type OptionType = { key: string; name: string };

interface Props extends IFormControlProps {
  label: string;
  bindValue: (val: any) => void;
  options: OptionType[];
  defaultSelection?: OptionType;
  required?: boolean;
}

export type SelectRef = {
  validate: (val?: OptionType | null) => void;
};

const Selection: React.FC<{
  selected: OptionType | null;
  setView: (view: 'selection' | 'options') => void;
}> = ({ selected, setView }) => {
  const { t } = useTranslation();
  return (
    <HStack justifyContent="space-between">
      <Button
        onPress={() => setView('options')}
        rounded={15}
        _text={{ fontSize: 'md', fontWeight: 'bold' }}
        colorScheme="lime"
        shadow={2}>
        {selected ? selected.name : t('none')}
      </Button>
      <Button
        variant="outline"
        onPress={() => setView('options')}
        colorScheme="warmGray">
        {t('change')}
      </Button>
    </HStack>
  );
};

const Options: React.FC<{
  options: OptionType[];
  select: (category: OptionType | null) => void;
}> = ({ options, select }) => {
  return (
    <ScrollView>
      <Flex direction="row" wrap="wrap">
        {options.map(option => (
          <Button
            m={1}
            size="sm"
            onPress={() => select(option.key === 'none' ? null : option)}
            rounded={15}
            _text={{ fontWeight: 'bold' }}
            colorScheme="lime"
            shadow={2}>
            {option.name}
          </Button>
        ))}
      </Flex>
    </ScrollView>
  );
};

const Select = forwardRef<SelectRef, Props>(
  (
    {
      label,
      bindValue,
      options,
      defaultSelection = null,
      required = false,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'selection' | 'options'>('selection');
    const [selected, setSelected] = useState<OptionType | null>(
      defaultSelection,
    );
    const [error, setError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    function select(option: OptionType | null) {
      setSelected(option);
      setView('selection');
      bindValue(option ?? null);
      validate(option);
    }

    function validate(option?: OptionType | null): boolean {
      const baseSchema = z.string({
        required_error: t('validation.required'),
        invalid_type_error: t('validation.stringType'),
      });
      const schema = required
        ? baseSchema.min(1, { message: t('validation.required') })
        : baseSchema.nullable();

      const value = option === undefined ? selected : option;

      let result = schema.safeParse(value ? value.key : null);

      setError(!result.success);
      setErrorMessages([]);

      if (!result.success) {
        setErrorMessages(result.error.issues.map(issue => issue.message));
      }

      return result.success;
    }

    useImperativeHandle(ref, () => ({ validate }));

    return (
      <FormControl
        isInvalid={error}
        isRequired={required}
        minW="100%"
        {...props}>
        <HStack>
          <FormControl.Label _text={{ fontSize: 'md', fontWeight: 'bold' }}>
            {label}
          </FormControl.Label>
        </HStack>
        {view === 'selection' ? (
          <Selection selected={selected} setView={setView} />
        ) : (
          <Options
            options={
              required
                ? options
                : [{ key: 'none', name: t('none') }, ...options]
            }
            select={select}
          />
        )}
        <ValidationErrors error={error} errorMessages={errorMessages} />
      </FormControl>
    );
  },
);

export default Select;
