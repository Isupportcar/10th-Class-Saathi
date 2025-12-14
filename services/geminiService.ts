import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { MessageRole } from "../types";
import { decode, decodeAudioData } from "./audioUtils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat Model (Text)
export const sendMessageToTutor = async (
  history: { role: MessageRole; text: string }[],
  newMessage: string,
  subjectContext?: string
): Promise<string> => {
  try {
    const chatHistory = history.map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + (subjectContext ? `\nFocus specifically on the subject: ${subjectContext}` : ''),
        temperature: 0.7,
      },
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return result.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

// TTS Model (Audio)
export const generateAudioExplanation = async (text: string): Promise<AudioBuffer> => {
  try {
    // Strip markdown to ensure clean text for TTS
    // Removes bold/italic markers, etc. to prevent TTS from reading them or getting confused
    const cleanText = text
      .replace(/[*_#`]/g, '') 
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep link text, remove url
      .trim();

    // Use a safety limit for TTS length
    const ttsText = cleanText.substring(0, 2000); 

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: ttsText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    // Check for explicit audio data
    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;

    if (!base64Audio) {
      console.warn("TTS Response candidates:", response.candidates);
      // Check if text was returned instead
      if (part?.text) {
        console.error("Gemini returned text instead of audio:", part.text);
      }
      throw new Error("No audio data returned from Gemini API");
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Decode PCM
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    
    return audioBuffer;

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};