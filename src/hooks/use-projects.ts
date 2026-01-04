"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/features/app/types";

// Storage key prefix for per-user project settings
const STORAGE_KEY_PREFIX = "profile-projects-";

// Maximum number of projects allowed
export const MAX_PROJECTS = 6;

export function useProjects(fid: number | undefined) {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    if (!fid) {
      setIsLoaded(true);
      return;
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${fid}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setProjectsState(parsed);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    setIsLoaded(true);
  }, [fid]);

  // Save projects to localStorage
  const saveProjects = useCallback(
    (newProjects: Project[]) => {
      if (!fid) return;

      setProjectsState(newProjects);
      const storageKey = `${STORAGE_KEY_PREFIX}${fid}`;
      localStorage.setItem(storageKey, JSON.stringify(newProjects));
    },
    [fid]
  );

  // Add a new project
  const addProject = useCallback(
    (project: Omit<Project, "id">) => {
      if (projects.length >= MAX_PROJECTS) return false;

      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
      };

      saveProjects([...projects, newProject]);
      return true;
    },
    [projects, saveProjects]
  );

  // Update an existing project
  const updateProject = useCallback(
    (id: string, updates: Partial<Omit<Project, "id">>) => {
      const updatedProjects = projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      saveProjects(updatedProjects);
    },
    [projects, saveProjects]
  );

  // Remove a project
  const removeProject = useCallback(
    (id: string) => {
      const filteredProjects = projects.filter((p) => p.id !== id);
      saveProjects(filteredProjects);
    },
    [projects, saveProjects]
  );

  // Reorder projects
  const reorderProjects = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newProjects = [...projects];
      const [removed] = newProjects.splice(fromIndex, 1);
      newProjects.splice(toIndex, 0, removed);
      saveProjects(newProjects);
    },
    [projects, saveProjects]
  );

  return {
    projects,
    isLoaded,
    addProject,
    updateProject,
    removeProject,
    reorderProjects,
    canAddMore: projects.length < MAX_PROJECTS,
    projectCount: projects.length,
    maxProjects: MAX_PROJECTS,
  };
}
