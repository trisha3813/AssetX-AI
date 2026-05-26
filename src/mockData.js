// High-fidelity Mock Data for AI Investment Analytics Dashboard

// Stock/Crypto Market Tickers with comprehensive 30-day historical chart data
export const marketOverview = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 189.84,
    change: 1.42,
    changePercent: 0.75,
    marketCap: "2.98T",
    volume: "52.4M",
    peRatio: "29.4",
    dividendYield: "0.51%",
    sparkline: [186, 185, 187, 186, 188, 187, 189, 188, 189, 190, 188, 189.84],
    history: {
      "1D": [
        { time: "09:30 AM", value: 188.50 },
        { time: "10:30 AM", value: 188.20 },
        { time: "11:30 AM", value: 189.10 },
        { time: "12:30 PM", value: 188.90 },
        { time: "01:30 PM", value: 189.40 },
        { time: "02:30 PM", value: 189.30 },
        { time: "03:30 PM", value: 189.84 }
      ],
      "1W": [
        { time: "Mon", value: 185.40 },
        { time: "Tue", value: 186.20 },
        { time: "Wed", value: 185.90 },
        { time: "Thu", value: 187.30 },
        { time: "Fri", value: 189.84 }
      ],
      "1M": [
        { time: "Week 1", value: 180.20 },
        { time: "Week 2", value: 183.45 },
        { time: "Week 3", value: 182.10 },
        { time: "Week 4", value: 186.80 },
        { time: "Current", value: 189.84 }
      ],
      "3M": [
        { time: "Feb", value: 172.50 },
        { time: "Mar", value: 178.90 },
        { time: "Apr", value: 182.30 },
        { time: "May", value: 189.84 }
      ],
      "1Y": [
        { time: "Q1", value: 165.20 },
        { time: "Q2", value: 173.40 },
        { time: "Q3", value: 181.10 },
        { time: "Q4", value: 189.84 }
      ]
    }
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    price: 421.90,
    change: 5.32,
    changePercent: 1.28,
    marketCap: "3.14T",
    volume: "24.8M",
    peRatio: "35.8",
    dividendYield: "0.71%",
    sparkline: [412, 415, 414, 417, 416, 419, 418, 420, 422, 419, 421.90],
    history: {
      "1D": [
        { time: "09:30 AM", value: 416.80 },
        { time: "10:30 AM", value: 418.10 },
        { time: "11:30 AM", value: 417.90 },
        { time: "12:30 PM", value: 419.50 },
        { time: "01:30 PM", value: 420.30 },
        { time: "02:30 PM", value: 421.10 },
        { time: "03:30 PM", value: 421.90 }
      ],
      "1W": [
        { time: "Mon", value: 411.20 },
        { time: "Tue", value: 414.50 },
        { time: "Wed", value: 416.00 },
        { time: "Thu", value: 418.30 },
        { time: "Fri", value: 421.90 }
      ],
      "1M": [
        { time: "Week 1", value: 395.40 },
        { time: "Week 2", value: 402.10 },
        { time: "Week 3", value: 410.80 },
        { time: "Week 4", value: 417.50 },
        { time: "Current", value: 421.90 }
      ],
      "3M": [
        { time: "Feb", value: 388.90 },
        { time: "Mar", value: 401.20 },
        { time: "Apr", value: 415.60 },
        { time: "May", value: 421.90 }
      ],
      "1Y": [
        { time: "Q1", value: 330.50 },
        { time: "Q2", value: 362.40 },
        { time: "Q3", value: 398.10 },
        { time: "Q4", value: 421.90 }
      ]
    }
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    price: 948.12,
    change: 24.88,
    changePercent: 2.70,
    marketCap: "2.37T",
    volume: "68.2M",
    peRatio: "74.2",
    dividendYield: "0.02%",
    sparkline: [910, 922, 915, 930, 928, 935, 931, 940, 945, 942, 948.12],
    history: {
      "1D": [
        { time: "09:30 AM", value: 923.40 },
        { time: "10:30 AM", value: 928.10 },
        { time: "11:30 AM", value: 934.50 },
        { time: "12:30 PM", value: 931.20 },
        { time: "01:30 PM", value: 939.90 },
        { time: "02:30 PM", value: 945.00 },
        { time: "03:30 PM", value: 948.12 }
      ],
      "1W": [
        { time: "Mon", value: 902.50 },
        { time: "Tue", value: 915.20 },
        { time: "Wed", value: 922.80 },
        { time: "Thu", value: 931.00 },
        { time: "Fri", value: 948.12 }
      ],
      "1M": [
        { time: "Week 1", value: 840.20 },
        { time: "Week 2", value: 875.90 },
        { time: "Week 3", value: 899.40 },
        { time: "Week 4", value: 912.80 },
        { time: "Current", value: 948.12 }
      ],
      "3M": [
        { time: "Feb", value: 720.50 },
        { time: "Mar", value: 812.30 },
        { time: "Apr", value: 875.90 },
        { time: "May", value: 948.12 }
      ],
      "1Y": [
        { time: "Q1", value: 310.20 },
        { time: "Q2", value: 480.50 },
        { time: "Q3", value: 690.40 },
        { time: "Q4", value: 948.12 }
      ]
    }
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    price: 175.46,
    change: -3.20,
    changePercent: -1.79,
    marketCap: "558.2B",
    volume: "82.5M",
    peRatio: "42.1",
    dividendYield: "N/A",
    sparkline: [184, 182, 180, 178, 179, 176, 178, 175, 177, 174, 175.46],
    history: {
      "1D": [
        { time: "09:30 AM", value: 178.90 },
        { time: "10:30 AM", value: 177.20 },
        { time: "11:30 AM", value: 176.40 },
        { time: "12:30 PM", value: 177.10 },
        { time: "01:30 PM", value: 175.80 },
        { time: "02:30 PM", value: 174.90 },
        { time: "03:30 PM", value: 175.46 }
      ],
      "1W": [
        { time: "Mon", value: 182.40 },
        { time: "Tue", value: 181.10 },
        { time: "Wed", value: 179.30 },
        { time: "Thu", value: 178.00 },
        { time: "Fri", value: 175.46 }
      ],
      "1M": [
        { time: "Week 1", value: 168.20 },
        { time: "Week 2", value: 174.90 },
        { time: "Week 3", value: 185.10 },
        { time: "Week 4", value: 180.50 },
        { time: "Current", value: 175.46 }
      ],
      "3M": [
        { time: "Feb", value: 195.40 },
        { time: "Mar", value: 188.20 },
        { time: "Apr", value: 170.90 },
        { time: "May", value: 175.46 }
      ],
      "1Y": [
        { time: "Q1", value: 248.50 },
        { time: "Q2", value: 220.30 },
        { time: "Q3", value: 205.10 },
        { time: "Q4", value: 175.46 }
      ]
    }
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    price: 67240.50,
    change: 1240.50,
    changePercent: 1.88,
    marketCap: "1.32T",
    volume: "35.1B",
    peRatio: "N/A",
    dividendYield: "N/A",
    sparkline: [65200, 65500, 66100, 65800, 66300, 66800, 66400, 67000, 67240.50],
    history: {
      "1D": [
        { time: "09:30 AM", value: 65980 },
        { time: "10:30 AM", value: 66200 },
        { time: "11:30 AM", value: 66150 },
        { time: "12:30 PM", value: 66540 },
        { time: "01:30 PM", value: 66820 },
        { time: "02:30 PM", value: 66950 },
        { time: "03:30 PM", value: 67240.50 }
      ],
      "1W": [
        { time: "Mon", value: 64100 },
        { time: "Tue", value: 64900 },
        { time: "Wed", value: 65300 },
        { time: "Thu", value: 66050 },
        { time: "Fri", value: 67240.50 }
      ],
      "1M": [
        { time: "Week 1", value: 60500 },
        { time: "Week 2", value: 62400 },
        { time: "Week 3", value: 64800 },
        { time: "Week 4", value: 66100 },
        { time: "Current", value: 67240.50 }
      ],
      "3M": [
        { time: "Feb", value: 52100 },
        { time: "Mar", value: 68400 },
        { time: "Apr", value: 63900 },
        { time: "May", value: 67240.50 }
      ],
      "1Y": [
        { time: "Q1", value: 27500 },
        { time: "Q2", value: 31200 },
        { time: "Q3", value: 42500 },
        { time: "Q4", value: 67240.50 }
      ]
    }
  },
  {
    ticker: "ETH",
    name: "Ethereum",
    price: 3450.75,
    change: 82.20,
    changePercent: 2.44,
    marketCap: "414.2B",
    volume: "18.4B",
    peRatio: "N/A",
    dividendYield: "N/A",
    sparkline: [3320, 3350, 3380, 3360, 3410, 3430, 3450.75],
    history: {
      "1D": [
        { time: "09:30 AM", value: 3368.50 },
        { time: "10:30 AM", value: 3380.20 },
        { time: "11:30 AM", value: 3392.10 },
        { time: "12:30 PM", value: 3415.80 },
        { time: "01:30 PM", value: 3422.30 },
        { time: "02:30 PM", value: 3439.10 },
        { time: "03:30 PM", value: 3450.75 }
      ],
      "1W": [
        { time: "Mon", value: 3290.40 },
        { time: "Tue", value: 3320.10 },
        { time: "Wed", value: 3354.30 },
        { time: "Thu", value: 3389.00 },
        { time: "Fri", value: 3450.75 }
      ],
      "1M": [
        { time: "Week 1", value: 3120.20 },
        { time: "Week 2", value: 3240.50 },
        { time: "Week 3", value: 3315.80 },
        { time: "Week 4", value: 3390.10 },
        { time: "Current", value: 3450.75 }
      ],
      "3M": [
        { time: "Feb", value: 2890.50 },
        { time: "Mar", value: 3512.40 },
        { time: "Apr", value: 3218.90 },
        { time: "May", value: 3450.75 }
      ],
      "1Y": [
        { time: "Q1", value: 1720.50 },
        { time: "Q2", value: 1890.30 },
        { time: "Q3", value: 2240.10 },
        { time: "Q4", value: 3450.75 }
      ]
    }
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 172.48,
    change: 2.18,
    changePercent: 1.28,
    marketCap: "2.15T",
    volume: "19.5M",
    peRatio: "25.8",
    dividendYield: "0.46%",
    sparkline: [168, 169, 171, 170, 172, 171, 172.48],
    history: {
      "1D": [
        { time: "09:30 AM", value: 170.30 },
        { time: "10:30 AM", value: 170.80 },
        { time: "11:30 AM", value: 171.20 },
        { time: "12:30 PM", value: 171.10 },
        { time: "01:30 PM", value: 171.90 },
        { time: "02:30 PM", value: 172.10 },
        { time: "03:30 PM", value: 172.48 }
      ],
      "1W": [
        { time: "Mon", value: 167.40 },
        { time: "Tue", value: 168.90 },
        { time: "Wed", value: 169.50 },
        { time: "Thu", value: 171.20 },
        { time: "Fri", value: 172.48 }
      ],
      "1M": [
        { time: "Week 1", value: 156.40 },
        { time: "Week 2", value: 162.10 },
        { time: "Week 3", value: 165.80 },
        { time: "Week 4", value: 170.20 },
        { time: "Current", value: 172.48 }
      ],
      "3M": [
        { time: "Feb", value: 142.50 },
        { time: "Mar", value: 151.90 },
        { time: "Apr", value: 164.20 },
        { time: "May", value: 172.48 }
      ],
      "1Y": [
        { time: "Q1", value: 112.50 },
        { time: "Q2", value: 122.40 },
        { time: "Q3", value: 141.10 },
        { time: "Q4", value: 172.48 }
      ]
    }
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    price: 468.24,
    change: -4.32,
    changePercent: -0.91,
    marketCap: "1.19T",
    volume: "16.8M",
    peRatio: "24.2",
    dividendYield: "0.43%",
    sparkline: [475, 472, 470, 468, 469, 467, 468.24],
    history: {
      "1D": [
        { time: "09:30 AM", value: 472.50 },
        { time: "10:30 AM", value: 471.10 },
        { time: "11:30 AM", value: 470.30 },
        { time: "12:30 PM", value: 469.80 },
        { time: "01:30 PM", value: 469.20 },
        { time: "02:30 PM", value: 468.10 },
        { time: "03:30 PM", value: 468.24 }
      ],
      "1W": [
        { time: "Mon", value: 475.20 },
        { time: "Tue", value: 474.10 },
        { time: "Wed", value: 472.80 },
        { time: "Thu", value: 470.50 },
        { time: "Fri", value: 468.24 }
      ],
      "1M": [
        { time: "Week 1", value: 482.40 },
        { time: "Week 2", value: 478.10 },
        { time: "Week 3", value: 475.80 },
        { time: "Week 4", value: 471.20 },
        { time: "Current", value: 468.24 }
      ],
      "3M": [
        { time: "Feb", value: 454.50 },
        { time: "Mar", value: 492.10 },
        { time: "Apr", value: 481.30 },
        { time: "May", value: 468.24 }
      ],
      "1Y": [
        { time: "Q1", value: 242.10 },
        { time: "Q2", value: 298.50 },
        { time: "Q3", value: 354.20 },
        { time: "Q4", value: 468.24 }
      ]
    }
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    price: 180.22,
    change: -1.45,
    changePercent: -0.80,
    marketCap: "1.87T",
    volume: "38.1M",
    peRatio: "62.4",
    dividendYield: "N/A",
    sparkline: [181, 183, 182, 180, 182, 184, 183, 179, 181, 180.22],
    history: {
      "1D": [
        { time: "09:30 AM", value: 181.50 },
        { time: "10:30 AM", value: 180.90 },
        { time: "11:30 AM", value: 181.20 },
        { time: "12:30 PM", value: 180.40 },
        { time: "01:30 PM", value: 179.80 },
        { time: "02:30 PM", value: 179.50 },
        { time: "03:30 PM", value: 180.22 }
      ],
      "1W": [
        { time: "Mon", value: 182.10 },
        { time: "Tue", value: 183.40 },
        { time: "Wed", value: 182.20 },
        { time: "Thu", value: 181.50 },
        { time: "Fri", value: 180.22 }
      ],
      "1M": [
        { time: "Week 1", value: 175.40 },
        { time: "Week 2", value: 178.10 },
        { time: "Week 3", value: 184.50 },
        { time: "Week 4", value: 182.10 },
        { time: "Current", value: 180.22 }
      ],
      "3M": [
        { time: "Feb", value: 169.50 },
        { time: "Mar", value: 175.20 },
        { time: "Apr", value: 179.40 },
        { time: "May", value: 180.22 }
      ],
      "1Y": [
        { time: "Q1", value: 102.40 },
        { time: "Q2", value: 125.10 },
        { time: "Q3", value: 154.60 },
        { time: "Q4", value: 180.22 }
      ]
    }
  },
  {
    ticker: "NFLX",
    name: "Netflix Inc.",
    price: 610.45,
    change: 12.30,
    changePercent: 2.06,
    marketCap: "263.8B",
    volume: "4.2M",
    peRatio: "41.8",
    dividendYield: "N/A",
    sparkline: [595, 600, 602, 608, 605, 610, 610.45],
    history: {
      "1D": [
        { time: "09:30 AM", value: 598.10 },
        { time: "10:30 AM", value: 601.20 },
        { time: "11:30 AM", value: 600.40 },
        { time: "12:30 PM", value: 604.80 },
        { time: "01:30 PM", value: 606.30 },
        { time: "02:30 PM", value: 608.90 },
        { time: "03:30 PM", value: 610.45 }
      ],
      "1W": [
        { time: "Mon", value: 590.20 },
        { time: "Tue", value: 594.10 },
        { time: "Wed", value: 598.80 },
        { time: "Thu", value: 602.50 },
        { time: "Fri", value: 610.45 }
      ],
      "1M": [
        { time: "Week 1", value: 574.50 },
        { time: "Week 2", value: 581.20 },
        { time: "Week 3", value: 592.80 },
        { time: "Week 4", value: 601.40 },
        { time: "Current", value: 610.45 }
      ],
      "3M": [
        { time: "Feb", value: 554.50 },
        { time: "Mar", value: 588.30 },
        { time: "Apr", value: 601.20 },
        { time: "May", value: 610.45 }
      ],
      "1Y": [
        { time: "Q1", value: 340.50 },
        { time: "Q2", value: 395.20 },
        { time: "Q3", value: 480.10 },
        { time: "Q4", value: 610.45 }
      ]
    }
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    price: 164.80,
    change: 3.40,
    changePercent: 2.11,
    marketCap: "266.4B",
    volume: "42.5M",
    peRatio: "68.4",
    dividendYield: "N/A",
    sparkline: [158, 160, 161, 159, 163, 162, 164.80],
    history: {
      "1D": [
        { time: "09:30 AM", value: 160.20 },
        { time: "10:30 AM", value: 161.40 },
        { time: "11:30 AM", value: 160.90 },
        { time: "12:30 PM", value: 162.80 },
        { time: "01:30 PM", value: 163.10 },
        { time: "02:30 PM", value: 163.90 },
        { time: "03:30 PM", value: 164.80 }
      ],
      "1W": [
        { time: "Mon", value: 157.40 },
        { time: "Tue", value: 159.20 },
        { time: "Wed", value: 158.80 },
        { time: "Thu", value: 161.50 },
        { time: "Fri", value: 164.80 }
      ],
      "1M": [
        { time: "Week 1", value: 172.50 },
        { time: "Week 2", value: 168.10 },
        { time: "Week 3", value: 165.20 },
        { time: "Week 4", value: 163.40 },
        { time: "Current", value: 164.80 }
      ],
      "3M": [
        { time: "Feb", value: 178.50 },
        { time: "Mar", value: 191.20 },
        { time: "Apr", value: 170.40 },
        { time: "May", value: 164.80 }
      ],
      "1Y": [
        { time: "Q1", value: 92.50 },
        { time: "Q2", value: 110.30 },
        { time: "Q3", value: 135.10 },
        { time: "Q4", value: 164.80 }
      ]
    }
  },
  {
    ticker: "SPY",
    name: "S&P 500 ETF Trust",
    price: 520.12,
    change: 2.42,
    changePercent: 0.47,
    marketCap: "512.4B",
    volume: "74.2M",
    peRatio: "21.4",
    dividendYield: "1.32%",
    sparkline: [516, 517, 519, 518, 520, 519, 520.12],
    history: {
      "1D": [
        { time: "09:30 AM", value: 517.90 },
        { time: "10:30 AM", value: 518.20 },
        { time: "11:30 AM", value: 518.10 },
        { time: "12:30 PM", value: 519.40 },
        { time: "01:30 PM", value: 519.30 },
        { time: "02:30 PM", value: 519.80 },
        { time: "03:30 PM", value: 520.12 }
      ],
      "1W": [
        { time: "Mon", value: 514.50 },
        { time: "Tue", value: 516.20 },
        { time: "Wed", value: 515.80 },
        { time: "Thu", value: 518.30 },
        { time: "Fri", value: 520.12 }
      ],
      "1M": [
        { time: "Week 1", value: 502.40 },
        { time: "Week 2", value: 508.10 },
        { time: "Week 3", value: 512.50 },
        { time: "Week 4", value: 516.90 },
        { time: "Current", value: 520.12 }
      ],
      "3M": [
        { time: "Feb", value: 489.50 },
        { time: "Mar", value: 508.30 },
        { time: "Apr", value: 511.20 },
        { time: "May", value: 520.12 }
      ],
      "1Y": [
        { time: "Q1", value: 412.50 },
        { time: "Q2", value: 440.20 },
        { time: "Q3", value: 482.10 },
        { time: "Q4", value: 520.12 }
      ]
    }
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Nasdaq 100",
    price: 442.50,
    change: 4.82,
    changePercent: 1.10,
    marketCap: "228.5B",
    volume: "45.1M",
    peRatio: "32.1",
    dividendYield: "0.58%",
    sparkline: [435, 437, 440, 438, 441, 440, 442.50],
    history: {
      "1D": [
        { time: "09:30 AM", value: 437.90 },
        { time: "10:30 AM", value: 438.40 },
        { time: "11:30 AM", value: 439.10 },
        { time: "12:30 PM", value: 440.80 },
        { time: "01:30 PM", value: 441.20 },
        { time: "02:30 PM", value: 441.90 },
        { time: "03:30 PM", value: 442.50 }
      ],
      "1W": [
        { time: "Mon", value: 432.40 },
        { time: "Tue", value: 435.10 },
        { time: "Wed", value: 434.90 },
        { time: "Thu", value: 438.00 },
        { time: "Fri", value: 442.50 }
      ],
      "1M": [
        { time: "Week 1", value: 418.50 },
        { time: "Week 2", value: 424.10 },
        { time: "Week 3", value: 431.80 },
        { time: "Week 4", value: 437.20 },
        { time: "Current", value: 442.50 }
      ],
      "3M": [
        { time: "Feb", value: 405.50 },
        { time: "Mar", value: 428.30 },
        { time: "Apr", value: 431.20 },
        { time: "May", value: 442.50 }
      ],
      "1Y": [
        { time: "Q1", value: 318.50 },
        { time: "Q2", value: 355.20 },
        { time: "Q3", value: 398.10 },
        { time: "Q4", value: 442.50 }
      ]
    }
  }
];

