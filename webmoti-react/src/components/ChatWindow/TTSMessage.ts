import { HTTPS_SERVER_URL } from '../../constants';

export default class TTSMessage {
  text: string;
  voice: string;
  dateCreated: Date;
  audio: HTMLAudioElement | null = null;
  audioBlob: Blob | null = null;

  constructor(text: string, voice: string) {
    this.text = text;
    this.voice = voice;
    this.dateCreated = new Date();
  }

  async fetchSpeech(): Promise<void> {
    const options = {
      method: 'POST',
      headers: { Accept: 'audio/mpeg', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: this.text, voice: this.voice }),
    };

    const response = await fetch(`${HTTPS_SERVER_URL}/tts`, options);

    if (response.ok) {
      const blob = await response.blob();
      this.setAudio(blob);
    } else {
      throw new Error('Failed to fetch speech');
    }
  }

  private setAudio(blob: Blob) {
    const audioUrl = URL.createObjectURL(blob);
    this.audio = new Audio(audioUrl);
    this.audioBlob = blob;
  }

  play() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play();
    }
  }
}
