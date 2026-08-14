/* eslint-disable jsx-a11y/no-static-element-interactions */

'use client';

import { useCallback, useRef, useEffect } from 'react';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
}

export default function ResizeHandle({ onResize }: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    startXRef.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    const delta = startXRef.current - e.clientX;
    startXRef.current = e.clientX;
    onResize(delta);
  }, [onResize]);

  const onMouseUp = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div
      ref={handleRef}
      className='group relative hidden w-[6px] shrink-0 cursor-col-resize bg-transparent hover:bg-[#e8f4f6] active:bg-[#135e6b]/20 lg:flex lg:flex-col lg:items-center lg:justify-center'
      onMouseDown={onMouseDown}
      onDoubleClick={() => onResize(0)}
    >
      {/* Visual grip */}
      <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#eef0f2] group-hover:bg-[#135e6b]/30 group-active:bg-[#135e6b]/50' />
      <div className='absolute flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
        <div className='h-4 w-1 rounded-full bg-[#135e6b]/40' />
        <div className='h-4 w-1 rounded-full bg-[#135e6b]/40' />
        <div className='h-4 w-1 rounded-full bg-[#135e6b]/40' />
      </div>
    </div>
  );
}
