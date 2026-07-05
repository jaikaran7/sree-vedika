import { type ReactNode, useRef, useState } from 'react';

const THRESHOLD = 70;

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<unknown>; children: ReactNode }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY <= 0) {
      setPull(Math.min(delta * 0.5, 100));
    }
  };

  const onTouchEnd = async () => {
    if (pull > THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPull(0);
    startY.current = null;
  };

  return (
    <div ref={containerRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden text-xs font-semibold text-gold-600 transition-[height] dark:text-gold-300"
        style={{ height: pull }}
      >
        {refreshing ? 'Refreshing…' : pull > THRESHOLD ? 'Release to refresh' : pull > 0 ? 'Pull to refresh' : ''}
      </div>
      {children}
    </div>
  );
}
