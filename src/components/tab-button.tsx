import React from 'react';
import { Button } from 'native-base';

const TabButton: React.FC<{
  text: string;
  action: () => void;
  selected: boolean;
  selectedColor?: string;
  defaultColor?: string;
}> = ({
  text,
  action,
  selected,
  selectedColor = 'pink.500',
  defaultColor = 'white',
}) => {
  const fontWeight = selected ? 'bold' : 'normal';
  return (
    <Button
      minW="100px"
      onPress={action}
      bgColor={selected ? selectedColor : defaultColor}
      variant={selected ? 'solid' : 'outline'}
      colorScheme="muted"
      rounded={20}
      _pressed={{
        bgColor: selectedColor,
        _text: { color: 'white' },
        borderColor: selectedColor,
        shadow: 0,
      }}
      _text={{ fontWeight: fontWeight }}
      shadow={selected ? 0 : 5}>
      {text}
    </Button>
  );
};

export default TabButton;
