import Button from '@material-ui/core/Button';

export default function TestButton() {
  const openYouTube = () => {
    window.open('https://www.youtube.com', '_blank');
  };

  return (
    <Button onClick={openYouTube} variant="contained" color="primary">
      Open YouTube
    </Button>
  );
}
