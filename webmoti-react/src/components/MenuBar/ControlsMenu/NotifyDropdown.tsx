import React from 'react';

import { MenuItem, Select } from '@material-ui/core';

import { Sounds } from '../../../components/WebmotiVideoProvider/index';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function NotifyDropdown() {
  const { soundKey, setSoundKey } = useWebmotiVideoContext();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const key = event.target.value as string;
    setSoundKey(key);
  };

  return (
    <Select value={soundKey} label="Sound" onChange={handleChange}>
      {/* add all sounds as menu items */}
      {Object.entries(Sounds).map(([key, value]) => (
        <MenuItem key={key} value={key}>
          {value.name}
        </MenuItem>
      ))}
    </Select>
  );
}
