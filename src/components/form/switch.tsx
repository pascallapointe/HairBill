import React, { useEffect, useState } from 'react';
import { ISwitchProps, Switch } from 'native-base';

interface Props extends ISwitchProps {
  value: boolean;
  bindValue: (value: boolean) => void;
}

const SwitchBtn: React.FC<Props> = ({ value = false, bindValue, ...props }) => {
  const [_value, setValue] = useState(value);

  useEffect(() => bindValue(_value), [_value]);

  return (
    <Switch
      {...props}
      size="md"
      colorScheme="violet"
      value={_value}
      onToggle={() => setValue(!_value)}
    />
  );
};

export default SwitchBtn;
