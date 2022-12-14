import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Center, Stack, Text } from 'native-base';
import { z } from 'zod';
import TextInput, { InputRef } from '@components/form/text-input';
import { useTranslation } from 'react-i18next';
import Modal, { ModalRef } from '@components/modal';
import TextAreaInput from '@components/form/text-area-input';
import SkeletonView from '@app/main/options/general/skeleton-view';
import {
  GeneralSettingsType,
  getGeneralSettings,
  updateGeneralSettings,
} from '@app/main/options/general/general.repository';

const GeneralView = () => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const shopNameField = useRef<InputRef>(null);
  const [shopName, setShopName] = useState('');
  const phoneField = useRef<InputRef>(null);
  const [phone, setPhone] = useState('');
  const employeeField = useRef<InputRef>(null);
  const [employee, setEmployee] = useState('');
  const addressField = useRef<InputRef>(null);
  const [address, setAddress] = useState('');

  // Modal
  const successModal = useRef<ModalRef>(null);
  const errorModal = useRef<ModalRef>(null);

  useEffect(() => {
    getGeneralSettings()
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

  function getSettingsObj(): GeneralSettingsType {
    return {
      shopName: shopName,
      phone: phone,
      employeeName: employee,
      address: address,
    };
  }

  function setSettingsObj(settings: GeneralSettingsType): void {
    setShopName(settings.shopName);
    setPhone(settings.phone);
    setEmployee(settings.employeeName);
    setAddress(settings.address);
  }

  async function save(): Promise<void> {
    const fields = [
      shopNameField.current && shopNameField.current.validate(),
      phoneField.current && phoneField.current.validate(),
      employeeField.current && employeeField.current.validate(),
      addressField.current && addressField.current.validate(),
    ];
    if (fields.every(field => field)) {
      updateGeneralSettings(getSettingsObj());
      successModal.current && successModal.current.open();
    }
  }

  if (init) {
    return <SkeletonView />;
  }

  return (
    <Box>
      <Stack
        direction={{ md: 'column', lg: 'row' }}
        alignItems={{ md: 'center', lg: 'baseline' }}
        justifyContent="space-evenly">
        <TextInput
          ref={shopNameField}
          label={t<string>('options.shopName')}
          placeholder={t<string>('options.shopNamePlaceholder')}
          bindValue={setShopName}
          value={shopName}
          required={false}
          clear="while-editing"
          schema={z.string({
            required_error: t<string>('validation.required'),
            invalid_type_error: t<string>('validation.stringType'),
          })}
          my={2}
          maxW="300px"
        />

        <TextInput
          ref={phoneField}
          label={t<string>('options.phoneNumber')}
          placeholder="(999) 999-9999"
          bindValue={setPhone}
          value={phone}
          keyboardType="number-pad"
          required={false}
          clear="while-editing"
          schema={z.string({
            required_error: t<string>('validation.required'),
            invalid_type_error: t<string>('validation.stringType'),
          })}
          my={2}
          maxW="300px"
        />
      </Stack>

      <Stack
        direction={{ md: 'column', lg: 'row' }}
        alignItems={{ md: 'center', lg: 'baseline' }}
        justifyContent="space-evenly">
        <TextInput
          ref={employeeField}
          label={t<string>('options.employeeName')}
          placeholder={t<string>('options.employeeNamePlaceholder')}
          bindValue={setEmployee}
          value={employee}
          required={false}
          clear="while-editing"
          schema={z.string({
            required_error: t<string>('validation.required'),
            invalid_type_error: t<string>('validation.stringType'),
          })}
          my={2}
          maxW="300px"
        />

        <TextAreaInput
          ref={addressField}
          label={t<string>('options.address')}
          placeholder={t<string>('options.addressPlaceholder')}
          bindValue={setAddress}
          value={address}
          required={false}
          clear="while-editing"
          schema={z.string({
            required_error: t<string>('validation.required'),
            invalid_type_error: t<string>('validation.stringType'),
          })}
          my={2}
          maxW="300px"
        />
      </Stack>

      <Center mt={4}>
        <Button size="lg" onPress={save} colorScheme="violet">
          {t<string>('save')}
        </Button>
      </Center>
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

export default GeneralView;
