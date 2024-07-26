import { useState } from 'react';

import { IconButton } from '@material-ui/core';
import { CalendarToday } from '@material-ui/icons';

import ViewScheduleModal from '../../ViewScheduleModal/ViewScheduleModal';

export default function ToggleScheduleButton() {
  const [openScheduleModal, setOpenScheduleModal] = useState(false);

  const handleOpenScheduleModal = () => {
    setOpenScheduleModal(true);
  };

  const handleCloseScheduleModal = () => {
    setOpenScheduleModal(false);
  };

  return (
    <>
      <ViewScheduleModal open={openScheduleModal} onClose={handleCloseScheduleModal} />

      <IconButton onClick={handleOpenScheduleModal}>
        <CalendarToday />
      </IconButton>
    </>
  );
}
