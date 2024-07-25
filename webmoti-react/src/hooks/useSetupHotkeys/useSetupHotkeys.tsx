import { useHotkeys } from 'react-hotkeys-hook';

function useSetupHotkeys(keyCombo: string, action: () => void) {
  useHotkeys(keyCombo, (event) => {
    // override default hotkey
    event.preventDefault();
    // stop hotkey from repeating
    if (event.repeat) return;
    action();
  });
}

export default useSetupHotkeys;
