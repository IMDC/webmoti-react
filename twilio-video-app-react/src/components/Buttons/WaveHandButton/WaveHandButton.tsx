import Button from '@material-ui/core/Button';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function RaiseHandButton() {
  const { sendHandRequest } = useWebmotiVideoContext();

  const handleClick = async () => {
    await sendHandRequest('WAVE2');
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Wave
      </Button>
    </div>
  );
}
