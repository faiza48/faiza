import React from 'react';
import {
  Home,
  CheckSquare,
  Coins,
  Users,
  Calendar,
  Bell,
  FileText,
  Folder,
  Heart,
  Settings,
  X,
} from 'lucide-react';
import type { NavSection } from '../../types/dailyra';
import { DailyraLogo } from '../ui/DailyraLogo';
import { VISUAL_ASSETS } from '../../assets/visualAssets';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  sidebarQuote: string;
  darkMode: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'finance', label: 'Finance', icon: Coins },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Folder },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  sidebarQuote,
  darkMode,
  mobileOpen,
  onCloseMobile,
}) => {
  const sidebarContent = (
    <aside
      className={`w-[244px] h-full flex flex-col justify-between relative overflow-hidden select-none border-r transition-colors ${
        darkMode
          ? 'bg-[#141E18] border-[#26352C] text-[#E6ECE8]'
          : 'bg-[#F2EFE9] border-[#E6E1D6] text-[#2A312D]'
      }`}
    >
      {/* Top Brand Lockup */}
      <div>
        <div className="px-6 pt-7 pb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSelectSection('home');
              onCloseMobile();
            }}
            className="text-left focus:outline-none"
          >
            <DailyraLogo size="md" darkMode={darkMode} />
          </button>
          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#6E7671] hover:bg-black/5"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main Navigation" className="px-3.5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[14px] transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? darkMode
                      ? 'bg-[#23362B] text-[#E9F2EC] font-semibold'
                      : 'bg-[#E3E8DF] text-[#1D3B28] font-semibold shadow-[0_1px_2px_rgba(30,63,43,0.04)]'
                    : darkMode
                    ? 'text-[#9BA9A0] hover:bg-[#1C2A22] hover:text-[#E6ECE8] font-medium'
                    : 'text-[#49524C] hover:bg-[#EAE6DD]/70 hover:text-[#1F2421] font-medium'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive
                      ? darkMode
                        ? 'text-[#8BD4A4]'
                        : 'text-[#234732]'
                      : darkMode
                      ? 'text-[#829389]'
                      : 'text-[#5C645F]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Botanical Illustration + Motivational Quote matching Reference Image */}
      <div className="relative pt-16 pb-7 px-6 mt-auto">
        <img
          src={VISUAL_ASSETS.botanicalCornerArt}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className={`w-36 h-48 object-cover absolute -bottom-2 -left-3 pointer-events-none select-none ${
            darkMode ? 'opacity-20 mix-blend-screen' : 'opacity-70 mix-blend-multiply'
          }`}
        />
        <div className="relative z-10 pl-14">
          <p
            className={`font-script text-[18px] leading-[1.25] ${
              darkMode ? 'text-[#A9BCAE]' : 'text-[#4B564E]'
            }`}
          >
            {sidebarQuote || 'A better tomorrow starts with an organized today.'}
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
