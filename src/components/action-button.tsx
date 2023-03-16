import React, { ReactElement, useEffect, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, IButtonProps } from 'native-base';
import { useTranslation } from 'react-i18next';

interface Props extends IButtonProps {
  text: string;
  icon?: ReactElement;
  customStyle?: StyleProp<ViewStyle>;
  action: () => Promise<boolean>;
  wait?: boolean;
}

const ActionButton: React.FC<React.PropsWithChildren<Props>> = ({
  text,
  icon,
  customStyle,
  action,
  wait = false,
  ...props
}) => {
  const { t } = useTranslation();
  const [_wait, setWait] = useState(wait);

  useEffect(() => setWait(wait), [wait]);

  function triggerAction(): void {
    if (!_wait) {
      setWait(true);
      action()
        .then(val => (val ? setWait(val) : setWait(false)))
        .catch(console.error);
    }
  }

  return (
    <Button
      isLoading={_wait}
      onPress={triggerAction}
      startIcon={icon}
      style={customStyle}
      shadow={5}
      isLoadingText={t<string>('waitButton')}
      {...props}>
      {text}
    </Button>
  );
};

export default ActionButton;
