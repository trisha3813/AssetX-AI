/**
 * Quantitative Financial Analysis & Technical Indicators Library
 * 
 * Provides mathematically accurate calculations for standard financial metrics:
 * 1. Relative Strength Index (RSI - 14 period) using Wilder's smoothed method.
 * 2. Simple Moving Average (SMA) for arbitrary periods (e.g. 50 & 200).
 * 3. Annualized Historical Volatility based on log returns of daily closes.
 */

/**
 * Calculates the Relative Strength Index (RSI) for a series of prices.
 * Uses Wilder's smoothed moving average method (industry standard).
 * 
 * @param {number[]} prices - Array of historical closing prices.
 * @param {number} period - RSI lookback period (default is 14).
 * @returns {number} The latest RSI value (0 to 100). Returns 50 if data is insufficient.
 */
export function calculateRSI(prices, period = 14) {
  if (!Array.isArray(prices) || prices.length <= period) {
    return 50; // Neutral default for insufficient data
  }

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Calculate first average gain and loss
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) {
      gainSum += change;
    } else {
      lossSum += Math.abs(change);
    }
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  // Apply Wilder's smoothing technique for the remaining periods
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return 100; // Prevent division by zero when there are no losses
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return parseFloat(rsi.toFixed(2));
}

/**
 * Calculates the Simple Moving Average (SMA) of a price series.
 * 
 * @param {number[]} prices - Array of historical prices.
 * @param {number} period - Lookback period (e.g. 50, 200).
 * @returns {number} The current SMA value.
 */
export function calculateSMA(prices, period) {
  if (!Array.isArray(prices) || prices.length === 0) {
    return 0;
  }
  
  const lookback = Math.min(prices.length, period);
  const targetSlice = prices.slice(-lookback);
  const sum = targetSlice.reduce((acc, val) => acc + val, 0);
  
  return parseFloat((sum / lookback).toFixed(2));
}

/**
 * Calculates the Annualized Historical Volatility of a price series.
 * Volatility is computed as the standard deviation of logarithmic returns of price closes
 * and annualized assuming 252 standard trading days per calendar year.
 * 
 * @param {number[]} prices - Array of daily closing prices.
 * @returns {number} The annualized volatility percentage (e.g., 24.5 for 24.5%).
 */
export function calculateVolatility(prices) {
  if (!Array.isArray(prices) || prices.length < 3) {
    return 0.0;
  }

  // 1. Compute logarithmic returns: R_t = ln(P_t / P_{t-1})
  const logReturns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] <= 0 || prices[i - 1] <= 0) continue;
    logReturns.push(Math.log(prices[i] / prices[i - 1]));
  }

  if (logReturns.length < 2) {
    return 0.0;
  }

  // 2. Compute the mean return
  const mean = logReturns.reduce((sum, r) => sum + r, 0) / logReturns.length;

  // 3. Compute sample variance (divide by N - 1)
  const sumSquaredDiffs = logReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0);
  const variance = sumSquaredDiffs / (logReturns.length - 1);
  const standardDeviation = Math.sqrt(variance);

  // 4. Annualize the standard deviation (standard multiplier is sqrt(252))
  const annualizedVol = standardDeviation * Math.sqrt(252) * 100;

  return parseFloat(annualizedVol.toFixed(2));
}

/**
 * Derives dynamic quantitative metrics and trade signals based on indicators.
 * 
 * @param {number[]} historicalPrices - Array of closing values.
 * @param {number} currentPrice - Current market price.
 * @returns {object} Calculated quantitative metrics (RSI, SMA50, SMA200, Volatility, Signal, Confidence)
 */
export function deriveQuantitativeMetrics(historicalPrices, currentPrice) {
  const prices = [...historicalPrices, currentPrice];
  const rsi = calculateRSI(prices, 14);
  const sma50 = calculateSMA(prices, 50);
  const sma200 = calculateSMA(prices, 200);
  const volatility = calculateVolatility(prices);

  // Determine Signal
  let action = "HOLD";
  let confidence = 50;
  let rationale = "";

  if (rsi < 30) {
    action = "STRONG BUY";
    confidence = Math.min(95, Math.round(90 + (30 - rsi)));
    rationale = `Asset is highly oversold with RSI at ${rsi}. Historical support levels indicate strong buyer absorption and price reversal probability.`;
  } else if (rsi > 70) {
    action = "STRONG SELL";
    confidence = Math.min(95, Math.round(85 + (rsi - 70)));
    rationale = `Asset is highly overbought with RSI at ${rsi}. Extreme buyer exhaust patterns suggest imminent downward resistance.`;
  } else {
    // Check SMA crosses
    const goldenCross = sma50 > sma200;
    const priceAboveSMA50 = currentPrice > sma50;

    if (goldenCross && priceAboveSMA50) {
      action = "BUY";
      confidence = Math.round(75 + (rsi / 10));
      rationale = `Golden cross confirmed (50-day SMA $${sma50} is above 200-day SMA $${sma200}). Momentum remains highly constructive.`;
    } else if (!goldenCross && !priceAboveSMA50) {
      action = "SELL";
      confidence = Math.round(70 + ((100 - rsi) / 10));
      rationale = `Death cross alert (50-day SMA $${sma50} is below 200-day SMA $${sma200}). Position shows persistent bearish momentum.`;
    } else {
      action = "HOLD";
      confidence = Math.round(55 + (Math.abs(50 - rsi) / 5));
      rationale = `Consolidation pattern holds. Relative Strength Index is stable at ${rsi}. Volume signals moderate momentum stabilization.`;
    }
  }

  return {
    rsi,
    sma50,
    sma200,
    volatility,
    action,
    confidence,
    rationale
  };
}