// Portfolio Overview and Historic Balance Tracker
export const portfolioData = {
  totalBalance: 142580.40,
  dayGain: +3340.22,
  dayGainPercent: +2.40,
  totalGain: +38120.50,
  totalGainPercent: +36.5,
  allocation: [
    { name: "Stocks", value: 65, color: "#10b981" },     // Emerald
    { name: "Crypto", value: 20, color: "#f59e0b" },     // Amber
    { name: "Cash", value: 10, color: "#14b8a6" },       // Teal
    { name: "Bonds", value: 5, color: "#6b7280" }        // Slate/Gray
  ],
  history: [
    { time: "Jan", balance: 104459.90 },
    { time: "Feb", balance: 112100.30 },
    { time: "Mar", balance: 121580.00 },
    { time: "Apr", balance: 132450.60 },
    { time: "May", balance: 142580.40 }
  ]
};

// Advanced AI Investment Recommendations
export const aiRecommendations = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    action: "STRONG BUY",
    confidence: 94,
    reason: "Generative AI cluster demand shows zero signs of decelerating. Q1 core processor shipments exceeded guidance. Hyper-scaler infrastructure CAPEX remains highly bullish.",
    targetPrice: 1100.00,
    currentPrice: 948.12,
    expectedGain: "+16.0%"
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    action: "BUY",
    confidence: 82,
    reason: "Stabilizing hardware cycles in APAC. AI integrations announced at WWDC are expected to trigger an unprecedented upgrade supercycle across premium tiers.",
    targetPrice: 215.00,
    currentPrice: 189.84,
    expectedGain: "+13.2%"
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    action: "HOLD",
    confidence: 58,
    reason: "Near-term margins impacted by competitive pricing pressures in the EV sector. FSD beta visual net iterations represent high potential, but structural catalysts remain remote.",
    targetPrice: 180.00,
    currentPrice: 175.46,
    expectedGain: "+2.5%"
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    action: "BUY",
    confidence: 89,
    reason: "AWS cloud margins expanding as enterprise workloads shift to optimization and model serving. Retail division operating income is reaching multi-year highs.",
    targetPrice: 210.00,
    currentPrice: 180.22,
    expectedGain: "+16.5%"
  }
];

