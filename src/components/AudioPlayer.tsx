import React, { useEffect, useRef, useState } from 'react';
import { AudioSettings, DEFAULT_BGM_TRACKS } from '../types';

interface AudioPlayerProps {
  settings: AudioSettings;
  onOpenSettings?: () => void;
  onUpdateSettings?: (newSettings: Partial<AudioSettings>) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  settings,
}) => {
  const audioElemRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [, setIsPlaying] = useState<boolean>(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false);

  const {
    isBgmOn = true,
    bgmVolume = 0.6,
    currentTrackIndex = 0,
    customBgmUrl,
    customBgmType = 'default',
  } = settings;

  const validTrackIndex = Math.max(0, Math.min(DEFAULT_BGM_TRACKS.length - 1, currentTrackIndex));
  const activeDefaultTrack = DEFAULT_BGM_TRACKS[validTrackIndex];

  // PostMessage helper for YouTube IFrame player
  const postToYouTube = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args,
          }),
          '*'
        );
      } catch (e) {}
    }
  };

  // 1. Sync Volume to both HTML5 Audio and YouTube iframe
  useEffect(() => {
    const safeVol = Math.max(0, Math.min(1, typeof bgmVolume === 'number' ? bgmVolume : 0.6));
    
    // HTML5 Audio volume
    if (audioElemRef.current) {
      try {
        audioElemRef.current.volume = safeVol;
      } catch (e) {}
    }

    // YouTube iframe volume (0 - 100)
    postToYouTube('setVolume', [Math.round(safeVol * 100)]);
  }, [bgmVolume]);

  // 2. Control Playback when state, track, or source changes
  useEffect(() => {
    const safeVol = Math.max(0, Math.min(1, typeof bgmVolume === 'number' ? bgmVolume : 0.6));

    if (!isBgmOn) {
      // Pause all
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
      postToYouTube('pauseVideo');
      setIsPlaying(false);
      return;
    }

    if (customBgmType === 'file' && customBgmUrl) {
      // Pause YouTube
      postToYouTube('pauseVideo');

      // Play HTML5 File
      if (audioElemRef.current) {
        audioElemRef.current.volume = safeVol;
        if (audioElemRef.current.src !== customBgmUrl) {
          audioElemRef.current.src = customBgmUrl;
        }
        audioElemRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Audio play requires user touch/click:', err);
            setIsPlaying(false);
          });
      }
    } else {
      // Default YouTube Direct Track
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
      postToYouTube('playVideo');
      postToYouTube('setVolume', [Math.round(safeVol * 100)]);
      setIsPlaying(true);
    }
  }, [isBgmOn, customBgmType, customBgmUrl, validTrackIndex, isIframeLoaded]);

  // 3. User interaction unlock for browser autoplay policy
  useEffect(() => {
    const unlockAudio = () => {
      if (isBgmOn) {
        if (customBgmType === 'file' && audioElemRef.current) {
          audioElemRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
          postToYouTube('playVideo');
          setIsPlaying(true);
        }
      }
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [customBgmType, isBgmOn]);

  return (
    <>
      {/* HTML5 Audio Player for custom uploaded files */}
      <audio
        ref={audioElemRef}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Hidden YouTube Iframe Player for default direct tracks */}
      {customBgmType === 'default' && (
        <div className="fixed -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            key={activeDefaultTrack?.youtubeId}
            width="200"
            height="200"
            src={`https://www.youtube-nocookie.com/embed/${activeDefaultTrack?.youtubeId}?enablejsapi=1&autoplay=1&loop=1&playlist=${activeDefaultTrack?.youtubeId}&controls=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
            title="BGM YouTube Player"
            allow="autoplay; encrypted-media"
            onLoad={() => {
              setIsIframeLoaded(true);
              if (isBgmOn) {
                postToYouTube('playVideo');
                postToYouTube('setVolume', [Math.round((bgmVolume ?? 0.6) * 100)]);
              }
            }}
          />
        </div>
      )}
    </>
  );
};

