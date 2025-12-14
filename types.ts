export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  isAudioPlaying?: boolean;
  isLoadingAudio?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  color: string;
  description: string;
}

export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT'
}