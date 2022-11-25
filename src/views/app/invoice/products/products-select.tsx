import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  Icon,
  IFormControlProps,
  Skeleton,
  Text,
} from 'native-base';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import ValidationErrors from '@components/form/validation-errors';
import {
  buildSectionMap,
  getProducts,
  ProductSectionMapType,
  ProductType,
} from '@views/app/services/product/product.repository';
import Modal, { ModalRef } from '@components/modal';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import SelectedList from '@views/app/invoice/products/selected-list';
import OptionsPicker from '@views/app/invoice/products/options-picker';

export type ProductSelectRef = {
  validate: (val?: ProductType[]) => void;
};

interface Props extends IFormControlProps {
  label: string;
  bindValue: (selection: ProductType[]) => void;
  required?: boolean;
}

const ProductsSelect = forwardRef<ProductSelectRef, Props>(
  ({ label, bindValue, required = true, ...props }, ref) => {
    const { t } = useTranslation();
    const [init, setInit] = useState(true);
    const [view, setView] = useState<'selection' | 'options'>('selection');
    const [sectionList, setSectionList] = useState<ProductSectionMapType>({});
    const [selected, setSelected] = useState<ProductType[]>([]);
    const [error, setError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // Modals
    const errorModal = useRef<ModalRef>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
      getProducts()
        .then((p: ProductType[]) => {
          setSectionList(buildSectionMap(p, t<string>('services.noCategory')));
          if (init) {
            setInit(false);
          }
        })
        .catch(e => {
          setErrorMessage(t<string>(e.message ?? 'exception.database'));
          errorModal.current && errorModal.current.open();
        });
    }, []);

    function select(p: ProductType) {
      const mergedList = [...selected, p];
      mergedList.sort((a, b) => (a.name > b.name ? 1 : -1));

      setSelected(mergedList);
      bindValue(mergedList);
      validate(mergedList);
      setView('selection');
    }

    function remove(productId: string) {
      const list: ProductType[] = [...selected];
      const index = list.findIndex(p => p.id === productId);
      list.splice(index, 1);
      setSelected(list);
      bindValue(list);
      validate(list);
    }

    function validate(productList?: ProductType[]): boolean {
      const baseSchema = z
        .object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
          category: z.object({ id: z.string(), name: z.string() }),
        })
        .array();
      const schema = required
        ? baseSchema.nonempty(t<string>('validation.required'))
        : baseSchema.nullable();

      const value = productList === undefined ? selected : productList;

      let result = schema.safeParse(value);

      setError(!result.success);
      setErrorMessages([]);

      if (!result.success) {
        setErrorMessages(result.error.issues.map(issue => issue.message));
      }

      return result.success;
    }

    useImperativeHandle(ref, () => ({ validate }));

    if (init) {
      return (
        <FormControl
          isInvalid={error}
          isRequired={required}
          minW="100%"
          {...props}>
          <FormControl.Label _text={{ fontSize: 'md', fontWeight: 'bold' }}>
            {label}
          </FormControl.Label>
          <Box justifyContent="center" alignItems="center">
            <Skeleton
              w="250px"
              h="30px"
              rounded={4}
              m="46px"
              startColor="violet.200"
            />
            <Skeleton h={10} w="120px" rounded={4} startColor="violet.200" />
          </Box>
        </FormControl>
      );
    }

    return (
      <FormControl
        isInvalid={error}
        isRequired={required}
        minW="100%"
        {...props}>
        <FormControl.Label _text={{ fontSize: 'md', fontWeight: 'bold' }}>
          {label}
        </FormControl.Label>
        <ValidationErrors
          m={0}
          mb={1}
          error={error}
          errorMessages={errorMessages}
        />
        <SelectedList selected={selected} remove={remove} />
        {view === 'options' ? (
          <OptionsPicker options={sectionList} select={select} />
        ) : (
          ''
        )}
        <Center>
          {view === 'selection' ? (
            <Button
              mt={2}
              leftIcon={<Icon as={FontAwesome5Icon} name="plus" />}
              onPress={() => setView('options')}
              colorScheme="lime">
              {t('add')}
            </Button>
          ) : (
            <Button
              mt={2}
              onPress={() => setView('selection')}
              colorScheme="violet"
              startIcon={
                <Icon
                  as={FontAwesome5Icon}
                  name="chevron-left"
                  colorScheme="violet"
                />
              }
              variant="outline">
              {t('back')}
            </Button>
          )}
        </Center>

        <Modal
          ref={errorModal}
          hideAction={true}
          title={t('exception.operationFailed')}
          modalType="error">
          <Text fontSize="md" textAlign="center">
            {errorMessage}
          </Text>
        </Modal>
      </FormControl>
    );
  },
);

export default ProductsSelect;
