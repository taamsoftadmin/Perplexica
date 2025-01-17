'use client';

import { cn } from '@/lib/utils';
import { BookOpenText, Home, Search, SquarePen, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, type ReactNode } from 'react';
import Layout from './Layout';
import SettingsDialog from './SettingsDialog';
import * as Tooltip from '@radix-ui/react-tooltip';

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tooltip.Provider delayDuration={0}>
      {children}
    </Tooltip.Provider>
  );
};

const VerticalIconContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-y-3 w-full">{children}</div>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navLinks = [
    {
      icon: Home,
      href: '/',
      active: segments && (segments.length === 0 || segments.includes('c')),
      label: 'Home',
    },
    {
      icon: Search,
      href: '/discover',
      active: segments?.includes('discover') ?? false,
      label: 'Discover',
    },
    {
      icon: BookOpenText,
      href: '/library',
      active: segments?.includes('library') ?? false,
      label: 'Library',
    },
  ];

  return (
    <div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-14 lg:flex-col">
        <div className="flex grow flex-col items-center justify-between gap-y-4 overflow-y-auto bg-light-secondary dark:bg-dark-secondary px-1.5 py-6">
          <TooltipProvider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <a href="/" className="relative z-40">
                  <SquarePen className="cursor-pointer w-5 h-5" />
                </a>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 relative bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-md text-sm"
                  side="right"
                  sideOffset={5}
                  align="center"
                >
                  Taam AI Search
                  <Tooltip.Arrow className="fill-black/75" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </TooltipProvider>
          
          <VerticalIconContainer>
            {navLinks.map((link, i) => (
              <TooltipProvider key={i}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        'relative z-40 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 duration-150 transition w-full p-1.5 rounded-lg',
                        link.active
                          ? 'text-black dark:text-white'
                          : 'text-black/70 dark:text-white/70',
                      )}
                    >
                      <link.icon size={18} />
                      {link.active && (
                        <div className="absolute right-0 -mr-1.5 h-full w-0.5 rounded-l-lg bg-black dark:bg-white" />
                      )}
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="z-50 relative bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-md text-sm"
                      side="right"
                      sideOffset={5}
                      align="center"
                    >
                      {link.label}
                      <Tooltip.Arrow className="fill-black/75" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </TooltipProvider>
            ))}
          </VerticalIconContainer>

          <TooltipProvider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="relative z-40">
                  <Settings
                    size={18}
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="cursor-pointer"
                  />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 relative bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-md text-sm"
                  side="right"
                  sideOffset={5}
                  align="center"
                >
                  Settings
                  <Tooltip.Arrow className="fill-black/75" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </TooltipProvider>

          <SettingsDialog
            isOpen={isSettingsOpen}
            setIsOpen={setIsSettingsOpen}
          />
        </div>
      </div>

      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-light-primary dark:bg-dark-primary px-4 py-4 shadow-sm lg:hidden">
        {navLinks.map((link, i) => (
          <Link
            href={link.href}
            key={i}
            className={cn(
              'relative flex flex-col items-center space-y-1 text-center w-full',
              link.active
                ? 'text-black dark:text-white'
                : 'text-black dark:text-white/70',
            )}>
            {link.active && (
              <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-black dark:bg-white" />
            )}
            <link.icon />
            <p className="text-xs">{link.label}</p>
          </Link>
        ))}
      </div>

      <Layout>{children}</Layout>
    </div>
  );
};

export default Sidebar;
