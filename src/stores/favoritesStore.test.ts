import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoritesStore } from './favoritesStore';

describe('favoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favoriteIds: [] });
  });

  it('should start with empty favorites', () => {
    const { favoriteIds } = useFavoritesStore.getState();
    expect(favoriteIds).toEqual([]);
  });

  it('should add a favorite', () => {
    useFavoritesStore.getState().toggleFavorite(1);
    expect(useFavoritesStore.getState().favoriteIds).toEqual([1]);
  });

  it('should remove a favorite on second toggle', () => {
    useFavoritesStore.getState().toggleFavorite(1);
    useFavoritesStore.getState().toggleFavorite(1);
    expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
  });

  it('should report isFavorite correctly', () => {
    useFavoritesStore.getState().toggleFavorite(42);
    expect(useFavoritesStore.getState().isFavorite(42)).toBe(true);
    expect(useFavoritesStore.getState().isFavorite(99)).toBe(false);
  });

  it('should handle multiple favorites', () => {
    const store = useFavoritesStore.getState();
    store.toggleFavorite(1);
    store.toggleFavorite(2);
    store.toggleFavorite(3);
    const ids = useFavoritesStore.getState().favoriteIds;
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(ids).toContain(3);
    expect(ids).toHaveLength(3);
  });
});
