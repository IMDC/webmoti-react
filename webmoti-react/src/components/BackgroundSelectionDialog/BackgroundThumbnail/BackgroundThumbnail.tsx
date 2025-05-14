import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import { BlurOn, FilterNone } from '@mui/icons-material';
import clsx from 'clsx';

import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const PREFIX = 'BackgroundThumbnail';

const classes = {
  thumbContainer: `${PREFIX}-thumbContainer`,
  thumbIconContainer: `${PREFIX}-thumbIconContainer`,
  thumbIcon: `${PREFIX}-thumbIcon`,
  thumbImage: `${PREFIX}-thumbImage`,
  thumbOverlay: `${PREFIX}-thumbOverlay`
};

const Root = styled('div')((
  {
    theme: Theme
  }
) => ({
  [`&.${classes.thumbContainer}`]: {
    margin: '5px',
    width: 'calc(50% - 10px)',
    display: 'flex',
    position: 'relative',
    '&::after': {
      content: '""',
      paddingBottom: '55.5%',
    },
  },

  [`& .${classes.thumbIconContainer}`]: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px',
    border: `solid ${theme.palette.grey[400]}`,
    '&.selected': {
      border: `solid ${theme.palette.primary.main}`,
      '& svg': {
        color: `${theme.palette.primary.main}`,
      },
    },
  },

  [`& .${classes.thumbIcon}`]: {
    height: 50,
    width: 50,
    color: `${theme.palette.grey[400]}`,
    '&.selected': {
      color: `${theme.palette.primary.main}`,
    },
  },

  [`& .${classes.thumbImage}`]: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    objectFit: 'cover',
    borderRadius: '10px',
    border: `solid ${theme.palette.grey[400]}`,
    '&:hover': {
      cursor: 'pointer',
      '& svg': {
        color: `${theme.palette.primary.main}`,
      },
      '& $thumbOverlay': {
        visibility: 'visible',
      },
    },
    '&.selected': {
      border: `solid ${theme.palette.primary.main}`,
      '& svg': {
        color: `${theme.palette.primary.main}`,
      },
    },
  },

  [`& .${classes.thumbOverlay}`]: {
    position: 'absolute',
    color: 'transparent',
    padding: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    height: '100%',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      background: 'rgba(95, 93, 128, 0.6)',
      color: 'white',
    },
  }
}));

export type Thumbnail = 'none' | 'blur' | 'image';

interface BackgroundThumbnailProps {
  thumbnail: Thumbnail;
  imagePath?: string;
  name?: string;
  index?: number;
  description?: string;
}

export default function BackgroundThumbnail({
  thumbnail,
  imagePath,
  name,
  index,
  description,
}: BackgroundThumbnailProps) {

  const { backgroundSettings, setBackgroundSettings } = useVideoContext();
  const isImage = thumbnail === 'image';
  const thumbnailSelected = isImage
    ? backgroundSettings.index === index && backgroundSettings.type === 'image'
    : backgroundSettings.type === thumbnail;
  const icons = {
    none: FilterNone,
    blur: BlurOn,
    image: null,
  };
  const ThumbnailIcon = icons[thumbnail];

  return (
    <Root
      className={classes.thumbContainer}
      onClick={() =>
        setBackgroundSettings({
          type: thumbnail,
          index: index,
        })
      }
      data-testid="background-thumbnail"
    >
      {ThumbnailIcon ? (
        <div className={clsx(classes.thumbIconContainer, { selected: thumbnailSelected })} data-testid="icon-container">
          <ThumbnailIcon className={classes.thumbIcon} data-testid={`${thumbnail}-icon`} />
        </div>
      ) : (
        <img
          className={clsx(classes.thumbImage, { selected: thumbnailSelected })}
          src={imagePath}
          alt={description}
          data-testid="image-container"
        />
      )}
      <div className={classes.thumbOverlay}>{name}</div>
    </Root>
  );
}
