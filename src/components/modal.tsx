import React, {
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useImperativeHandle,
} from 'react';
import { Modal as NBModal, Button, IModalProps } from 'native-base';
import { StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props extends IModalProps {
  title: string;
  action?: () => any; // Customizable action. Modal must be close explicitly
  actionAutoClose?: boolean;
  callback?: () => void; // Always called on modal close
  actionBtnText?: string;
  actionBtnStyles?: StyleProp<ViewStyle>;
  closeBtnText?: string;
  hideClose?: boolean;
  hideAction?: boolean;
  outClick?: boolean;
  modalType?: 'success' | 'warning' | 'error';
  keyboardShouldPersistTaps?:
    | boolean
    | 'always'
    | 'never'
    | 'handled'
    | undefined;
  children: ReactNode;
}

export type ModalRef = {
  open: () => void;
  close: () => void;
};

const color = {
  success: 'purple.400',
  warning: 'amber.400',
  error: 'rose.400',
};

const Modal = forwardRef<ModalRef, PropsWithChildren<Props>>(
  (
    {
      children,
      title,
      action,
      actionAutoClose = true,
      callback,
      actionBtnText,
      actionBtnStyles,
      closeBtnText,
      hideAction,
      hideClose,
      outClick = true,
      modalType = 'success',
      keyboardShouldPersistTaps = 'always',
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [_isOpen, setIsOpen] = React.useState(false);

    const open = () => setIsOpen(true);
    const close = () => {
      if (callback) {
        callback();
      }
      setIsOpen(false);
    };
    const triggerAction = async () => {
      if (action) {
        await action();
      }
      if (actionAutoClose) {
        close();
      }
    };
    useImperativeHandle(ref, () => ({ open, close }));

    return (
      <NBModal
        isOpen={_isOpen}
        onClose={close}
        closeOnOverlayClick={outClick}
        {...props}>
        <NBModal.Content>
          <NBModal.CloseButton />
          <NBModal.Header bgColor={color[modalType]}>{title}</NBModal.Header>
          <NBModal.Body
            _scrollview={{
              keyboardShouldPersistTaps: keyboardShouldPersistTaps,
            }}>
            {children}
          </NBModal.Body>
          <NBModal.Footer>
            <Button.Group space={2}>
              <Button
                display={hideClose ? 'none' : 'flex'}
                variant="outline"
                colorScheme="coolGray"
                onPress={close}>
                {closeBtnText || t('modal.defaultCloseText')}
              </Button>
              <Button
                minW="80px"
                display={hideAction ? 'none' : 'flex'}
                colorScheme="violet"
                style={actionBtnStyles}
                onPress={triggerAction}>
                {actionBtnText || t('modal.defaultActionText')}
              </Button>
            </Button.Group>
          </NBModal.Footer>
        </NBModal.Content>
      </NBModal>
    );
  },
);

export default Modal;
