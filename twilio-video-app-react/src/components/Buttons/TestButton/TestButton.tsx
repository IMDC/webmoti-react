import React from 'react';
import Button from '@material-ui/core/Button';

export default function TestButton() {
  const raiseHand = () => {
    const newTab = window.open('https://98bd9ca92de136b9.p22.rt3.io/raisehand', '_blank');

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
