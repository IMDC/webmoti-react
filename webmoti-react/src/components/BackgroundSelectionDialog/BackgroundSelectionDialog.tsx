import { Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';

import BackgroundSelectionHeader from './BackgroundSelectionHeader/BackgroundSelectionHeader';
import BackgroundThumbnail from './BackgroundThumbnail/BackgroundThumbnail';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { backgroundConfig } from '../VideoProvider/useBackgroundSettings/useBackgroundSettings';

const PREFIX = 'BackgroundSelectionDialog';

const classes = {
  drawer: `${PREFIX}-drawer`,
  thumbnailContainer: `${PREFIX}-thumbnailContainer`,
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  [`& .${classes.drawer}`]: {
    display: 'flex',
    width: theme.rightDrawerWidth,
    height: `calc(100% - ${theme.footerHeight}px)`,
  },

  [`& .${classes.thumbnailContainer}`]: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '5px',
    overflowY: 'auto',
  },
}));

function BackgroundSelectionDialog() {
  const { isBackgroundSelectionOpen, setIsBackgroundSelectionOpen } = useVideoContext();

  const images = backgroundConfig.images;

  return (
    <StyledDrawer
      variant="persistent"
      anchor="right"
      open={isBackgroundSelectionOpen}
      transitionDuration={0}
      classes={{
        paper: classes.drawer,
      }}
    >
      <BackgroundSelectionHeader onClose={() => setIsBackgroundSelectionOpen(false)} />
      <div className={classes.thumbnailContainer}>
        <BackgroundThumbnail thumbnail={'none'} name={'None'} />
        <BackgroundThumbnail thumbnail={'blur'} name={'Blur'} />
        {images.map((image, index) => (
          <BackgroundThumbnail
            thumbnail={'image'}
            name={image.name}
            index={index}
            imagePath={image.thumb}
            description={image.description}
            key={`${image.thumb}-${index}`}
          />
        ))}
      </div>
    </StyledDrawer>
  );
}

export default BackgroundSelectionDialog;
