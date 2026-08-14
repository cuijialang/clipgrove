/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

'use client';

import { useState, useCallback, useRef } from 'react';
import { WebNavigation } from '@/db/supabase/types';
import LeftSidebar from './LeftSidebar';
import MiddleColumn from './MiddleColumn';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import ResizeHandle from './ResizeHandle';

interface ThreeColumnShellProps {
  categories: Array<{ id: string; name: string; title: string }>;
  tools: WebNavigation[];
}

const MIN_RIGHT_WIDTH = 280;
const MAX_RIGHT_WIDTH = 600;
const DEFAULT_RIGHT_WIDTH = 380;

export default function ThreeColumnShell({ categories, tools }: ThreeColumnShellProps) {
  const [selectedTool, setSelectedTool] = useState<WebNavigation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_WIDTH);
  const rightWidthRef = useRef(DEFAULT_RIGHT_WIDTH);

  const handleSelectTool = useCallback((tool: WebNavigation) => {
    setSelectedTool(tool);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedTool(null);
  }, []);

  const handleResize = useCallback((delta: number) => {
    const newWidth = Math.min(Math.max(rightWidthRef.current + delta, MIN_RIGHT_WIDTH), MAX_RIGHT_WIDTH);
    rightWidthRef.current = newWidth;
    setRightWidth(newWidth);
  }, []);

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-[#f4f5f6]'>
      {/* Fixed top bar */}
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Three-column body: fills remaining height */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left sidebar */}
        <div className='hidden w-[200px] shrink-0 overflow-y-auto border-r border-[#eef0f2] bg-white lg:block'>
          <LeftSidebar categories={categories} />
        </div>

        {/* Middle column — scrollable, takes remaining space */}
        <div className='flex-1 overflow-y-auto'>
          <MiddleColumn
            tools={tools}
            categories={categories}
            selectedToolId={selectedTool?.name || null}
            onSelectTool={handleSelectTool}
          />
        </div>

        {/* Resizable divider */}
        <ResizeHandle
          onResize={handleResize}
        />

        {/* Right panel — resizable width */}
        <div
          className='hidden shrink-0 overflow-y-auto border-l border-[#eef0f2] bg-white lg:block'
          style={{ width: rightWidth }}
        >
          <RightPanel
            selectedTool={selectedTool}
            allTools={tools}
          />
        </div>
      </div>

      {/* Mobile: sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed left-0 top-0 z-40 h-full w-[min(86vw,300px)] overflow-y-auto bg-white shadow-lg transition-transform duration-200 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <LeftSidebar categories={categories} />
      </div>

      {/* Mobile: right panel overlay */}
      {selectedTool && (
        <>
          <div
            className='fixed inset-0 z-30 bg-black/40 lg:hidden'
            onClick={handleClosePanel}
          />
          <div className='fixed right-0 top-0 z-40 h-full w-[min(90vw,400px)] overflow-y-auto bg-white shadow-lg transition-transform duration-200 lg:hidden'>
            <button
              type='button'
              className='absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-[#eef0f2] text-[#586574] hover:bg-[#e2e4e7]'
              onClick={handleClosePanel}
            >
              ✕
            </button>
            <RightPanel
              selectedTool={selectedTool}
              allTools={tools}
            />
          </div>
        </>
      )}
    </div>
  );
}
