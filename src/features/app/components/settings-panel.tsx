"use client";

import { useState } from "react";
import { StandardMiniLayout } from "@/neynar-farcaster-sdk/mini";
import { P, H3 } from "@neynar/ui";
import { ArrowLeft, Sun, Moon, Check, Palette, Type, Image, MessageCircle, ChevronRight, Globe, FolderOpen, Plus, Pencil, Globe as GlobeIcon, Zap, Hash, MoreHorizontal, GripVertical, ChevronUp, ChevronDown, RotateCcw, Layers, User } from "lucide-react";
import {
  COLOR_THEMES,
  FONT_OPTIONS,
  type ColorThemeKey,
  type FontKey,
  type DisplayMode,
} from "@/hooks/use-profile-theme";
import { LANGUAGES, type LanguageKey } from "@/hooks/use-language";
import { SECTIONS, type SectionId } from "@/hooks/use-section-order";
import { ProjectEditor } from "./project-editor";
import type { Project } from "@/features/app/types";

interface SettingsPanelProps {
  colorTheme: ColorThemeKey;
  font: FontKey;
  displayMode: DisplayMode;
  language: LanguageKey;
  t: (key: string) => string;
  onSetColorTheme: (theme: ColorThemeKey) => void;
  onSetFont: (font: FontKey) => void;
  onSetLanguage: (language: LanguageKey) => void;
  onToggleDisplayMode: () => void;
  onManageNFTs: () => void;
  onManageCast: () => void;
  hasCustomNFTs: boolean;
  hasCustomCast: boolean;
  // Projects
  projects: Project[];
  onAddProject: (project: Omit<Project, "id">) => boolean;
  onUpdateProject: (id: string, updates: Partial<Omit<Project, "id">>) => void;
  onRemoveProject: (id: string) => void;
  canAddMoreProjects: boolean;
  maxProjects: number;
  // Section Ordering
  sectionOrder: SectionId[];
  onMoveSectionUp: (sectionId: SectionId) => void;
  onMoveSectionDown: (sectionId: SectionId) => void;
  onResetSectionOrder: () => void;
  // Extended Bio
  extendedBio: string;
  onSetExtendedBio: (bio: string) => void;
  bioCharacterCount: number;
  bioMaxCharacters: number;
  onClose: () => void;
}

// Icon mapping for project types
const PROJECT_TYPE_ICONS = {
  website: GlobeIcon,
  miniapp: Zap,
  channel: Hash,
  other: MoreHorizontal,
};

