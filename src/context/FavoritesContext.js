import React, { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext();

const FAV_KEY = 'mitho-favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = (item) => {
    if (!item || !item._id) return;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item._id);
      if (exists) return prev.filter((f) => f.id !== item._id);
      const price =
        item.options && Object.keys(item.options).length > 0
          ? Object.values(item.options)[0]
          : 0;
      return [
        { id: item._id, name: item.name, img: item.img, price, category: item.CategoryName },
        ...prev,
      ];
    });
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const removeFavorite = (id) => setFavorites((prev) => prev.filter((f) => f.id !== id));

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite, removeFavorite, count: favorites.length }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
