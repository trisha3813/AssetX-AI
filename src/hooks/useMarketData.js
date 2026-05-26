import { useQuery } from '@tanstack/react-query';
import { marketOverview } from '../mockData';

// Storage key to persist simulated stock prices between refetches
const CACHE_KEY_PRICES = 'assetx_cached_live_prices';

// Helper to initialize or retrieve current price cache from localStorage
function getCachedPrices() {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PRICES);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error('Failed to parse cached prices:', e);
    return null;
  }
}

function saveCachedPrices(prices) {
  try {
    localStorage.setItem(CACHE_KEY_PRICES, JSON.stringify(prices));
  } catch (e) {
    console.error('Failed to save cached prices:', e);
  }
}

/**
 * Fetch and process live crypto and traditional financial metrics.
 * - Live Crypto fetched from public, CORS-free Binance API.
 * - Traditional stocks fetched from a drift-corrected stochastic model, persisting ticks to cache.
 * - Dynamic Day High / Day Low computed directly from active 1D chart histories.
 */
async function fetchMarketData() {
  let cryptoData = [];
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]');
    if (res.ok) {
      cryptoData = await res.json();
    }
  } catch (err) {
    console.warn('Binance Live Crypto fetch error, falling back to local simulation:', err);
  }

  // Load existing price state or start from baseline overview
  const previousPrices = getCachedPrices();
  const nextPrices = {};

  marketOverview.forEach((stock) => {
    const ticker = stock.ticker;
    const isCrypto = ticker === 'BTC' || ticker === 'ETH';
    let basePrice = stock.price;
    let baseChange = stock.change;
    let baseChangePercent = stock.changePercent;
    let baseVolume = stock.volume;

    // Retrieve last cached state if available to preserve price continuum
    if (previousPrices && previousPrices[ticker]) {
      basePrice = previousPrices[ticker].price;
      baseChange = previousPrices[ticker].change;
      baseChangePercent = previousPrices[ticker].changePercent;
      baseVolume = previousPrices[ticker].volume;
    }

    if (isCrypto && cryptoData.length > 0) {
      // Find matching live ticker from Binance
      const symbol = ticker === 'BTC' ? 'BTCUSDT' : 'ETHUSDT';
      const liveTicker = cryptoData.find(d => d.symbol === symbol);

      if (liveTicker) {
        const rawPrice = parseFloat(liveTicker.lastPrice);
        const rawChange = parseFloat(liveTicker.priceChange);
        const rawChangePercent = parseFloat(liveTicker.priceChangePercent);
        
        nextPrices[ticker] = {
          ticker,
          name: stock.name,
          price: rawPrice,
          change: rawChange,
          changePercent: rawChangePercent,
          marketCap: stock.marketCap, // Static baseline cap
          volume: parseFloat(liveTicker.volume).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' ' + ticker,
          peRatio: stock.peRatio,
          dividendYield: stock.dividendYield,
          sparkline: [...stock.sparkline.slice(0, -1), rawPrice],
          history: updateHistoryWithLivePrice(stock.history, rawPrice)
        };
        return;
      }
    }

    // Stochastic Equity Simulation (Random Walk with Drift Correction)
    if (!isCrypto) {
      // Drift stock by small random fraction (-0.1% to +0.1%)
      const fluctuation = (Math.random() - 0.5) * 0.002;
      const nextPrice = Math.max(0.1, basePrice * (1 + fluctuation));
      
      // Calculate daily change based on original mock close
      const baselineClose = stock.price - stock.change;
      const nextChange = nextPrice - baselineClose;
      const nextChangePercent = (nextChange / baselineClose) * 100;

      nextPrices[ticker] = {
        ticker,
        name: stock.name,
        price: parseFloat(nextPrice.toFixed(2)),
        change: parseFloat(nextChange.toFixed(2)),
        changePercent: parseFloat(nextChangePercent.toFixed(2)),
        marketCap: stock.marketCap,
        volume: baseVolume,
        peRatio: stock.peRatio,
        dividendYield: stock.dividendYield,
        sparkline: [...stock.sparkline.slice(0, -1), parseFloat(nextPrice.toFixed(2))],
        history: updateHistoryWithLivePrice(stock.history, nextPrice)
      };
      return;
    }

    // Fallback for crypto if Binance fails
    nextPrices[ticker] = {
      ticker,
      name: stock.name,
      price: basePrice,
      change: baseChange,
      changePercent: baseChangePercent,
      marketCap: stock.marketCap,
      volume: baseVolume,
      peRatio: stock.peRatio,
      dividendYield: stock.dividendYield,
      sparkline: stock.sparkline,
      history: stock.history
    };
  });

  // Calculate Day High / Day Low dynamically from 1D history arrays
  Object.keys(nextPrices).forEach(ticker => {
    const asset = nextPrices[ticker];
    const dayHistory = asset.history?.["1D"] || [];
    const values = dayHistory.map(item => item.value);
    
    // Add current price to values array to ensure calculations are completely fresh
    values.push(asset.price);

    asset.dayHigh = parseFloat(Math.max(...values).toFixed(2));
    asset.dayLow = parseFloat(Math.min(...values).toFixed(2));
  });

  saveCachedPrices(nextPrices);
  return Object.values(nextPrices);
}

// Inline helper to append/modify history lists so charts move dynamically
function updateHistoryWithLivePrice(historyObj, nextPrice) {
  if (!historyObj) return historyObj;
  
  const updatedHistory = { ...historyObj };
  Object.keys(updatedHistory).forEach(tf => {
    if (updatedHistory[tf] && updatedHistory[tf].length > 0) {
      const updatedList = [...updatedHistory[tf]];
      // Update the final current index values with the live ticking price
      updatedList[updatedList.length - 1] = {
        ...updatedList[updatedList.length - 1],
        value: parseFloat(nextPrice.toFixed(2))
      };
      updatedHistory[tf] = updatedList;
    }
  });
  return updatedHistory;
}

/**
 * React Hook useMarketData
 * Wraps market data query via TanStack Query with standard-compliant caching rules.
 */
export function useMarketData() {
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['marketData'],
    queryFn: fetchMarketData,
    staleTime: 10000,        // Data considered fresh for 10 seconds
    refetchInterval: 15000,  // Background refetch every 15 seconds
    refetchOnWindowFocus: true, // Handle tab-switches and background syncing automatically
  });

  return {
    marketData: data || marketOverview,
    isLoading,
    isError,
    refetch,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : new Date()
  };
}

export default useMarketData;
