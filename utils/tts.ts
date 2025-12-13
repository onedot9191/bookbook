// utils/tts.ts

export const speakText = (text: string, lang: string = 'en-US', rate: number = 0.9, pitch: number = 1.0) => {
  // 기존 재생 중인 음성 중지
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  // 빈칸 제거 (대괄호 안의 내용만 추출하거나 제거)
  const cleanText = text.replace(/\[(.*?)\]/g, '$1').trim();
  
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang;
  utterance.rate = rate; // 속도 (0.1 ~ 10)
  utterance.pitch = pitch; // 음높이 (0 ~ 2)
  utterance.volume = 1.0; // 볼륨 (0 ~ 1)

  // 원어민 목소리 선택 (가능한 경우)
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(voice => 
    voice.lang.startsWith('en') && 
    (voice.name.includes('US') || voice.name.includes('American') || voice.name.includes('Native'))
  ) || voices.find(voice => voice.lang.startsWith('en'));
  
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};

// 음성 목록 로드 (일부 브라우저에서 필요)
export const loadVoices = () => {
  return new Promise<void>((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
    } else {
      window.speechSynthesis.onvoiceschanged = () => resolve();
    }
  });
};

