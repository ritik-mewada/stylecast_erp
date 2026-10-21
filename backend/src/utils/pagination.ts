// Shared pagination helpers for list endpoints. Query strings arrive as
// strings (or not at all), so page and limit are clamped to sane values here:
// page >= 1 and 1 <= limit <= 100. Every paginated endpoint returns the same
// { data, pagination } shape.

export const MAX_PAGE_SIZE = 100;

export const parsePagination = (page: unknown, limit: unknown, defaultLimit = 20) => {
  const safePage = Math.max(Math.floor(Number(page)) || 1, 1);
  const safeLimit = Math.min(
    Math.max(Math.floor(Number(limit)) || defaultLimit, 1),
    MAX_PAGE_SIZE,
  );
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
};

export const paginated = <T>(data: T[], total: number, page: number, limit: number) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});

// Escapes LIKE/ILIKE wildcards so a search for "50%" matches the literal text.
export const escapeLike = (term: string) => term.replace(/[\\%_]/g, (c) => `\\${c}`);

// "contains" pattern for ILIKE searches.
export const likePattern = (term: string) => `%${escapeLike(term)}%`;
