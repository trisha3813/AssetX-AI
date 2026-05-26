import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global Zustand Watchlist Store
 * 
 * Manages the active tracked asset watchlist array across all page layouts and hooks.
 * Features:
 * - LocalStorage state persistence under the key 'assetx_watchlist'
 * - Duplication guards preventing tracking the same ticker twice
 * - Actions for adding, removing, and force-setting the watchlist
 */
export const useWatchlistStore = create(
  persist(
    (set) => ({
      watchlist: ["BTC", "AAPL", "NVDA"], // Baseline tracked assets
      
      /**
       * Adds a ticker symbol to the watchlist with duplication safety.
       * @param {string} ticker - Asset ticker to start tracking.
       */
      addAsset: (ticker) => set((state) => {
        const cleanedTicker = ticker.toUpperCase();
        if (state.watchlist.includes(cleanedTicker)) {
          return state; // Duplicate guard
        }
        return { watchlist: [...state.watchlist, cleanedTicker] };
      }),

      /**
       * Removes a ticker symbol from the watchlist.
       * @param {string} ticker - Asset ticker to stop tracking.
       */
      removeAsset: (ticker) => set((state) => {
        const cleanedTicker = ticker.toUpperCase();
        return {
          watchlist: state.watchlist.filter((t) => t !== cleanedTicker)
        };
      }),

      /**
       * Forces the watchlist to a specific list of assets.
       * Useful for syncing with user profiles during logins or session updates.
       * @param {string[]} newList - Array of asset tickers.
       */
      setWatchlist: (newList) => set(() => {
        if (!Array.isArray(newList)) return { watchlist: [] };
        // Clean tickers
        const cleaned = newList.map(t => t.toUpperCase());
        // Remove duplicates in input array
        const unique = [...new Set(cleaned)];
        return { watchlist: unique };
      }),

      /**
       * Toggles the presence of an asset in the watchlist.
       * @param {string} ticker - Asset ticker to toggle.
       */
      toggleAsset: (ticker) => set((state) => {
        const cleanedTicker = ticker.toUpperCase();
        if (state.watchlist.includes(cleanedTicker)) {
          return {
            watchlist: state.watchlist.filter((t) => t !== cleanedTicker)
          };
        } else {
          return {
            watchlist: [...state.watchlist, cleanedTicker]
          };
        }
      })
    }),
    {
      name: 'assetx_watchlist', // Key name for browser localStorage
    }
  )
);
export default useWatchlistStore;
