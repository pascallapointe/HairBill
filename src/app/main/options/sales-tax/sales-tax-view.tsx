import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  HStack,
  Text,
} from 'native-base';
import { useTranslation } from 'react-i18next';
import SwitchBtn from '@components/form/switch';
import TextInput, { InputRef } from '@components/form/text-input';
import {
  getTaxSettings,
  TaxSettingsType,
  updateTaxSettings,
} from '@app/main/options/sales-tax/sales-tax.repository';
import SkeletonView from '@app/main/options/sales-tax/skeleton-view';
import { z } from 'zod';
import Modal, { ModalRef } from '@components/modal';

const SalesTaxView = () => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false);
  const [useBTax, setUseBTax] = useState<boolean>(false);
  const [compoundTax, setCompoundTax] = useState<boolean>(false);
  const [includeTax, setIncludeTax] = useState<boolean>(false);
  const taxANumField = useRef<InputRef>(null);
  const [taxANum, setTaxANum] = useState('');
  const taxBNumField = useRef<InputRef>(null);
  const [taxBNum, setTaxBNum] = useState('');
  const taxAField = useRef<InputRef>(null);
  const [taxA, setTaxA] = useState<number>(0);
  const taxANameField = useRef<InputRef>(null);
  const [taxAName, setTaxAName] = useState('');
  const taxBField = useRef<InputRef>(null);
  const [taxB, setTaxB] = useState<number>(0);
  const taxBNameField = useRef<InputRef>(null);
  const [taxBName, setTaxBName] = useState('');

  // Modal
  const successModal = useRef<ModalRef>(null);
  const errorModal = useRef<ModalRef>(null);

  useEffect(() => {
    getTaxSettings()
      .then(val => {
        if (val) {
          setSettingsObj(val);
        }
        setInit(false);
      })
      .catch(e => {
        console.error(e);
        errorModal.current && errorModal.current.open();
      });
  }, []);

  useEffect(() => {
    // Auto-save on tax disabled
    if (!taxEnabled && !init) {
      updateTaxSettings(getSettingsObj());
    }
  }, [taxEnabled]);

  function getSettingsObj(): TaxSettingsType {
    return {
      enabled: taxEnabled,
      useBTax: useBTax,
      compounded: compoundTax,
      includeTax: includeTax,
      taxANumber: taxANum,
      taxAName: taxAName,
      taxA: parseFloat(taxA.toString().replace(',', '.')),
      taxBNumber: taxBNum,
      taxBName: taxBName,
      taxB: parseFloat(taxB.toString().replace(',', '.')),
    };
  }

  function setSettingsObj(settings: TaxSettingsType): void {
    setUseBTax(settings.useBTax);
    setCompoundTax(settings.compounded);
    setIncludeTax(settings.includeTax);
    setTaxANum(settings.taxANumber);
    setTaxAName(settings.taxAName);
    setTaxA(settings.taxA);
    setTaxBNum(settings.taxBNumber);
    setTaxBName(settings.taxBName);
    setTaxB(settings.taxB);
    // Last to get value (autosave on off)
    setTaxEnabled(settings.enabled);
  }

  async function save(): Promise<void> {
    const fields = [
      taxANumField.current && taxANumField.current.validate(),
      taxANameField.current && taxANameField.current.validate(),
      taxAField.current && taxAField.current.validate(),
      !useBTax || (taxBNumField.current && taxBNumField.current.validate()),
      !useBTax || (taxBNameField.current && taxBNameField.current.validate()),
      !useBTax || (taxBField.current && taxBField.current.validate()),
    ];
    if (fields.every(field => field)) {
      updateTaxSettings(getSettingsObj());
      successModal.current && successModal.current.open();
    }
  }

  if (init) {
    return <SkeletonView />;
  }

  return (
    <Box>
      <Flex direction="row" m={5}>
        <FormControl flex={1}>
          <HStack>
            <FormControl.Label
              mr={2}
              _text={{ fontSize: 'md', fontWeight: 'bold' }}>
              {t<string>('options.applyTax')}
            </FormControl.Label>
            <SwitchBtn value={taxEnabled} bindValue={setTaxEnabled} />
          </HStack>
        </FormControl>
        <FormControl flex={1}>
          <HStack>
            <FormControl.Label
              mr={2}
              _text={{ fontSize: 'md', fontWeight: 'bold' }}>
              {t<string>('options.useBTax')}
            </FormControl.Label>
            <SwitchBtn
              isDisabled={!taxEnabled}
              value={useBTax}
              bindValue={setUseBTax}
            />
          </HStack>
        </FormControl>
        <FormControl flex={1}>
          <HStack>
            <FormControl.Label
              mr={2}
              _text={{ fontSize: 'md', fontWeight: 'bold' }}>
              {t<string>('options.compoundTax')}
            </FormControl.Label>
            <SwitchBtn
              isDisabled={!taxEnabled || !useBTax}
              value={compoundTax}
              bindValue={setCompoundTax}
            />
          </HStack>
        </FormControl>
      </Flex>

      <Box display={taxEnabled ? 'flex' : 'none'} mt={2} alignItems="center">
        <HStack space={4} my={2}>
          <FormControl flex={1} maxW="220px" mt={10}>
            <HStack>
              <FormControl.Label
                mr={2}
                _text={{ fontSize: 'md', fontWeight: 'bold' }}>
                {t<string>('options.includeInPrice')}
              </FormControl.Label>
              <SwitchBtn value={includeTax} bindValue={setIncludeTax} />
            </HStack>
          </FormControl>
        </HStack>

        <HStack space={4} my={2}>
          <TextInput
            flex={1}
            ref={taxANumField}
            label={t<string>('options.taxANumber')}
            placeholder="0123456789"
            bindValue={setTaxANum}
            value={taxANum}
            required={false}
            clear="while-editing"
            schema={z.string({
              required_error: t<string>('validation.required'),
              invalid_type_error: t<string>('validation.stringType'),
            })}
            maxW="200px"
          />
          <TextInput
            flex={1}
            ref={taxANameField}
            label={t<string>('options.taxAName')}
            placeholder={t<string>('options.gst5PCT')}
            value={taxAName}
            bindValue={setTaxAName}
            clear="while-editing"
            schema={z
              .string({
                required_error: t<string>('validation.required'),
                invalid_type_error: t<string>('validation.stringType'),
              })
              .min(1, t<string>('validation.required'))}
            maxW="200px"
          />
          <TextInput
            flex={1}
            ref={taxAField}
            label={t<string>('options.rateDecimal')}
            placeholder="0.05"
            keyboardType="decimal-pad"
            value={taxA?.toString()}
            bindValue={setTaxA}
            clear="while-editing"
            schema={z.preprocess(
              val => parseFloat(val as string),
              z
                .number({
                  required_error: t<string>('validation.required'),
                  invalid_type_error: t<string>('validation.numberType'),
                })
                .positive({ message: t<string>('validation.positive') }),
            )}
            maxW="140px"
          />
        </HStack>

        <HStack
          display={taxEnabled && useBTax ? 'flex' : 'none'}
          space={4}
          my={2}>
          <TextInput
            flex={1}
            ref={taxBNumField}
            label={t<string>('options.taxBNumber')}
            placeholder="0123456789"
            bindValue={setTaxBNum}
            value={taxBNum}
            required={false}
            clear="while-editing"
            schema={z.string({
              required_error: t<string>('validation.required'),
              invalid_type_error: t<string>('validation.stringType'),
            })}
            maxW="200px"
          />
          <TextInput
            flex={1}
            ref={taxBNameField}
            label={t<string>('options.taxBName')}
            placeholder={t<string>('options.pst9PCT')}
            value={taxBName}
            bindValue={setTaxBName}
            clear="while-editing"
            schema={z
              .string({
                required_error: t<string>('validation.required'),
                invalid_type_error: t<string>('validation.stringType'),
              })
              .min(1, t<string>('validation.required'))}
            maxW="200px"
          />
          <TextInput
            flex={1}
            ref={taxBField}
            label={t<string>('options.rateDecimal')}
            placeholder="0.09975"
            keyboardType="decimal-pad"
            clear="while-editing"
            value={taxB?.toString()}
            bindValue={setTaxB}
            schema={z.preprocess(
              val => parseFloat(val as string),
              z
                .number({
                  required_error: t<string>('validation.required'),
                  invalid_type_error: t<string>('validation.numberType'),
                })
                .positive({ message: t<string>('validation.positive') }),
            )}
            maxW="140px"
          />
        </HStack>
        <Center mt={4}>
          <Button size="lg" onPress={save} colorScheme="violet">
            {t<string>('save')}
          </Button>
        </Center>
      </Box>
      <Modal
        ref={successModal}
        hideAction={true}
        title={t<string>('modal.changeSaved')}>
        <Text fontSize="md" textAlign="center">
          {t<string>('modal.changeSaved')}
        </Text>
      </Modal>
      <Modal
        ref={errorModal}
        hideAction={true}
        title={t('modal.defaultErrorTitle')}>
        <Text fontSize="md" textAlign="center">
          {t('modal.defaultErrorMessage')}
        </Text>
      </Modal>
    </Box>
  );
};

export default SalesTaxView;
