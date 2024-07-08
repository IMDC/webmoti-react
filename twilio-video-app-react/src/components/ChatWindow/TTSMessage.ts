export default class TTSMessage {
  text: string;
  dateCreated: Date;
  audio: HTMLAudioElement | null = null;

  constructor(text: string) {
    this.text = text;
    this.dateCreated = new Date();
  }

  async fetchSpeech(): Promise<void> {
    const options = {
      method: 'POST',
      headers: { Accept: 'audio/mpeg', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: this.text }),
    };

    const response = await fetch('http://localhost:80/api/tts', options);

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
  }

  play() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play();
    }
  }
}
