import PersonIcon from '@mui/icons-material/Person';
import { styled } from '@mui/material/styles';
import { Avatar } from '@mui/material';

import { StateContextType } from '../../../../state';

const PREFIX = 'UserAvatar';

const classes = {
  red: `${PREFIX}-red`
};

const StyledAvatar = styled(Avatar)({
  [`& .${classes.red}`]: {
    color: 'white',
    backgroundColor: '#F22F46',
  },
});

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((text) => text[0])
    .join('')
    .toUpperCase();
}

export default function UserAvatar({ user }: { user: StateContextType['user'] }) {

  const { displayName, photoURL } = user!;

  return photoURL ? (
    <StyledAvatar src={photoURL} data-testid="user-avatar-photo" />
  ) : (
    <Avatar className={classes.red} data-testid="user-avatar-initials">
      {displayName ? getInitials(displayName) : <PersonIcon />}
    </Avatar>
  );
}
