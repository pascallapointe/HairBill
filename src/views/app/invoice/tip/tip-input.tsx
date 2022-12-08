import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { z } from 'zod';
import {
  Box,
  Button,
  FormControl,
  Icon,
  IFormControlProps,
  Input,
} from 'native-base';
import ValidationErrors from '@components/form/validation-errors';
import { HostComponent } from 'react-native';
import type { ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AmountList from '@views/app/invoice/tip/list';
import { useTranslation } from 'react-i18next';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

interface Props extends IFormControlProps {
  label?: string;
  value?: string;
  placeholder?: string;
  size?: ThemeComponentSizeType<'Input'>;
  color?: string;
  fontWeight?: string;
  required?: boolean;
  validation?: boolean;
  popoverPosition?: 'top' | 'bottom';
}

export type TipInputRef = {
  validate: (val?: string) => void;
  getValue: () => string;
};

const InputLabel: React.FC<{
  label?: string;
}> = ({ label }) => {
  if (label && label.length) {
    return (
      <FormControl.Label _text={{ fontSize: 'md', fontWeight: 'bold' }}>
        {label}
      </FormControl.Label>
    );
  }

  return null;
};

const TipInput = forwardRef<TipInputRef, Props>(
  (
    {
      label,
      value = '',
      placeholder,
      size = 'md',
      color = 'light.600',
      fontWeight = 'bold',
      required = true,
      validation = true,
      popoverPosition,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    // Input properties
    const [init, setInit] = useState(false);
    const [_value, setValue] = useState(value);
    const inputField = useRef<React.ElementRef<HostComponent<unknown>>>(null);
    const [error, setError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // Popover properties
    const [isOpen, setIsOpen] = useState(false);

    function initAndValidate(): void {
      if (!init) {
        setInit(true);
      }
      if (validation) {
        validate();
      }
    }

    function validate(val?: string): boolean {
      if (!init) {
        setInit(true);
      }

      const schema = z.preprocess(
        v => parseFloat((v as string).toString().replace(',', '.')),
        z
          .number({
            required_error: t<string>('validation.required'),
            invalid_type_error: t<string>('validation.numberType'),
          })
          .nonnegative({ message: t<string>('validation.positive') }),
      );

      let result = schema.safeParse(val ?? _value);

      setError(!result.success);
      setErrorMessages([]);

      if (!result.success) {
        setErrorMessages(result.error.issues.map(issue => issue.message));
      }

      return result.success;
    }

    function getValue(): string {
      return _value;
    }

    useImperativeHandle(ref, () => ({ validate, getValue }));

    function handleChange(val: string) {
      setValue(val);
      if (init && validation) {
        validate(val);
      }
    }

    function selectAmount(amount: string) {
      validate(amount);
      setValue(amount.toString());
      setIsOpen(false);
      inputField.current && inputField.current.blur();
    }

    return (
      <FormControl isInvalid={error} isRequired={required} {...props}>
        <InputLabel label={label} />
        <ValidationErrors
          m={0}
          mb={1}
          display={
            popoverPosition
              ? popoverPosition === 'bottom'
                ? 'flex'
                : 'none'
              : { md: 'none', lg: 'flex' }
          }
          error={error}
          errorMessages={errorMessages}
        />
        <Box width="100%" display={isOpen ? 'flex' : 'none'}>
          <Box
            bottom={
              popoverPosition
                ? popoverPosition === 'bottom'
                  ? '-187px'
                  : 0
                : { md: 0, lg: '-187px' }
            }
            position="absolute"
            zIndex={10}
            bgColor="white"
            rounded={4}
            shadow={5}
            width="100%"
            borderWidth={1}
            borderColor="violet.700">
            <AmountList
              query={_value?.replace(',', '.')}
              bindAmount={selectAmount}
            />
            <Button
              onPress={() => {
                setIsOpen(false);
                inputField.current && inputField.current.blur();
              }}
              variant="ghost"
              colorScheme="danger"
              position="absolute"
              zIndex={100}
              right={0}
              top={0}>
              <Icon
                bottom="1px"
                left="2px"
                size="md"
                as={FontAwesomeIcon}
                name="close"
                color="violet.700"
              />
            </Button>
          </Box>
        </Box>
        <Input
          ref={inputField}
          onFocus={e => {
            setIsOpen(true);
            // Workaround for selectTextOnFocus={true} not working
            e.currentTarget.setNativeProps({
              selection: { start: 0, end: _value?.length },
            });
          }}
          onBlur={() => {
            initAndValidate();
          }}
          onSubmitEditing={() => setIsOpen(false)}
          onChangeText={handleChange}
          clearButtonMode="while-editing"
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="numeric"
          InputLeftElement={
            <Icon
              as={FontAwesome5Icon}
              name="coins"
              top="1px"
              size={5}
              ml="2"
              color="muted.400"
            />
          }
          value={_value}
          placeholder={placeholder ? placeholder : ''}
          _focus={{
            borderColor: 'violet.700',
            bg: 'fuchsia.100',
          }}
          color={color}
          fontWeight={fontWeight}
          size={size}
        />
        <ValidationErrors
          display={
            popoverPosition
              ? popoverPosition === 'bottom'
                ? 'none'
                : 'flex'
              : { md: 'flex', lg: 'none' }
          }
          error={error}
          errorMessages={errorMessages}
        />
      </FormControl>
    );
  },
);

export default TipInput;
