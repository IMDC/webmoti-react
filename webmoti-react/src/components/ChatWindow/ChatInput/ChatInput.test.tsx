import { screen, render, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ChatInput from '../ChatInput/ChatInput';
import * as utils from '../../../utils';
import { setImmediate } from 'timers';
import { useAppState } from '../../../state';
import { TwilioError } from 'twilio-video';

jest.mock('@mui/material/useMediaQuery');
jest.mock('../../../state');

const mockUseAppState = useAppState as jest.Mock<any>;
mockUseAppState.mockImplementation(() => ({ setError: (_: TwilioError | Error | null) => {} }));

const mockHandleSendMessage = jest.fn<any, (string | FormData)[]>(() => Promise.resolve());

describe('the ChatInput component', () => {
  beforeEach(() => {
    // @ts-ignore
    utils.isMobile = false;
  });

  afterEach(jest.clearAllMocks);

  it('should enable the send message button when user types a valid message', async () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const sendButton = screen.getByTestId('send-message-button');
    expect(sendButton).toBeDisabled();

    const textarea = screen.getByTestId('chatinput-textarea');
    await userEvent.type(textarea, 'I am a message!!!');

    expect(sendButton).toBeEnabled();
  });

  it('should disable the send message button when message only contains whitespace', async () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const textarea = screen.getByTestId('chatinput-textarea');
    const sendButton = screen.getByTestId('send-message-button');

    await userEvent.type(textarea, '         ');
    expect(sendButton).toBeDisabled();
  });

  it('should call the correct function when send message button is clicked', async () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const textarea = screen.getByTestId('chatinput-textarea');
    const sendButton = screen.getByTestId('send-message-button');

    await userEvent.type(textarea, ' I am a message!!! \n ');
    await userEvent.click(sendButton);

    expect(mockHandleSendMessage).toHaveBeenCalledWith('I am a message!!!');
  });

  it('should only send a message and reset the textarea when Enter is pressed', async () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const textarea = screen.getByTestId('chatinput-textarea');

    await userEvent.type(textarea, ' I am a message!!!{Enter}');

    expect(mockHandleSendMessage).toHaveBeenCalledWith('I am a message!!!');

    expect(textarea).toHaveValue('');
  });

  it('should not send a message when Enter is pressed on mobile', async () => {
    // @ts-ignore
    utils.isMobile = true;
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const textarea = screen.getByTestId('chatinput-textarea');

    await userEvent.type(textarea, 'I am a message!!!');
    await userEvent.keyboard('{Enter}');

    // expect(textarea).toHaveValue('I am a message!!!');
    expect(mockHandleSendMessage).not.toHaveBeenCalled();
  });

  it('should not send a message when a user presses Enter+Shift', async () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const textarea = screen.getByTestId('chatinput-textarea');

    await userEvent.type(textarea, 'I am a message!!!');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

    expect(mockHandleSendMessage).not.toHaveBeenCalled();
  });

  it('should send a media message when a user selects a file', async () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const fileInput = screen.getByTestId('file-input');
    const mockFile = new File(['file content'], 'mockFile.txt', { type: 'text/plain' });

    // simulate onChange event
    fireEvent.change(fileInput, {
      target: { files: [mockFile] },
    });

    const formData = mockHandleSendMessage.mock.calls[0][0] as FormData;
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('userfile')).toEqual(mockFile);
  });

  it('should not send a media message when the "change" event is fired with no files', () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, {
      target: { files: [] },
    });

    expect(mockHandleSendMessage).not.toHaveBeenCalled();
  });

  it('should add the "isTextareaFocused" class to the parent of TextareaAutosize when the focus event is fired, and remove it when the blur event is fired', async () => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const textarea = screen.getByTestId('chatinput-textarea');

    // focus it by clicking it
    await userEvent.click(textarea);
    expect(textarea.parentElement?.className).toMatch('isTextareaFocused');

    textarea.blur();
    expect(textarea.parentElement?.className).not.toContain('isTextareaFocused');
  });

  it('should disable the file input button and display a loading spinner while sending a file', (done) => {
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    const attachButton = screen.getByTestId('attach-file-button');

    expect(screen.queryByTestId('file-upload-spinner')).toBeNull();
    expect(attachButton).toBeEnabled();

    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: ['mockFile'] },
    });

    expect(screen.getByTestId('file-upload-spinner')).toBeInTheDocument();
    expect(attachButton).toBeDisabled();

    setImmediate(() => {
      expect(screen.queryByTestId('file-upload-spinner')).toBeNull();
      expect(attachButton).toBeEnabled();
      done();
    });
  });

  it('should display an error when there is a problem sending a file', async () => {
    mockHandleSendMessage.mockImplementationOnce(() => Promise.reject({}));
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    expect(screen.queryByTestId('mui-snackbar')).toBeNull();
    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: ['mockFile'] },
    });

    await waitFor(() => {
      const snackbar = screen.getByTestId('mui-snackbar');
      expect(snackbar).toBeInTheDocument();
      expect(snackbar).toHaveTextContent('There was a problem uploading the file. Please try again.');
    });
  });

  it('should display a "file is too large" error when there is a 413 error code', async () => {
    mockHandleSendMessage.mockImplementationOnce(() => Promise.reject({ code: 413 }));
    render(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);

    expect(screen.queryByTestId('mui-snackbar')).toBeNull();

    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: ['mockFile'] },
    });

    await waitFor(() => {
      const snackbar = screen.getByTestId('mui-snackbar');
      expect(snackbar).toBeInTheDocument();
      expect(snackbar).toHaveTextContent('File size is too large. Maximum file size is 150MB.');
    });
  });

  it('should focus on the textarea element when the chat window is opened', () => {
    const { rerender } = render(
      <ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={false} />
    );

    const textarea = screen.getByTestId('chatinput-textarea');
    const focusSpy = jest.spyOn(textarea, 'focus');

    expect(focusSpy).not.toHaveBeenCalled();

    act(() => {
      rerender(<ChatInput conversation={{ sendMessage: mockHandleSendMessage } as any} isChatWindowOpen={true} />);
    });

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });
});
