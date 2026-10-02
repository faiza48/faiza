import React, { useState } from 'react';
import {
  Plus,
  GraduationCap,
  Shapes,
  Heart,
  CheckSquare,
  CalendarHeart,
  FileText,
  Folder,
  Phone,
  Stethoscope,
  Edit3,
  Trash2,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';
import type {
  DailyraState,
  FamilyMember,
  NavSection,
} from '../../types/dailyra';
import { AvatarImage, Modal, ConfirmDialog, EmptyState } from '../ui/CommonUI';

interface FamilyPageProps {
  state: DailyraState;
  darkMode: boolean;
  initialSubFilter?: string;
  onNavigate: (section: NavSection) => void;
  onCreateFamilyMember: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateFamilyMember: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteFamilyMember: (id: string) => Promise<void>;
  onAddFamilyActivity: (memberId: string, activity: Record<string, unknown>) => Promise<void>;
  onDeleteFamilyActivity: (memberId: string, actId: string) => Promise<void>;
  onCreateImportantDate: (payload: Record<string, unknown>) => Promise<void>;
  onDeleteImportantDate: (id: string) => Promise<void>;
}

type ChildProfileTab =
  | 'Overview'
  | 'School'
  | 'Activities'
  | 'Health'
  | 'Tasks'
  | 'Important Dates'
  | 'Documents'
  | 'Notes';

export const FamilyPage: React.FC<FamilyPageProps> = ({
  state,
  darkMode,
  initialSubFilter,
  onNavigate,
  onCreateFamilyMember,
  onUpdateFamilyMember,
  onDeleteFamilyMember,
  onAddFamilyActivity,
  onDeleteFamilyActivity,
  onCreateImportantDate,
  onDeleteImportantDate,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialSubFilter && state.familyMembers.some((f) => f.id === initialSubFilter)
      ? initialSubFilter
      : state.familyMembers[0]?.id || ''
  );

  const [activeTab, setActiveTab] = useState<ChildProfileTab>(
    initialSubFilter &&
      ['School', 'Activities', 'Health', 'Tasks'].includes(initialSubFilter)
      ? (initialSubFilter as ChildProfileTab)
      : 'Overview'
  );

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Member form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Daughter');
  const [dateOfBirth, setDateOfBirth] = useState('2017-03-12');
  const [ageText, setAgeText] = useState('8 years • Mar 12');
  const [schoolInfo, setSchoolInfo] = useState('');
  const [gradeOrRole, setGradeOrRole] = useState('');
  const [allergiesOrMedical, setAllergiesOrMedical] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('Sarah Wilson • +1 (415) 890-4321');
  const [notes, setNotes] = useState('');

  // Activity Modal state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState<'School' | 'Activities' | 'Health' | 'Tasks' | 'Important Date'>('Activities');
  const [actDate, setActDate] = useState('2025-10-16');
  const [actTime, setActTime] = useState('04:00 PM');
  const [actLocation, setActLocation] = useState('');
  const [actNotes, setActNotes] = useState('');

  // Important Date Quick Form
  const [idTitle, setIdTitle] = useState('');
  const [idDate, setIdDate] = useState('2025-10-28');
  const [idType, setIdType] = useState<'Birthday' | 'Anniversary' | 'School date' | 'Renewal' | 'Custom'>('School date');

  const selectedMember =
    state.familyMembers.find((f) => f.id === selectedMemberId) ||
    state.familyMembers[0];

  const openCreateMember = () => {
    setEditingMember(null);
    setName('');
    setRelationship('Daughter');
    setDateOfBirth('2018-05-12');
    setAgeText('7 years • May 12');
    setSchoolInfo('');
    setGradeOrRole('');
    setAllergiesOrMedical('No known allergies');
    setDoctorName('Dr. Julian Bennett');
    setEmergencyContact('Sarah Wilson • +1 (415) 890-4321');
    setNotes('');
    setIsMemberModalOpen(true);
  };

  const openEditMember = (m: FamilyMember) => {
    setEditingMember(m);
    setName(m.name);
    setRelationship(m.relationship);
    setDateOfBirth(m.dateOfBirth);
    setAgeText(m.ageText);
    setSchoolInfo(m.schoolInfo);
    setGradeOrRole(m.gradeOrRole);
    setAllergiesOrMedical(m.allergiesOrMedical);
    setDoctorName(m.doctorName);
    setEmergencyContact(m.emergencyContact);
    setNotes(m.notes);
    setIsMemberModalOpen(true);
  };

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421]';

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421]'
  }`;

  const memberTasks = state.tasks.filter(
    (t) => t.familyMemberId === selectedMember?.id
  );
  const memberHealth = state.healthRecords.filter(
    (h) =>
      h.familyMemberId === selectedMember?.id ||
      h.personName.toLowerCase() === selectedMember?.name.toLowerCase()
  );
  const memberDocs = state.documents.filter(
    (d) =>
      d.familyMemberId === selectedMember?.id ||
      d.category === 'Family' ||
      d.title.toLowerCase().includes(selectedMember?.name.toLowerCase() || '')
  );
  const memberDates = state.importantDates.filter(
    (d) =>
      d.familyMemberId === selectedMember?.id ||
      d.personOrEvent.toLowerCase().includes(selectedMember?.name.toLowerCase() || '')
  );

  return (
    <div className="px-4 sm:px-7 py-6 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Family & Children Hub
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Keep the people who matter close — manage school schedules, child activities, medical notes, and milestones.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsActivityModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-[#234732] text-[#234732] dark:text-[#8BD4A4] text-xs font-medium hover:bg-[#E4E9E1]/50 cursor-pointer whitespace-nowrap"
          >
            + Log Activity / Appointment
          </button>
          <button
            type="button"
            onClick={openCreateMember}
            className="px-4 py-2 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {state.familyMembers.length === 0 ? (
        <EmptyState
          title="Keep the people who matter close."
          subtitle="Add your children and family members to organize their school schedules, activities, health records, and birthdays."
          actionLabel="Add Family Member"
          onAction={openCreateMember}
          icon={<Users className="w-5 h-5" />}
          darkMode={darkMode}
        />
      ) : (
        <>
          {/* Top Family Portrait Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {state.familyMembers.map((member) => {
              const isSelected = member.id === selectedMember?.id;
              const toneBg = darkMode
                ? isSelected
                  ? 'bg-[#223329] border-[#528565]'
                  : 'bg-[#18231D] border-[#28382E]'
                : member.cardTone === 'blush'
                ? 'bg-[#F9ECEC] border-[#F0D9D9]'
                : member.cardTone === 'sky'
                ? 'bg-[#EAF2F8] border-[#D4E4F0]'
                : 'bg-[#EBF1EB] border-[#D7E3D7]';

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`rounded-2xl border p-5 flex items-center justify-between cursor-pointer transition-all ${toneBg} ${
                    isSelected ? 'ring-2 ring-[#234732]' : 'hover:opacity-95'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <AvatarImage
                      photoKey={member.photo}
                      name={member.name}
                      className="w-16 h-16 rounded-full ring-2 ring-white shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif-display text-2xl font-semibold">
                          {member.name}
                        </h2>
                        <span className="text-xs text-[#5A625D] dark:text-[#A9B8AF]">
                          · {member.relationship}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E7671] dark:text-[#A9B8AF] mt-0.5">
                        {member.ageText}
                      </p>
                      <p className="text-[11px] text-[#49524C] dark:text-[#C4D1C9] mt-1 truncate max-w-[220px]">
                        {member.gradeOrRole} · {member.activities.length} scheduled items
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditMember(member);
                      }}
                      className="p-1.5 rounded-lg text-[#5A625D] hover:bg-white/60"
                      title="Edit profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingMemberId(member.id);
                      }}
                      className="p-1.5 rounded-lg text-[#5A625D] hover:text-[#B84A4A] hover:bg-white/60"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Family Member / Child Deep Profile */}
          {selectedMember && (
            <div className={`${cardSurface} rounded-2xl border overflow-hidden`}>
              {/* Sub-Navigation Tabs for Child / Member Profile */}
              <div
                className={`px-6 py-3.5 border-b flex items-center justify-between flex-wrap gap-3 ${
                  darkMode ? 'border-[#28382E] bg-[#141E18]' : 'border-[#EAE5DC] bg-[#FAF8F4]'
                }`}
              >
                <div className="flex items-center gap-1 overflow-x-auto">
                  {(
                    [
                      { id: 'Overview', icon: Users },
                      { id: 'School', icon: GraduationCap },
                      { id: 'Activities', icon: Shapes },
                      { id: 'Health', icon: Heart },
                      { id: 'Tasks', icon: CheckSquare },
                      { id: 'Important Dates', icon: CalendarHeart },
                      { id: 'Documents', icon: Folder },
                      { id: 'Notes', icon: FileText },
                    ] as const
                  ).map((tab) => {
                    const TabIcon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#234732] text-white font-semibold'
                            : 'text-[#5A625D] hover:bg-[#EAE5DC]/60 dark:text-[#A9B8AF]'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'Overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Key Personal, School & Emergency Info */}
                    <div className="lg:col-span-5 space-y-4">
                      <div
                        className={`p-4 rounded-2xl border space-y-3 ${
                          darkMode
                            ? 'bg-[#131C17] border-[#28382E]'
                            : 'bg-[#FAF8F4] border-[#EAE5DC]'
                        }`}
                      >
                        <h3 className="text-sm font-semibold">
                          Personal & School Profile — {selectedMember.name}
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-[#EDE9DF] dark:border-[#24332A]">
                            <span className="text-[#7A827D]">Date of Birth</span>
                            <span className="font-medium tabular-nums">
                              {selectedMember.dateOfBirth} ({selectedMember.ageText})
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#EDE9DF] dark:border-[#24332A]">
                            <span className="text-[#7A827D]">School / Role</span>
                            <span className="font-medium text-right">
                              {selectedMember.schoolInfo || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#EDE9DF] dark:border-[#24332A]">
                            <span className="text-[#7A827D]">Primary Physician</span>
                            <span className="font-medium">
                              {selectedMember.doctorName || 'Dr. Julian Bennett'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#EDE9DF] dark:border-[#24332A]">
                            <span className="text-[#7A827D]">Allergies & Medical</span>
                            <span className="font-medium text-right">
                              {selectedMember.allergiesOrMedical}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[#7A827D]">Emergency Contact</span>
                            <span className="font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#234732]" />
                              {selectedMember.emergencyContact}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#5A625D] dark:text-[#A9B8AF] pt-2 italic">
                          “{selectedMember.notes}”
                        </p>
                      </div>
                    </div>

                    {/* Right Column: All Scheduled Activities & Appointments */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          Upcoming Activities, School Meetings & Appointments
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsActivityModalOpen(true)}
                          className="text-xs text-[#234732] dark:text-[#8BD4A4] font-medium hover:underline"
                        >
                          + Add Activity
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {selectedMember.activities.map((act) => (
                          <div
                            key={act.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                              darkMode
                                ? 'bg-[#131C17] border-[#28382E]'
                                : 'bg-[#FAF8F4] border-[#EAE5DC]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">{act.title}</span>
                                <span className="text-[11px] text-[#7A827D]">
                                  · {act.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-[#6E7671] mt-1 tabular-nums">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {act.date} at {act.time}
                                </span>
                                {act.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {act.location}
                                  </span>
                                )}
                              </div>
                              {act.notes && (
                                <p className="text-[11px] text-[#7A827D] mt-1">
                                  {act.notes}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteFamilyActivity(selectedMember.id, act.id)
                              }
                              className="p-1.5 text-[#878F8A] hover:text-[#B84A4A]"
                              aria-label={`Delete ${act.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(activeTab === 'School' || activeTab === 'Activities') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">
                          {selectedMember.name}’s {activeTab} Schedule
                        </h3>
                        <p className="text-xs text-[#7A827D]">
                          {selectedMember.schoolInfo}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActCategory(activeTab);
                          setIsActivityModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#234732] text-white text-xs font-medium"
                      >
                        + Add {activeTab} Entry
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedMember.activities
                        .filter((a) => a.category === activeTab)
                        .map((act) => (
                          <div
                            key={act.id}
                            className="p-4 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex justify-between"
                          >
                            <div>
                              <h4 className="text-xs font-semibold">{act.title}</h4>
                              <p className="text-[11px] text-[#6E7671] mt-1 tabular-nums">
                                {act.date} · {act.time} · {act.location}
                              </p>
                              <p className="text-xs text-[#7A827D] mt-1">{act.notes}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteFamilyActivity(selectedMember.id, act.id)
                              }
                              className="text-[#878F8A] hover:text-[#B84A4A]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Health' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Medical & Vaccination Records for {selectedMember.name}
                        </h3>
                        <p className="text-xs text-[#7A827D]">
                          Doctor: {selectedMember.doctorName} · {selectedMember.allergiesOrMedical}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('health')}
                        className="px-3.5 py-2 rounded-xl bg-[#234732] text-white text-xs font-medium"
                      >
                        Open Full Health Module
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {memberHealth.map((hr) => (
                        <div
                          key={hr.id}
                          className="p-4 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Stethoscope className="w-4 h-4 text-[#234732]" />
                            <div>
                              <p className="text-xs font-semibold">{hr.title}</p>
                              <p className="text-[11px] text-[#7A827D]">
                                {hr.type} · {hr.date} · {hr.providerOrLocation}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-[#234732]">
                            {hr.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Tasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Tasks Linked to {selectedMember.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => onNavigate('tasks')}
                        className="text-xs text-[#234732] font-medium hover:underline"
                      >
                        Manage in Tasks →
                      </button>
                    </div>
                    <div className="space-y-2">
                      {memberTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-semibold">{t.title}</p>
                            <p className="text-[11px] text-[#7A827D] tabular-nums">
                              Due {t.dueDate} at {t.dueTime} · {t.priority} Priority
                            </p>
                          </div>
                          <span className="text-xs font-medium text-[#234732]">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Important Dates' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(memberDates.length > 0 ? memberDates : state.importantDates).map(
                        (d) => (
                          <div
                            key={d.id}
                            className="p-4 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold">{d.title}</p>
                              <p className="text-[11px] text-[#7A827D] tabular-nums">
                                {d.type} · {d.date} · Reminder {d.reminderDaysBefore} days before
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onDeleteImportantDate(d.id)}
                              className="text-[#878F8A] hover:text-[#B84A4A]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      )}
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await onCreateImportantDate({
                          title: idTitle,
                          personOrEvent: selectedMember.name,
                          type: idType,
                          date: idDate,
                          familyMemberId: selectedMember.id,
                          recurringYearly: true,
                          reminderDaysBefore: 7,
                        });
                        setIdTitle('');
                      }}
                      className="flex flex-wrap items-center gap-2 pt-2"
                    >
                      <input
                        type="text"
                        required
                        value={idTitle}
                        onChange={(e) => setIdTitle(e.target.value)}
                        placeholder={`Add milestone for ${selectedMember.name}...`}
                        className="px-3 py-2 rounded-xl border border-[#E2DDD2] text-xs flex-1"
                      />
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value as any)}
                        className="px-3 py-2 rounded-xl border border-[#E2DDD2] text-xs"
                      >
                        <option value="School date">School Date</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Anniversary">Anniversary</option>
                        <option value="Renewal">Renewal</option>
                        <option value="Custom">Custom</option>
                      </select>
                      <input
                        type="date"
                        value={idDate}
                        onChange={(e) => setIdDate(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E2DDD2] text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#234732] text-white text-xs font-medium"
                      >
                        Add Date
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'Documents' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Family & School Documents
                      </h3>
                      <button
                        type="button"
                        onClick={() => onNavigate('documents')}
                        className="text-xs text-[#234732] font-medium hover:underline"
                      >
                        Open Document Vault →
                      </button>
                    </div>
                    {memberDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold">{doc.title}</p>
                          <p className="text-[11px] text-[#7A827D]">
                            {doc.fileName} · {doc.fileSize} · Uploaded {doc.uploadedAt}
                          </p>
                        </div>
                        <span className="text-xs text-[#234732] font-medium">
                          {doc.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Notes' && (
                  <div className="space-y-3">
                    <p className="text-xs leading-relaxed text-[#49524C] dark:text-[#C4D1C9]">
                      {selectedMember.notes}
                    </p>
                    {state.notes
                      .filter((n) => n.category === 'Family Notes')
                      .map((n) => (
                        <div
                          key={n.id}
                          className="p-4 rounded-xl border border-[#EAE5DC] dark:border-[#28382E]"
                        >
                          <h4 className="text-xs font-semibold">{n.title}</h4>
                          <p className="text-xs text-[#6E7671] mt-1">{n.content}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Family Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title={editingMember ? `Edit ${editingMember.name}` : 'Add Family Member'}
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              name,
              relationship,
              dateOfBirth,
              ageText,
              schoolInfo,
              gradeOrRole,
              allergiesOrMedical,
              doctorName,
              emergencyContact,
              notes,
              photo:
                relationship === 'Son' || relationship === 'Father'
                  ? 'adam'
                  : 'emma',
              cardTone:
                relationship === 'Son'
                  ? 'sky'
                  : relationship === 'Daughter'
                  ? 'blush'
                  : 'sage',
            };
            if (editingMember) {
              await onUpdateFamilyMember(editingMember.id, payload);
            } else {
              await onCreateFamilyMember(payload);
            }
            setIsMemberModalOpen(false);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className={inputClass}
              >
                {['Daughter', 'Son', 'Spouse', 'Mother', 'Father', 'Sister', 'Brother', 'Other'].map(
                  (r) => (
                    <option key={r} value={r}>{r}</option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Age Display Label</label>
              <input
                type="text"
                value={ageText}
                onChange={(e) => setAgeText(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Grade / Role</label>
              <input
                type="text"
                value={gradeOrRole}
                onChange={(e) => setGradeOrRole(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">School / Institution Details</label>
            <input
              type="text"
              value={schoolInfo}
              onChange={(e) => setSchoolInfo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Allergies / Medical Notes</label>
            <input
              type="text"
              value={allergiesOrMedical}
              onChange={(e) => setAllergiesOrMedical(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Personal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Child Activity / Appointment Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title={`Add Activity for ${selectedMember?.name || 'Family'}`}
        subtitle="Automatically syncs to your main Dailyra Calendar."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedMember) return;
            await onAddFamilyActivity(selectedMember.id, {
              title: actTitle,
              category: actCategory,
              date: actDate,
              time: actTime,
              location: actLocation,
              notes: actNotes,
            });
            setActTitle('');
            setActLocation('');
            setActNotes('');
            setIsActivityModalOpen(false);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Activity Title *</label>
            <input
              type="text"
              required
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              placeholder="e.g., Swimming Class, Science Fair, Dentist"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Section</label>
              <select
                value={actCategory}
                onChange={(e) => setActCategory(e.target.value as any)}
                className={inputClass}
              >
                {['Activities', 'School', 'Health', 'Tasks', 'Important Date'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Time</label>
              <input
                type="text"
                value={actTime}
                onChange={(e) => setActTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Location</label>
            <input
              type="text"
              value={actLocation}
              onChange={(e) => setActLocation(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <input
              type="text"
              value={actNotes}
              onChange={(e) => setActNotes(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white"
            >
              Save Activity
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingMemberId)}
        title="Remove family member profile?"
        message="This action cannot be undone."
        onConfirm={() => {
          if (deletingMemberId) onDeleteFamilyMember(deletingMemberId);
        }}
        onCancel={() => setDeletingMemberId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
