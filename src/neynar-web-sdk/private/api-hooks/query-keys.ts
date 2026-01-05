/**
 * Hierarchical query key factory utilities
 * Preserves the excellent nested invalidation system from the old api-hooks
 * Following TanStack Query v5 best practices for hierarchical key management
 */

import type { QueryKeyFactory, ScopedQueryKeyFactory } from "./types";

/**
 * Creates a hierarchical query key factory for consistent key management
 */
export function createQueryKeyFactory(scope: string): QueryKeyFactory {
  return {
    all: () => [scope] as const,
    lists: () => [scope, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [scope, "list", filters ?? {}] as const,
    details: () => [scope, "detail"] as const,
    detail: (id: string | number, ...args: unknown[]) =>
      [scope, "detail", id, ...args] as const,
  };
}

/**
 * Creates scoped query keys for specific endpoints
 */
export function createScopedQueryKeys(
  scope: string,
  endpoint: string,
): ScopedQueryKeyFactory {
  return {
    all: () => [scope, endpoint] as const,
    lists: () => [scope, endpoint, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [scope, endpoint, "list", filters ?? {}] as const,
    details: () => [scope, endpoint, "detail"] as const,
    detail: (id: string | number, ...args: unknown[]) =>
      [scope, endpoint, "detail", id, ...args] as const,
    custom: (type: string, ...args: unknown[]) =>
      [scope, endpoint, type, ...args] as const,
  };
}

/**
 * Utility to create invalidation keys by pattern
 */
export function getInvalidationKey(
  scope: string,
  endpoint?: string,
  type?: string,
): readonly string[] {
  if (!endpoint) {
    return [scope];
  }
  if (!type) {
    return [scope, endpoint];
  }
  return [scope, endpoint, type];
}

/**
 * Utility to normalize filter parameters for consistent cache keys
 */
export function normalizeFilters(
  filters?: Record<string, unknown>,
): Record<string, unknown> {
  if (!filters) return {};

  const normalized: Record<string, unknown> = {};
  const sortedKeys = Object.keys(filters).sort();

  for (const key of sortedKeys) {
    const value = filters[key];

    if (Array.isArray(value)) {
      const sorted = [...value].sort((a, b) => {
        if (typeof a === "number" && typeof b === "number") {
          return a - b;
        }
        return String(a).localeCompare(String(b));
      });
      normalized[key] = sorted.join(",");
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}
