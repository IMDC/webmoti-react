import React from 'react';
import Button from '@material-ui/core/Button';

export default function TestButton() {
  const raiseHand = () => {
    const newTab = window.open('https://4keaw6l3.connect.remote.it/raisehand', '_blank');

    if (newTab) {
      window.setTimeout(() => {
        newTab.close();
      }, 2500);
    }
  };

  return (
    <Button onClick={raiseHand} variant="contained" color="primary">
      Raise Hand
    </Button>
  );
}
