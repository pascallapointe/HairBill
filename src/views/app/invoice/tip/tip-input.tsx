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
import type {
  AutoCapitalizeType,
  AndroidAutoCompleteType,
  iOSClearButtonModeType,
} from '@type/form.type';
import {
  HostComponent,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import type { ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AmountList from '@views/app/invoice/tip/list';
import { useTranslation } from 'react-i18next';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

interface Props extends IFormControlProps {
  bindValue: (val: string) => void;
  label?: string;
  value?: string;
  placeholder?: string;
  size?: ThemeComponentSizeType<'Input'>;
  color?: string;
  fontWeight?: string;
  required?: boolean;
  clear?: iOSClearButtonModeType;
  autoComplete?: AndroidAutoCompleteType;
  autoCorrect?: boolean;
  autoCapitalize?: AutoCapitalizeType;
  validation?: boolean;
}

export type TipInputRef = {
  validate: (val?: string) => void;
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
      bindValue,
      placeholder,
      size = 'md',
      color = 'light.600',
      fontWeight = 'bold',
      clear = 'never',
      autoComplete = 'off',
      autoCorrect = false,
      autoCapitalize = 'words',
      required = true,
      validation = true,
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

    function initAndValidate(
      e: NativeSyntheticEvent<TextInputFocusEventData>,
    ): void {
      if (!init) {
        setInit(true);
      }
      if (validation) {
        validate(e.nativeEvent.text);
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

    useImperativeHandle(ref, () => ({ validate }));

    function handleChange(val: string) {
      setIsOpen(true);

      setValue(val);
      bindValue(val);
      if (init && validation) {
        validate(val);
      }
    }

    function selectAmount(amount: string) {
      setValue(amount.toString());
      bindValue(amount);
      setIsOpen(false);
      inputField.current && inputField.current.blur();
    }

    return (
      <FormControl isInvalid={error} isRequired={required} {...props}>
        <InputLabel label={label} />
        <ValidationErrors
          m={0}
          mb={1}
          display={{ md: 'none', lg: 'flex' }}
          error={error}
          errorMessages={errorMessages}
        />
        <Box width="100%" display={isOpen ? 'flex' : 'none'}>
          <Box
            bottom={{ md: 0, lg: '-187px' }}
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
          onBlur={e => {
            initAndValidate(e);
          }}
          onChangeText={handleChange}
          clearButtonMode={clear}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          keyboardType="number-pad"
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
          display={{ md: 'flex', lg: 'none' }}
          error={error}
          errorMessages={errorMessages}
        />
      </FormControl>
    );
  },
);

export default TipInput;
