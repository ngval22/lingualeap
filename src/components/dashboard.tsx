'use client';

import * as React from 'react';
import {
  BookCopy,
  Home,
  PlusCircle,
  Settings,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AddWordForm } from '@/components/add-word-form';
import { ReviewCards } from '@/components/review-cards';
import { VocabularyDeck } from '@/components/vocabulary-deck';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const [activeSection, setActiveSection] = React.useState('add'); // 'add', 'review', 'deck'

  const renderContent = () => {
    switch (activeSection) {
      case 'review':
        return <ReviewCards />;
      case 'deck':
        return <VocabularyDeck />;
      case 'add':
      default:
        return <AddWordForm />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="p-4">
             <div className="flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                 <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                 <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 11-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
               </svg>
               <h1 className="text-xl font-semibold text-primary">LinguaLeap</h1>
             </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection('add')}
                  isActive={activeSection === 'add'}
                  tooltip={{children: 'Add New Word', side: 'right'}}
                >
                  <PlusCircle />
                  <span>Add Word</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection('review')}
                  isActive={activeSection === 'review'}
                   tooltip={{children: 'Review Cards', side: 'right'}}
                >
                  <Home />
                  <span>Review</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection('deck')}
                  isActive={activeSection === 'deck'}
                   tooltip={{children: 'View Vocabulary Deck', side: 'right'}}
                >
                  <BookCopy />
                  <span>Deck</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
           {/* Removed Settings button from footer */}
        </Sidebar>
        <SidebarInset className="flex-1 p-6 bg-secondary">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {activeSection === 'add' && 'Add New Vocabulary Word'}
              {activeSection === 'review' && 'Review Your Cards'}
              {activeSection === 'deck' && 'Your Vocabulary Deck'}
            </h2>
            <SidebarTrigger className="md:hidden"/> {/* Show trigger only on mobile */}
          </div>
          {renderContent()}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
