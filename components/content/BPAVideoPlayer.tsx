'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react';

interface BPAVideoPlayerProps {
  videoSourceType?: 'youtube' | 'vimeo' | 'upload';
  videoProvider?: string | null;
  videoUrl?: string | null;
  videoFileUrl?: string | null;
  videoPosterUrl?: string | null;
  title?: string;
}

function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getVimeoId(url: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(vimeo\.com\/)([0-9]+).*/;
  const match = url.match(regExp);
  return match && match[2] ? match[2] : null;
}

function buildVimeoEmbedUrl(vimeoId: string): string {
  return `https://player.vimeo.com/video/${vimeoId}`;
}

export default function BPAVideoPlayer({
  videoSourceType = 'youtube',
  videoProvider,
  videoUrl,
  videoFileUrl,
  videoPosterUrl,
  title = 'BPA Content Video',
}: BPAVideoPlayerProps) {
  const isYoutube = videoSourceType === 'youtube' || videoProvider === 'youtube' || (!videoSourceType && !videoFileUrl && !!videoUrl && videoUrl.includes('youtube'));
  const isVimeo = videoSourceType === 'vimeo' || videoProvider === 'vimeo' || (!videoSourceType && !videoFileUrl && !!videoUrl && videoUrl.includes('vimeo'));

  const youtubeId = isYoutube ? getYoutubeId(videoUrl ?? null) : null;
  const vimeoId = isVimeo ? getVimeoId(videoUrl ?? null) : null;
  const vimeoEmbedUrl = vimeoId ? buildVimeoEmbedUrl(vimeoId) : null;

  // HTML5 player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Handle play state change
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => null);
    }
  };

  // HTML5 video events
  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);
  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const onDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const onWaiting = () => setIsBuffering(true);
  const onPlaying = () => setIsBuffering(false);
  const onError = () => setLoadError(true);

  // Seek on click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    const muted = !isMuted;
    setIsMuted(muted);
    videoRef.current.muted = muted;
  };

  // Volume slider update
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    videoRef.current.volume = vol;
    videoRef.current.muted = vol === 0;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => null);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => null);
      setIsFullscreen(false);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard accessibility helper
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in forms/comments
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          resetControlsTimeout();
          break;
        case 'KeyM':
          toggleMute();
          resetControlsTimeout();
          break;
        case 'KeyF':
          toggleFullscreen();
          resetControlsTimeout();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          resetControlsTimeout();
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
          resetControlsTimeout();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const nextVolUp = Math.min(1, volume + 0.1);
          setVolume(nextVolUp);
          videoRef.current.volume = nextVolUp;
          videoRef.current.muted = nextVolUp === 0;
          resetControlsTimeout();
          break;
        case 'ArrowDown':
          e.preventDefault();
          const nextVolDown = Math.max(0, volume - 0.1);
          setVolume(nextVolDown);
          videoRef.current.volume = nextVolDown;
          videoRef.current.muted = nextVolDown === 0;
          resetControlsTimeout();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume, duration]);

  // Format seconds to string
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Render YouTube
  if (isYoutube) {
    return (
      <div className="bg-black rounded-3xl overflow-hidden shadow-xl aspect-video w-full mb-8 relative border border-gray-900">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
            <Play size={48} className="text-gray-600 mb-4" />
            <p className="font-bold text-lg mb-2">Video player unavailable</p>
            <p className="text-gray-400 text-sm max-w-sm">
              This video cannot be played directly here.
              {videoUrl && (
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline block mt-2 font-bold">
                  Watch on YouTube
                </a>
              )}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render Vimeo
  if (isVimeo) {
    return (
      <div className="bg-black rounded-3xl overflow-hidden shadow-xl aspect-video w-full mb-8 relative border border-gray-900">
        {vimeoEmbedUrl ? (
          <iframe
            src={vimeoEmbedUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
            <Play size={48} className="text-gray-600 mb-4" />
            <p className="font-bold text-lg mb-2">Video player unavailable</p>
            <p className="text-gray-400 text-sm max-w-sm">
              This Vimeo video cannot be played directly here.
              {videoUrl && (
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline block mt-2 font-bold">
                  Watch on Vimeo
                </a>
              )}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render HTML5 Custom Player
  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="bg-black rounded-3xl overflow-hidden shadow-xl aspect-video w-full mb-8 relative border border-gray-900 group focus:outline-none select-none"
      tabIndex={0}
    >
      {loadError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
          <VolumeX size={48} className="text-red-500 mb-4" />
          <p className="font-bold text-lg mb-2">Failed to load video</p>
          <p className="text-gray-400 text-sm max-w-sm">
            Please check your connection or try again later. Format may not be supported by this browser.
          </p>
        </div>
      ) : (
        <>
          {/* Native HTML5 Video Element */}
          <video
            ref={videoRef}
            src={videoFileUrl || ''}
            poster={videoPosterUrl || undefined}
            preload="metadata"
            onClick={togglePlay}
            onPlay={onPlay}
            onPause={onPause}
            onTimeUpdate={onTimeUpdate}
            onDurationChange={onDurationChange}
            onWaiting={onWaiting}
            onPlaying={onPlaying}
            onError={onError}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <Loader2 size={48} className="text-emerald-500 animate-spin" />
            </div>
          )}

          {/* Large Center Play Overlay */}
          {!isPlaying && !isBuffering && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 cursor-pointer transition duration-300"
            >
              <button
                aria-label="Play video"
                className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-110 transition-all duration-300 shadow-2xl"
              >
                <Play size={32} className="fill-current ml-1.5" />
              </button>
            </div>
          )}

          {/* Custom Controls Bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 flex flex-col gap-3 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Custom Seek Progress Bar */}
            <div
              onClick={handleSeek}
              className="h-1.5 w-full bg-white/20 cursor-pointer rounded-full relative overflow-hidden group-hover:h-2 transition-all duration-200"
            >
              <div
                className="absolute top-0 left-0 h-full bg-emerald-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between text-white text-sm font-semibold">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="hover:text-emerald-500 transition duration-150"
                >
                  {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                </button>

                {/* Volume Section */}
                <div className="flex items-center gap-2 group/vol hover:w-28 transition-all duration-200">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="hover:text-emerald-500 transition duration-150"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/vol:w-16 h-1 bg-white/20 accent-emerald-500 rounded-lg cursor-pointer transition-all duration-200 opacity-0 group-hover/vol:opacity-100"
                  />
                </div>

                {/* Time Display */}
                <div className="text-xs font-mono tracking-wider">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1 text-white/40">/</span>
                  <span className="text-white/60">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="hover:text-emerald-500 transition duration-150"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
