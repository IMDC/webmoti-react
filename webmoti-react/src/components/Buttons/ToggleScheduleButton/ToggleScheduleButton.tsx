import { useState } from 'react';

import { IconButton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
        <CalendarTodayIcon />
      </IconButton>
    </>
  );
}
