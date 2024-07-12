import { shallow } from 'enzyme';

import EndCallButton from './EndCallButton';
import useChatContext from '../../../hooks/useChatContext/useChatContext';

jest.mock('../../../hooks/useChatContext/useChatContext');

const mockUseChatContext = useChatContext as jest.Mock<any>;
mockUseChatContext.mockImplementation(() => ({}));

const mockVideoContext = {
  room: {
    disconnect: jest.fn(),
  },
};

jest.mock('../../../hooks/useVideoContext/useVideoContext', () => () => mockVideoContext);

describe('End Call button', () => {
  it('should disconnect from the room when clicked', () => {
    const wrapper = shallow(<EndCallButton />);
    wrapper.simulate('click');
    expect(mockVideoContext.room.disconnect).toHaveBeenCalled();
  });
});