export function SettingsPanel({
  colorTheme,
  font,
  displayMode,
  language,
  t,
  onSetColorTheme,
  onSetFont,
  onSetLanguage,
  onToggleDisplayMode,
  onManageNFTs,
  onManageCast,
  hasCustomNFTs,
  hasCustomCast,
  projects,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  canAddMoreProjects,
  maxProjects,
  sectionOrder,
  onMoveSectionUp,
  onMoveSectionDown,
  onResetSectionOrder,
  extendedBio,
  onSetExtendedBio,
  bioCharacterCount,
  bioMaxCharacters,
  onClose,
}: SettingsPanelProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(extendedBio);
  const currentTheme = COLOR_THEMES[colorTheme];
  const currentLanguage = LANGUAGES[language];
  const isDark = displayMode === "dark";

  // Consistent contrast styling
  const bgClass = isDark ? "bg-zinc-950" : "bg-gray-50";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-zinc-400" : "text-gray-500";
  const cardBg = isDark ? "bg-zinc-900/90" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-gray-200";
  const subtleBg = isDark ? "bg-white/5" : "bg-gray-100";
  const hoverBg = isDark ? "hover:bg-white/10" : "hover:bg-gray-100";
  const themeText = isDark ? currentTheme.text : currentTheme.textDark;

  return (
    <StandardMiniLayout>
      <div className={`min-h-screen ${bgClass} ${textClass}`}>
        {/* Themed Header with gradient */}
        <div className={`relative sticky top-0 z-10 overflow-hidden`}>
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradient} opacity-90`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

          <div className="relative flex items-center gap-3 p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <H3 className="font-semibold text-white drop-shadow-sm">{t("customizeProfile")}</H3>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Display Mode Toggle */}
          <div className={`relative rounded-2xl overflow-hidden`}>
            {/* Gradient border */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
              <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
            </div>
            <div className="relative p-4">
              <button
                onClick={onToggleDisplayMode}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${currentTheme.bg}`}>
                    {isDark ? (
                      <Moon className={`w-5 h-5 ${themeText}`} />
                    ) : (
                      <Sun className={`w-5 h-5 ${themeText}`} />
                    )}
                  </div>
                  <div className="text-left">
                    <P className={`font-medium ${textClass}`}>{t("displayMode")}</P>
                    <P className={`text-sm ${mutedTextClass}`}>
                      {isDark ? t("darkMode") : t("lightMode")}
                    </P>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${currentTheme.bg} ${themeText}`}>
                  {isDark ? t("dark") : t("light")}
                </div>
              </button>
            </div>
          </div>

          {/* About Me Section */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.bgSubtle}`}>
              <User className={`w-4 h-4 ${themeText}`} />
              <P className={`text-sm font-medium ${mutedTextClass} uppercase tracking-wide`}>{t("aboutMe")}</P>
            </div>
            <div className={`relative rounded-2xl overflow-hidden`}>
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
              </div>
              <div className="relative p-4">
                {isEditingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value.slice(0, bioMaxCharacters))}
                      placeholder={t("aboutMePlaceholder")}
                      className={`w-full h-40 p-3 rounded-xl border ${cardBorder} ${cardBg} ${textClass} text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-white/30 focus:ring-offset-zinc-900' : 'focus:ring-gray-300 focus:ring-offset-white'}`}
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <P className={`text-xs ${mutedTextClass}`}>
                        {bioMaxCharacters - tempBio.length} {t("charactersRemaining")}
                      </P>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsEditingBio(false);
                            setTempBio(extendedBio);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm ${subtleBg} ${textClass} ${hoverBg}`}
                        >
                          {t("cancel")}
                        </button>
                        <button
                          onClick={() => {
                            onSetExtendedBio(tempBio);
                            setIsEditingBio(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r ${currentTheme.gradient} text-white font-medium`}
                        >
                          {t("save")}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempBio(extendedBio);
                      setIsEditingBio(true);
                    }}
                    className={`w-full text-left ${hoverBg} rounded-xl p-3 transition-colors`}
                  >
                    {extendedBio ? (
                      <div className="space-y-2">
                        <P className={`text-sm leading-relaxed ${textClass} line-clamp-4`}>
                          {extendedBio}
                        </P>
                        <div className="flex items-center gap-2">
                          <Pencil className={`w-3 h-3 ${themeText}`} />
                          <P className={`text-xs ${themeText}`}>{t("editAboutMe")}</P>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-full ${currentTheme.bg} flex items-center justify-center`}>
                          <User className={`w-5 h-5 ${themeText}`} />
                        </div>
                        <P className={`text-sm ${mutedTextClass}`}>{t("noAboutMe")}</P>
                        <P className={`text-xs ${mutedTextClass} mt-1`}>{t("addAboutMe")}</P>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Color Theme Selection */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.bgSubtle}`}>
              <Palette className={`w-4 h-4 ${themeText}`} />
              <P className={`text-sm font-medium ${mutedTextClass} uppercase tracking-wide`}>{t("colorTheme")}</P>
            </div>
            <div className={`relative rounded-2xl overflow-hidden`}>
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
              </div>
              <div className="relative p-4">
                <div className="grid grid-cols-5 gap-3">
                  {(Object.entries(COLOR_THEMES) as [ColorThemeKey, typeof COLOR_THEMES[ColorThemeKey]][]).map(
                    ([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => onSetColorTheme(key)}
                        className={`
                          relative aspect-square rounded-xl transition-all duration-200
                          bg-gradient-to-br ${theme.gradient}
                          ${colorTheme === key
                            ? `ring-2 ${isDark ? 'ring-white ring-offset-zinc-900' : 'ring-gray-900 ring-offset-white'} ring-offset-2 scale-105 shadow-lg`
                            : "opacity-60 hover:opacity-100 hover:scale-105"
                          }
                        `}
                        title={theme.name}
                      >
                        {colorTheme === key && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  )}
                </div>
                <P className={`text-center text-sm ${themeText} font-medium mt-3`}>
                  {currentTheme.name}
                </P>
              </div>
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.bgSubtle}`}>
              <Type className={`w-4 h-4 ${themeText}`} />
              <P className={`text-sm font-medium ${mutedTextClass} uppercase tracking-wide`}>{t("fontStyle")}</P>
            </div>
            <div className={`relative rounded-2xl overflow-hidden`}>
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
              </div>
              <div className="relative p-3">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FONT_OPTIONS) as [FontKey, typeof FONT_OPTIONS[FontKey]][]).map(
                    ([key, fontOption]) => (
                      <button
                        key={key}
                        onClick={() => onSetFont(key)}
                        className={`
                          p-3 rounded-xl border transition-all duration-200 text-left
                          ${fontOption.className}
                          ${font === key
                            ? `border-2 ${currentTheme.borderStrong} ${currentTheme.bg}`
                            : `border ${cardBorder} ${hoverBg}`
                          }
                        `}
                        style={fontOption.style}
                      >
                        <P className={`font-medium text-sm ${font === key ? themeText : textClass}`}>
                          {fontOption.name}
                        </P>
                        <P className={`text-xs ${mutedTextClass} mt-0.5`}>
                          Aa Bb Cc 123
                        </P>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.bgSubtle}`}>
              <Globe className={`w-4 h-4 ${themeText}`} />
              <P className={`text-sm font-medium ${mutedTextClass} uppercase tracking-wide`}>{t("language")}</P>
            </div>
            <div className={`relative rounded-2xl overflow-hidden`}>
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
              </div>
              <div className="relative p-3">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(LANGUAGES) as [LanguageKey, typeof LANGUAGES[LanguageKey]][]).map(
                    ([key, lang]) => (
                      <button
                        key={key}
                        onClick={() => onSetLanguage(key)}
                        className={`
                          p-3 rounded-xl border transition-all duration-200 text-left flex items-center gap-2
                          ${language === key
                            ? `border-2 ${currentTheme.borderStrong} ${currentTheme.bg}`
                            : `border ${cardBorder} ${hoverBg}`
                          }
                        `}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex-1 min-w-0">
                          <P className={`font-medium text-sm truncate ${language === key ? themeText : textClass}`}>
                            {lang.nativeName}
                          </P>
                        </div>
                        {language === key && (
                          <Check className={`w-4 h-4 ${themeText} shrink-0`} />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Management */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.bgSubtle}`}>
              <Image className={`w-4 h-4 ${themeText}`} />
              <P className={`text-sm font-medium ${mutedTextClass} uppercase tracking-wide`}>{t("featuredContent")}</P>
            </div>
            <div className={`relative rounded-2xl overflow-hidden`}>
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
              </div>
              <div className="relative">
                <button
                  onClick={onManageNFTs}
                  className={`w-full flex items-center justify-between p-4 ${hoverBg} transition-colors border-b ${cardBorder}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${currentTheme.bg}`}>
                      <Image className={`w-4 h-4 ${themeText}`} />
                    </div>
                    <div className="text-left">
                      <P className={`font-medium ${textClass}`}>{t("featuredNFTs")}</P>
                      <P className={`text-xs ${mutedTextClass}`}>
                        {t("chooseNFTs")}
                      </P>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasCustomNFTs && (
                      <span className={`text-xs px-2 py-1 rounded-full ${currentTheme.bg} ${themeText}`}>
                        {t("custom")}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${mutedTextClass}`} />
                  </div>
                </button>

                <button
                  onClick={onManageCast}
                  className={`w-full flex items-center justify-between p-4 ${hoverBg} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${currentTheme.bg}`}>
                      <MessageCircle className={`w-4 h-4 ${themeText}`} />
                    </div>
                    <div className="text-left">
                      <P className={`font-medium ${textClass}`}>{t("featuredCast")}</P>
                      <P className={`text-xs ${mutedTextClass}`}>
                        {t("pickCast")}
                      </P>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasCustomCast && (
                      <span className={`text-xs px-2 py-1 rounded-full ${currentTheme.bg} ${themeText}`}>
                        {t("custom")}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${mutedTextClass}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* My Projects Section */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.bgSubtle}`}>
              <FolderOpen className={`w-4 h-4 ${themeText}`} />
              <P className={`text-sm font-medium ${mutedTextClass} uppercase tracking-wide`}>{t("myProjects")}</P>
              <span className={`text-xs ${mutedTextClass} ml-auto`}>
                {projects.length}/{maxProjects}
              </span>
            </div>
            <div className={`relative rounded-2xl overflow-hidden`}>
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
              </div>
              <div className="relative p-4 space-y-3">
                {/* Adding/Editing Project Form */}
                {(isAddingProject || editingProject) && (
                  <div className={`p-4 rounded-xl ${subtleBg} border ${cardBorder}`}>
                    <ProjectEditor
                      project={editingProject || undefined}
                      onSave={(projectData) => {
                        if (editingProject) {
                          onUpdateProject(editingProject.id, projectData);
                        } else {
                          onAddProject(projectData);
                        }
                        setEditingProject(null);
                        setIsAddingProject(false);
                      }}
                      onCancel={() => {
                        setEditingProject(null);
                        setIsAddingProject(false);
                      }}
                      onDelete={editingProject ? () => {
                        onRemoveProject(editingProject.id);
                        setEditingProject(null);
                      } : undefined}
                      t={t}
                      isDark={isDark}
                      theme={{
                        gradient: currentTheme.gradient,
                        bg: currentTheme.bg,
                        text: themeText,
                      }}
                    />
                  </div>
                )}

                {/* Existing Projects List */}
                {!isAddingProject && !editingProject && projects.length > 0 && (
                  <div className="space-y-2">
                    {projects.map((project) => {
                      const TypeIcon = PROJECT_TYPE_ICONS[project.type];
                      return (
                        <button
                          key={project.id}
                          onClick={() => setEditingProject(project)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl ${subtleBg} ${hoverBg} transition-colors text-left group`}
                        >
                          <div className={`p-2 rounded-lg ${currentTheme.bg} shrink-0`}>
                            <TypeIcon className={`w-4 h-4 ${themeText}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <P className={`font-medium text-sm ${textClass} truncate`}>
                              {project.title}
                            </P>
                            {project.description && (
                              <P className={`text-xs ${mutedTextClass} line-clamp-1 mt-0.5`}>
                                {project.description}
                              </P>
                            )}
                          </div>
                          <Pencil className={`w-4 h-4 ${mutedTextClass} opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1`} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Empty State */}
                {!isAddingProject && !editingProject && projects.length === 0 && (
                  <div className="text-center py-4">
                    <P className={`text-sm ${mutedTextClass}`}>{t("noProjects")}</P>
                    <P className={`text-xs ${mutedTextClass} mt-1`}>{t("addFirstProject")}</P>
                  </div>
                )}

                {/* Add Project Button */}
                {!isAddingProject && !editingProject && canAddMoreProjects && (
                  <button
                    onClick={() => setIsAddingProject(true)}
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed ${cardBorder} ${hoverBg} transition-colors`}
                  >
                    <Plus className={`w-4 h-4 ${themeText}`} />
                    <P className={`text-sm font-medium ${themeText}`}>{t("addProject")}</P>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section Order */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.bgSubtle}`}>
              <Layers className={`w-4 h-4 ${themeText}`} />
              <P className={`text-sm font-medium ${mutedTextClass} uppercase tracking-wide`}>{t("sectionOrder")}</P>
              <button
                onClick={onResetSectionOrder}
                className={`ml-auto flex items-center gap-1 text-xs ${themeText} hover:underline`}
              >
                <RotateCcw className="w-3 h-3" />
                {t("resetOrder")}
              </button>
            </div>
            <div className={`relative rounded-2xl overflow-hidden`}>
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} p-[1px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[15px]`} />
              </div>
              <div className="relative p-3 space-y-2">
                {sectionOrder.map((sectionId, index) => {
                  const section = SECTIONS[sectionId];
                  const isFirst = index === 0;
                  const isLast = index === sectionOrder.length - 1;

                  return (
                    <div
                      key={sectionId}
                      className={`flex items-center gap-3 p-3 rounded-xl ${subtleBg} ${hoverBg} transition-colors`}
                    >
                      <GripVertical className={`w-4 h-4 ${mutedTextClass}`} />
                      <span className={`flex-1 text-sm font-medium ${textClass}`}>
                        {t(section.labelKey)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onMoveSectionUp(sectionId)}
                          disabled={isFirst}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isFirst
                              ? `opacity-30 cursor-not-allowed`
                              : `${hoverBg} ${mutedTextClass}`
                          }`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onMoveSectionDown(sectionId)}
                          disabled={isLast}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isLast
                              ? `opacity-30 cursor-not-allowed`
                              : `${hoverBg} ${mutedTextClass}`
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StandardMiniLayout>
  );
}
