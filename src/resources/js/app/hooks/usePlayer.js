import { useEffect, useRef, useState } from 'react';

const FRAME_INTERVAL_MS = 40; // ~25 fps

export function usePlayer(frames) {
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const raf = useRef(null);
    const last = useRef(null);

    useEffect(() => {
        setIdx(0);
        setPlaying(false);
    }, [frames]);

    useEffect(() => {
        if (!playing || !frames?.length) {
            cancelAnimationFrame(raf.current);
            return;
        }
        const tick = now => {
            if (!last.current) last.current = now;
            if (now - last.current >= FRAME_INTERVAL_MS) {
                last.current = now;
                setIdx(prev => {
                    if (prev >= frames.length - 1) {
                        setPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }
            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [playing, frames]);

    return { idx, setIdx, playing, setPlaying };
}
