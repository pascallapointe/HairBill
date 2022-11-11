import React, {
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useImperativeHandle,
} from 'react';
import { Modal as NBModal, Button, IModalProps } from 'native-base';
import { StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import ActionButton from '@components/action-button';

interface Props extends IModalProps {
  title: string;
  action?: () => void; // Customizable action. Modal must be close explicitly
  callback?: () => void; // Always called on modal close
  actionBtnText?: string;
  actionBtnStyles?: StyleProp<ViewStyle>;
  closeBtnText?: string;
  hideClose?: boolean;
  hideAction?: boolean;
  outClick?: boolean;
  wait?: boolean;
  children: ReactNode;
}

export type ModalRef = {
  open: () => void;
  close: () => void;
};

const Modal = forwardRef<ModalRef, PropsWithChildren<Props>>(
  (
    {
      children,
      title,
      action,
      callback,
      actionBtnText,
      actionBtnStyles,
      closeBtnText,
      hideAction,
      hideClose,
      outClick = true,
      wait = false,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [_isOpen, setIsOpen] = React.useState(false);

    const open = () => setIsOpen(true);
    const close = () => {
      if (callback) callback();
      setIsOpen(false);
    };
    const triggerAction = () => {
      if (action) action();
      close();
    };
    useImperativeHandle(ref, () => ({ open, close }));

    const cancelRef = React.useRef(null);

    return (
      <NBModal
        isOpen={_isOpen}
        onClose={close}
        closeOnOverlayClick={outClick}
        {...props}>
        <NBModal.Content>
          <NBModal.CloseButton />
          <NBModal.Header>{title}</NBModal.Header>
          <NBModal.Body>{children}</NBModal.Body>
          <NBModal.Footer>
            <Button.Group space={2}>
              <Button
                display={hideClose ? 'none' : 'flex'}
                variant="outline"
                colorScheme="coolGray"
                onPress={close}
                ref={cancelRef}>
                {closeBtnText || t('modal.defaultCloseText')}
              </Button>
              <ActionButton
                minW="80px"
                display={hideAction ? 'none' : 'flex'}
                text={actionBtnText || t('modal.defaultActionText')}
                colorScheme="violet"
                style={actionBtnStyles}
                wait={wait}
                action={triggerAction}
              />
            </Button.Group>
          </NBModal.Footer>
        </NBModal.Content>
      </NBModal>
    );
  },
);

export default Modal;
