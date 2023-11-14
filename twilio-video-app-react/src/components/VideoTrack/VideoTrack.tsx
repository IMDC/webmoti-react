import { useCallback, useEffect, useRef } from 'react';

import { styled } from '@material-ui/core/styles';
import { Track } from 'twilio-video';

import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoTrackDimensions from '../../hooks/useVideoTrackDimensions/useVideoTrackDimensions';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

import { IVideoTrack } from '../../types';

const Video = styled('video')({
  width: '100%',
  height: '100%',
});

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority | null;
  isWebmotiVideo?: boolean;
}

export default function VideoTrack({ track, isLocal, priority, isWebmotiVideo = false }: VideoTrackProps) {
  const ref = useRef<HTMLVideoElement>(null!);
  const mediaStreamTrack = useMediaStreamTrack(track);
  const dimensions = useVideoTrackDimensions(track);
  const isPortrait = (dimensions?.height ?? 0) > (dimensions?.width ?? 0);
  const { zoom, rotation, pan, setPan, setZoomLevel } = useWebmotiVideoContext();
  // use ref for up to date values
  const isDraggingRef = useRef<boolean>(false);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  const setMaxPan = useCallback(
    (deltaX = 0, deltaY = 0) => {
      if (!ref.current) return { x: 0, y: 0 };

      // use video element dimensions to find max pan
      const scaledWidth = ref.current.offsetWidth;
      const scaledHeight = ref.current.offsetHeight;
      const excessWidth = scaledWidth * zoom - scaledWidth;
      const excessHeight = scaledHeight * zoom - scaledHeight;

      // dividing by 4 works perfectly for level 2, and 6 works for level 3
      const divisor = zoom === 2 ? 4 : zoom === 3 ? 6 : 1;
      const maxPanOffset = {
        x: excessWidth / divisor,
        y: excessHeight / divisor,
      };

      const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

      setPan(prev => ({
        x: clamp(prev.x + deltaX, -maxPanOffset.x, maxPanOffset.x),
        y: clamp(prev.y + deltaY, -maxPanOffset.y, maxPanOffset.y),
      }));
    },
    [setPan, zoom]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !lastPositionRef.current) return;

      const deltaX = e.clientX - lastPositionRef.current.x;
      const deltaY = e.clientY - lastPositionRef.current.y;
      setMaxPan(deltaX, deltaY);

      // keep last position updated
      lastPositionRef.current = { x: e.clientX, y: e.clientY };
    },
    [setMaxPan]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    lastPositionRef.current = null;

    // cleanup listeners when not dragging
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (zoom > 1) {
        isDraggingRef.current = true;
        lastPositionRef.current = { x: e.clientX, y: e.clientY };

        // only add these listeners when starting dragging
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    },
    [zoom, handleMouseMove, handleMouseUp]
  );

  useEffect(() => {
    if (isWebmotiVideo) {
      const el = ref.current;
      if (!el) return;
      el.addEventListener('mousedown', handleMouseDown);
      return () => {
        el.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [handleMouseDown, isWebmotiVideo]);

  useEffect(() => {
    if (isWebmotiVideo) {
      const handleZoomChange = () => setMaxPan();
      window.addEventListener('webmotizoomchanged', handleZoomChange);

      return () => {
        window.removeEventListener('webmotizoomchanged', handleZoomChange);
      };
    }
  }, [setMaxPan, isWebmotiVideo]);

  useEffect(() => {
    if (isWebmotiVideo) {
      const resizeObserver = new ResizeObserver(() => {
        setMaxPan();
      });
      resizeObserver.observe(ref.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [setMaxPan, isWebmotiVideo]);

  useEffect(() => {
    if (isWebmotiVideo) {
      const el = ref.current;
      if (!el) return;

      const THRESHOLD = 100;
      let totalScroll = 0;

      const handleWheel = (e: WheelEvent) => {
        totalScroll += e.deltaY;

        if (Math.abs(totalScroll) >= THRESHOLD) {
          const direction = totalScroll < 0 ? 1 : -1;
          setZoomLevel(zoom + direction);
          totalScroll = 0;
        }
      };

      el.addEventListener('wheel', handleWheel);

      return () => {
        el.removeEventListener('wheel', handleWheel);
      };
    }
  }, [setZoomLevel, zoom, isWebmotiVideo]);

  useEffect(() => {
    const el = ref.current;
    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);
    return () => {
      track.detach(el);

      // This addresses a Chrome issue where the number of WebMediaPlayers is limited.
      // See: https://github.com/twilio/twilio-video.js/issues/1528
      el.srcObject = null;

      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority]);

  // The local video track is mirrored if it is not facing the environment.
  const isFrontFacing = mediaStreamTrack?.getSettings().facingMode !== 'environment';

  const webmotiTransform = isWebmotiVideo
    ? `rotate(${rotation}deg) scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
    : '';

  const style = {
    transform: `${isLocal && isFrontFacing ? 'scaleX(-1)' : ''} ${webmotiTransform}`,
    objectFit: isPortrait || track.name.includes('screen') ? ('contain' as const) : ('cover' as const),
  };

  return <Video ref={ref} style={style} />;
}