// Portfolio Risk Analytics Models
export const riskMetrics = {
  portfolioBeta: 1.18,          // Slightly more volatile than SPY
  sharpeRatio: 2.14,            // Excellent risk-adjusted returns
  valueAtRiskPercent: 4.82,     // 95% confidence over 1 day
  maxDrawdown: -12.4,           // Historic drawdown
  sectorConcentration: [
    { sector: "Technology", weight: 48, rating: "High" },
    { sector: "Financials", weight: 15, rating: "Low" },
    { sector: "Digital Assets", weight: 20, rating: "Moderate" },
    { sector: "Energy & Materials", weight: 12, rating: "Low" },
    { sector: "Cash / Alternatives", weight: 5, rating: "Minimal" }
  ]
};

// Real-Time Sentiment Feeds
export const newsSentiment = [
  {
    title: "NVIDIA announces next-generation Blackwell Ultra architecture architecture chips",
    source: "Bloomberg Technology",
    time: "24m ago",
    sentiment: "BULLISH",
    score: 92,
    impact: "HIGH"
  },
  {
    title: "Federal Reserve hints at interest rates stabilization amid moderating CPI indexes",
    source: "Reuters Financial",
    time: "1h ago",
    sentiment: "BULLISH",
    score: 78,
    impact: "CRITICAL"
  },
  {
    title: "Apple WWDC highlights premium on-device LLM pipelines and secure cloud compute integrations",
    source: "TechCrunch",
    time: "3h ago",
    sentiment: "BULLISH",
    score: 85,
    impact: "HIGH"
  },
  {
    title: "Automated logistics systems upgrade accelerates fulfillment times for major online commerce",
    source: "The Wall Street Journal",
    time: "5h ago",
    sentiment: "BULLISH",
    score: 69,
    impact: "MODERATE"
  },
  {
    title: "Crypto assets experience leverage washout as liquidations trigger cascading long squeeze",
    source: "CoinDesk",
    time: "8h ago",
    sentiment: "BEARISH",
    score: 22,
    impact: "HIGH"
  }
];

// Initial Watchlist data
export const initialWatchlist = ["BTC", "AAPL", "NVDA"];
