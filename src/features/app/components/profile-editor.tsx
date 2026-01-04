"use client";

import { useState, useCallback, useEffect } from "react";
import { Button, Input, P } from "@neynar/ui";
import { Globe, Zap, Hash, MoreHorizontal, X, Trash2, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import type { Project } from "@/features/app/types";

interface ProjectEditorProps {
  project?: Project;
  onSave: (project: Omit<Project, "id">) => void;
  onCancel: () => void;
  onDelete?: () => void;
  t: (key: string) => string;
  isDark: boolean;
  theme: {
    gradient: string;
    bg: string;
    text: string;
  };
}

const PROJECT_TYPES = [
  { value: "website", icon: Globe },
  { value: "miniapp", icon: Zap },
  { value: "channel", icon: Hash },
  { value: "other", icon: MoreHorizontal },
] as const;

export function ProjectEditor({
  project,
  onSave,
  onCancel,
  onDelete,
  t,
  isDark,
  theme,
}: ProjectEditorProps) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [url, setUrl] = useState(project?.url || "");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl || "");
  const [type, setType] = useState<Project["type"]>(project?.type || "website");
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [showManualImage, setShowManualImage] = useState(!!project?.imageUrl);

  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-zinc-400" : "text-gray-500";
  const inputBg = isDark ? "bg-zinc-800" : "bg-gray-100";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";

  // Fetch preview image when URL changes
  const fetchPreviewImage = useCallback(async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    // Don't fetch for Farcaster channels
    if (targetUrl.startsWith("/") || targetUrl.includes("warpcast.com/~/channel")) {
      return;
    }

    let finalUrl = targetUrl.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    setIsFetchingImage(true);
    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(finalUrl)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.image) {
          setImageUrl(data.image);
          setShowManualImage(true);
        }
      }
    } catch {
      // Silently fail - user can add image manually
    } finally {
      setIsFetchingImage(false);
    }
  }, []);

  // Auto-fetch image when URL is entered (with debounce)
  useEffect(() => {
    if (!url || project?.imageUrl) return; // Don't auto-fetch if editing with existing image

    const timer = setTimeout(() => {
      if (url.length > 5 && !imageUrl) {
        fetchPreviewImage(url);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [url, imageUrl, fetchPreviewImage, project?.imageUrl]);

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return;

    // Ensure URL has protocol
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      if (finalUrl.startsWith("/")) {
        finalUrl = `https://warpcast.com${finalUrl}`;
      } else {
        finalUrl = `https://${finalUrl}`;
      }
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      url: finalUrl,
      type,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  const isValid = title.trim().length > 0 && url.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className={`text-sm font-medium ${textClass}`}>
          {t("projectTitle")}
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Cool Project"
          className={`${inputBg} ${borderClass}`}
          maxLength={50}
        />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <label className={`text-sm font-medium ${textClass}`}>
          {t("projectUrl")}
        </label>
        <div className="relative">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com or /channel-name"
            className={`${inputBg} ${borderClass} pr-10`}
          />
          {isFetchingImage && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className={`w-4 h-4 animate-spin ${mutedTextClass}`} />
            </div>
          )}
        </div>
        <P className={`text-xs ${mutedTextClass}`}>
          {t("urlHelp") || "Supports websites, mini apps, or Farcaster channels (/channel)"}
        </P>
      </div>

      {/* Image Preview / Manual URL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium ${textClass}`}>
            {t("projectImage") || "Preview Image"}
          </label>
          {!showManualImage && (
            <button
              onClick={() => setShowManualImage(true)}
              className={`text-xs ${theme.text} hover:underline`}
            >
              {t("addManually") || "Add manually"}
            </button>
          )}
        </div>

        {showManualImage && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className={`${inputBg} ${borderClass} flex-1`}
              />
              {url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchPreviewImage(url)}
                  disabled={isFetchingImage}
                  className={`shrink-0 ${mutedTextClass}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isFetchingImage ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className={`relative rounded-lg overflow-hidden border ${borderClass} aspect-video`}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )}

            {!imageUrl && (
              <div className={`flex items-center justify-center rounded-lg border border-dashed ${borderClass} aspect-video`}>
                <div className="text-center">
                  <ImageIcon className={`w-8 h-8 mx-auto ${mutedTextClass} mb-1`} />
                  <P className={`text-xs ${mutedTextClass}`}>
                    {t("noImageYet") || "No image yet"}
                  </P>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className={`text-sm font-medium ${textClass}`}>
          {t("projectDescription")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of this project..."
          className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${borderClass} border ${textClass} placeholder:${mutedTextClass} resize-none focus:outline-none focus:ring-2 focus:ring-primary/50`}
          rows={2}
          maxLength={150}
        />
        <P className={`text-xs ${mutedTextClass} text-right`}>
          {description.length}/150
        </P>
      </div>

      {/* Type selector */}
      <div className="space-y-2">
        <label className={`text-sm font-medium ${textClass}`}>
          {t("projectType")}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PROJECT_TYPES.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                type === value
                  ? `bg-gradient-to-br ${theme.gradient} text-white border-transparent`
                  : `${isDark ? "bg-zinc-800/50" : "bg-gray-50"} ${borderClass} ${mutedTextClass} hover:border-primary/50`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{t(value)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t("delete")}
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" />
          {t("cancel")}
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isValid}
          className={`bg-gradient-to-r ${theme.gradient} text-white`}
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
