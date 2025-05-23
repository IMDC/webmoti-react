// sent from client to server
export interface CaptionSendMessage {
  type: 'caption';
  transcript: string;
  id: number;
}

export interface CaptionActionMessage {
  type: 'caption_action';
  action: 'start' | 'stop';
}

// received from server
export interface Caption {
  type: 'caption';
  identity: string;
  captionId: string;
  timestamp: number;
  transcript: string;
}

interface StartRecordingMessage {
  type: 'start_recording';
}

interface StopRecordingMessage {
  type: 'stop_recording';
}

export type CaptionWebSocketMessage =
  | Caption
  | StartRecordingMessage
  | StopRecordingMessage;
