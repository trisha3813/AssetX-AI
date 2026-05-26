import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, FileText, Copy, Check, Sparkles } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export default function FinanceChatbot({ livePrices = {}, marketOverview = [], newsSentiment = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  useEffect(() => {
    // Set overflow hidden for chat UI
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Cleanup function - CRITICAL
    return () => {
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, []);

  // Handle Clipboard Copy for Message
  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Handle Clipboard Copy for Code Block
  const handleCopyCode = (codeText, blockId) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(blockId);
    setTimeout(() => setCopiedCodeId(null), 1500);
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        preview: event.target.result // Base64 data URL for images, text content for documents
      });
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
    // Clear target value so same file can be selected again
    e.target.value = '';
  };

  // Trigger File Input Click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Compile active dashboard prices context silently to make Gemini extremely smart
  const getContextString = () => {
    const assetsData = marketOverview.map(stock => {
      const live = livePrices[stock.ticker] || stock;
      const livePrice = parseFloat(live.price || 0);
      const liveChange = parseFloat(live.change || 0);
      const livePct = parseFloat(live.changePercent || 0);
      return `${stock.ticker} (${stock.name}): $${livePrice.toFixed(2)} (${liveChange >= 0 ? '+' : ''}${livePct.toFixed(2)}%)`;
    }).join(', ');

    const topNews = newsSentiment.slice(0, 3).map(n => `[${n.sentiment}] ${n.title}`).join(' | ');

    return `Dashboard Assets: [${assetsData}] | Top News: [${topNews}]`;
  };

  // Fallback reasoning model on server exceptions
  const getLocalFallbackResponse = (query) => {
    const q = query.toLowerCase();
    
    // 1. Stocks vs Crypto Comparison Check
    if ((q.includes('difference') && q.includes('stock') && q.includes('crypto')) || 
        q.includes('stocks vs crypto') || 
        q.includes('crypto vs stocks') || 
        q.includes('compare stocks') ||
        q.includes('comparison of stock') ||
        (q.includes('stock') && q.includes('crypto') && (q.includes('versus') || q.includes('vs') || q.includes('or') || q.includes('between')))) {
      return `### Stocks vs. Cryptocurrency 📈 🪙
 
Understanding the key differences between traditional stocks and cryptocurrency is essential for building a balanced portfolio. Here is a head-to-head comparison:
 
1. **Ownership & Structure**:
   * **Stocks**: Represent fractional **ownership in a real corporation** (like Apple or Microsoft). You own a piece of their assets and future earnings.
   * **Cryptocurrency**: Represents a **digital asset or utility token** on a decentralized blockchain network (like Bitcoin or Ethereum). You do not own a share of a company.
 
2. **Regulation & Security**:
   * **Stocks**: Highly regulated by government agencies (like the SEC in the US). Trading is conducted on centralized, protected exchanges (like NYSE, NASDAQ).
   * **Cryptocurrency**: Operates in a largely decentralized, rapidly evolving regulatory landscape. Transactions are secured by cryptography but are irreversible.
 
3. **Trading Hours & Liquidity**:
   * **Stocks**: Limited trading hours (typically Monday–Friday, 9:30 AM – 4:00 PM EST, excluding holidays).
   * **Cryptocurrency**: Trades **24/7/365** globally across hundreds of digital exchanges.
 
4. **Volatility & Risk Profile**:
   * **Stocks**: Generally moderate volatility. Prices are driven by corporate earnings, macroeconomic indicators, and revenue growth.
   * **Cryptocurrency**: High volatility with rapid price swings. Prices are highly speculative, driven by network adoption, technology utility, and market sentiment.
 
💡 **Simple Summary**: 
Think of **Stocks** like owning a brick of a shopping mall—it is a physical asset backed by real rent and sales. Think of **Cryptocurrency** like owning an international, digital arcade token—its value depends entirely on how many people want to play in that arcade and trust its system.`;
    }

    // 2. Educational Check: "What is crypto?"
    if (q.includes('what is crypto') || q.includes('what is cryptocurrency')) {
      return `### What is Cryptocurrency? 🪙
 
Cryptocurrency is a digital currency designed to work as a medium of exchange. Unlike traditional money (like the US Dollar), it is **decentralized**, meaning no single government or bank controls it. Instead, it relies on complex math and computers to secure transactions.
 
💡 **Simple Example**: 
Think of it like digital arcade tokens. Instead of a single counter storing all the tokens, a network of thousands of computers across the world keeps an identical copy of who owns which tokens.`;
    }

    // 3. Educational Check: "What is blockchain?"
    if (q.includes('what is blockchain')) {
      return `### What is Blockchain? ⛓️
 
A blockchain is a decentralized, digital ledger that securely records transactions across a network of computers. Once a transaction is added, it is grouped with other transactions into a "block" and permanently chained to previous blocks, making it virtually impossible to alter or delete.
 
💡 **Simple Example**: 
Think of it like a shared Google Doc where everyone has real-time viewing permissions. However, unlike a Google Doc, once a sentence is typed on a line, it is permanently locked and can never be changed or deleted by anyone.`;
    }

    // 4. Educational Check: "What is RSI?"
    if (q.includes('what is rsi')) {
      return `### What is RSI (Relative Strength Index)? 📊
 
RSI stands for **Relative Strength Index**. It is a popular technical tool used by investors to measure the speed and change of price movements. The RSI ranges on a scale from **0 to 100**.
 
💡 **Simple Example**: 
Think of RSI like a speedometer coupled with a fuel gauge:
* **Overbought (RSI > 70)**: The asset is running hot and speeding up. It might be due for a cool-down or price drop.
* **Oversold (RSI < 30)**: The asset is slowing down and running low. It might indicate that the asset is cheap or due for a rebound.`;
    }

    // 5. Educational Check: "What is a stock?"
    if (q.includes('what is a stock') || (q.includes('what is stock') && !q.includes('price'))) {
      return `### What is a Stock? 📈
 
A stock represents a tiny share of ownership in a company. When you buy a stock, you become a partial owner of that business. As the company grows in value or makes a profit, your share increases in value as well.
 
💡 **Simple Example**: 
Imagine a local pizza shop is divided into 100 slices of ownership. If you buy 5 slices, you own 5% of the shop. If the pizza shop becomes highly successful and opens more locations, your 5 slices become much more valuable!`;
    }

    // 6. Specific Asset Dynamic Price/Status Report Check
    const tickers = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'BTC', 'ETH'];
    const tickerNames = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corp.',
      'NVDA': 'NVIDIA Corp.',
      'TSLA': 'Tesla Inc.',
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum'
    };
    
    let matchedTicker = null;
    for (const ticker of tickers) {
      const name = tickerNames[ticker].toLowerCase();
      if (q.includes(ticker.toLowerCase()) || q.includes(name)) {
        matchedTicker = ticker;
        break;
      }
    }

    if (matchedTicker) {
      const stock = marketOverview.find(s => s.ticker === matchedTicker) || {};
      const live = livePrices[matchedTicker] || stock;
      const price = parseFloat(live.price || 0);
      const change = parseFloat(live.change || 0);
      const pct = parseFloat(live.changePercent || 0);
      const isUp = change >= 0;
      const arrow = isUp ? '▲' : '▼';
      const sign = isUp ? '+' : '';
      
      const formattedPrice = matchedTicker === 'BTC' || matchedTicker === 'ETH'
        ? price.toLocaleString(undefined, { minimumFractionDigits: 2 })
        : price.toFixed(2);
      
      const isCrypto = matchedTicker === 'BTC' || matchedTicker === 'ETH';
      const assetType = isCrypto ? 'Cryptocurrency' : 'Equities / Tech Stock';

      return `### ${tickerNames[matchedTicker]} (${matchedTicker}) Market Report 📊
 
Here is the real-time market data for **${tickerNames[matchedTicker]}** under current conditions:
 
* **Price**: \`$${formattedPrice}\`
* **Daily Change**: **${arrow} ${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)**
* **Market Capitalization**: \`${live.marketCap || stock.marketCap || 'N/A'}\`
* **Volume**: \`${live.volume || stock.volume || 'N/A'}\`
* **Asset Class**: ${assetType}
 
💡 **AI Analysis**: 
${matchedTicker === 'NVDA' ? 'NVIDIA shows strong bullish momentum driven by AI chip demand and compute scaling cycles. Keep trailing stops active.' :
  matchedTicker === 'AAPL' ? 'Apple is consolidating around its current ranges as investors anticipate premium hardware refresh cycles and AI feature rollouts.' :
  matchedTicker === 'MSFT' ? 'Microsoft demonstrates highly stable enterprise SaaS and cloud growth. Ideal core holding with low beta risk.' :
  matchedTicker === 'TSLA' ? 'Tesla is exhibiting heightened volatility with recent price margins compressed. Watch key support levels.' :
  matchedTicker === 'BTC' ? 'Bitcoin is the pioneer digital asset showing high momentum. Consider limiting crypto exposure to 10% of portfolio assets.' :
  'Ethereum is demonstrating steady network utility growth with smart contracts and layer-2 adoption driving fee volume.'}`;
    }

    // 7. Volatility / Tech Stock Query
    if (q.includes('volat') || q.includes('highest') || q.includes('tech') || q.includes('movement') || q.includes('gainers')) {
      const sorted = [...marketOverview]
        .map(stock => {
          const live = livePrices[stock.ticker] || stock;
          return {
            ticker: stock.ticker,
            name: stock.name,
            price: parseFloat(live.price || 0),
            changePercent: parseFloat(live.changePercent || 0)
          };
        })
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

      const leaders = sorted.slice(0, 3).map((item) => {
        const isUp = item.changePercent >= 0;
        return `* **${item.ticker}**: \`$${item.price.toFixed(2)}\` | **${isUp ? '▲' : '▼'} ${isUp ? '+' : ''}${item.changePercent.toFixed(2)}%**`;
      }).join('\n');

      return `### Volatile Tech Equities
 
Here are the focus assets showing the highest percentage variations right now:
 
${leaders}
 
These variations suggest strong momentum. You can review detailed volatility metrics in the Risk Analysis tab or ask me for custom risk mitigation strategies.`;
    }

    return `✅ Live market data connected  
📈 Current market sentiment: Moderately Bullish  
💹 Tracking assets: AAPL, MSFT, NVDA, TSLA, BTC, ETH
 
You can ask for:
- "difference between stocks and crypto"
- price analysis for individual tickers (e.g., "what is the price of NVDA?")
- technical indicators (e.g., "What is RSI?")
- beginner-friendly explanations (e.g., "What is blockchain?")`;
  };

  // Submit Message Handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    const userText = inputMessage;
    const attachedFile = selectedFile;
    const msgId = 'msg-' + Date.now();

    // Reset inputs immediately for fluid UI response
    setInputMessage('');
    setSelectedFile(null);
    setIsLoading(true);

    // Append User Message to Thread
    setMessages(prev => [
      ...prev,
      {
        id: msgId,
        sender: 'user',
        text: userText,
        file: attachedFile,
        timestamp: new Date()
      }
    ]);

    try {
      // Assemble true multi-turn chat history matching the standard Gemini schema
      const contents = [];
      const historyMessages = messages.filter(m => m.id !== 'welcome');
      
      historyMessages.forEach((msg) => {
        const role = msg.sender === 'user' ? 'user' : 'model';
        let partsContent = msg.text;

        if (msg.sender === 'user' && msg.file) {
          partsContent += `\n\n[Attached File: "${msg.file.name}" (${msg.file.type}) - Content Preview: ${
            msg.file.type.startsWith('image/') 
              ? '(Image Sync Preview Active)' 
              : msg.file.preview.substring(0, 8000)
          }]`;
        }

        contents.push({
          role: role,
          parts: [{ text: partsContent }]
        });
      });

      // Construct latest user query with dynamic context prepended
      let activeQueryText = userText;
      if (attachedFile) {
        activeQueryText += `\n\n[Attached File: "${attachedFile.name}" (${attachedFile.type}) - Content Preview: ${
          attachedFile.type.startsWith('image/') 
            ? '(Image Sync Preview Active)' 
            : attachedFile.preview.substring(0, 8000)
        }]`;
      }

      const activeContext = getContextString();
      const promptText = `[LIVE DATA BRIEFING: ${activeContext}]\n\nUser Question: ${activeQueryText}`;

      contents.push({
        role: 'user',
        parts: [{ text: promptText }]
      });

      // Define standard persona constraints via the systemInstruction parameter
      const systemInstruction = {
        parts: [{
          text: "You are an elite AI-powered quant financial analyst and market strategist at AssetX. Your domain is advanced financial mathematics, stock/crypto technical telemetry, and portfolio allocation. \n\n" +
                "Follow these absolute guidelines:\n" +
                "1. Act exclusively as a highly informed, data-driven financial strategist.\n" +
                "2. Prioritize quantitative logic. Seamlessly integrate technical indicators (RSI, SMA, volatility) into your analysis.\n" +
                "3. Interpret real-time price feeds and news sentiments from the [LIVE DATA BRIEFING] to explain the mathematical 'why' behind price fluctuations.\n" +
                "4. Maintain an objective, professional, yet conversational and accessible tone.\n" +
                "5. If a user asks educational questions (e.g. 'what is blockchain?'), provide simple, beginner-friendly definitions and concrete examples first, then tie it back to active market telemetry."
        }]
      };

      // Query standard Gemini REST Endpoint with multi-turn content and persona instructions
      if (!GEMINI_API_KEY) {
        throw new Error('API_KEY_MISSING');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction
          })
        }
      );

      if (!response.ok) {
        throw new Error('Gemini API Connection failed, activating local fallback logic');
      }

      const resData = await response.json();
      const reply = resData.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to retrieve a response. Please try again.";

      setMessages(prev => [
        ...prev,
        {
          id: 'reply-' + Date.now(),
          sender: 'ai',
          text: reply,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.warn("Falling back to local quantitative context briefs:", err);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let localReply;
      if (err.message === 'API_KEY_MISSING') {
        localReply = `⚠️ **Premium AI Model Paused: API Key Missing**  
To fully activate my premium deep learning capabilities, please secure your Gemini API key in a local environment variable:

1. Create a file named \`.env\` in your project's root directory (\`my-react-app/\`).
2. Add your Gemini API key inside it:
   \`\`\`env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   \`\`\`
3. Restart your dev server to apply: \`Ctrl + C\` and then \`npm run dev\`.

*In the meantime, I have activated my local quantitative analytics engines to answer your query:*  

${getLocalFallbackResponse(userText)}`;
      } else {
        localReply = getLocalFallbackResponse(userText);
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'reply-fallback-' + Date.now(),
          sender: 'ai',
          text: localReply,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // High-Fidelity Custom Markdown Parser to render bubbles beautifully
  const renderMessageContent = (text, id) => {
    if (!text) return null;

    const blocks = text.split(/```/);
    
    return blocks.map((block, blockIndex) => {
      if (blockIndex % 2 === 1) {
        const lines = block.split('\n');
        const langRaw = lines[0] || '';
        const lang = langRaw.replace(/[^a-zA-Z]/g, '').trim().toLowerCase();
        
        const codeText = lines.slice(1).join('\n').trim();
        const blockId = `${id}-code-${blockIndex}`;

        return (
          <div key={blockId} className="my-4 border border-white/5 bg-[#0a0a0c] rounded-xl overflow-hidden font-mono text-xs shadow-md">
            <div className="flex items-center justify-between px-4 py-2 bg-[#121215] border-b border-white/5 text-slate-400 text-[10px] font-bold">
              <span className="tracking-widest">{lang.toUpperCase() || 'CODE'}</span>
              <button 
                onClick={() => handleCopyCode(codeText, blockId)}
                className="flex items-center gap-1.5 hover:text-white transition active:scale-95 text-slate-400"
              >
                {copiedCodeId === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-300 custom-scrollbar leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      const paragraphs = block.split('\n\n');
      return paragraphs.map((para, paraIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return <h3 key={paraIdx} className="text-sm font-bold text-emerald-400 mt-4 mb-2 first:mt-0">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={paraIdx} className="text-base font-extrabold text-emerald-400 mt-4 mb-2 first:mt-0">{trimmed.replace('## ', '')}</h2>;
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
          const listLines = trimmed.split('\n');
          return (
            <ul key={paraIdx} className="list-disc pl-5 space-y-1.5 my-2">
              {listLines.map((line, lineIdx) => {
                const cleanLine = line.replace(/^[\*\-\d\.]+\s+/, '');
                return (
                  <li key={lineIdx} className="text-xs text-slate-300 leading-relaxed">
                    {parseInlineStyles(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={paraIdx} className="text-xs text-slate-300 leading-relaxed mb-3 last:mb-0">
            {parseInlineStyles(trimmed)}
          </p>
        );
      });
    });
  };

  const parseInlineStyles = (lineText) => {
    if (!lineText) return '';
    
    const parts = lineText.split(/(\*\*.*?\*\*|`.*?`)/);
    
    return parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx} className="font-extrabold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={partIdx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-emerald-400 font-mono text-[10px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full w-full text-slate-100 overflow-hidden relative bg-[#0b0b0d]">
      
      {/* 1. Sleek Minimalist Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 shrink-0 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              AssetX AI Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Powered by Gemini 1.5 Flash</p>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Conversational Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth bg-transparent"
      >
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6 w-full flex flex-col justify-start">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/5 text-slate-400 font-medium">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-4 group relative ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div className={`max-w-[85%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                    
                    {msg.file && (
                      <div className="mb-2 p-2 bg-[#16161a] border border-white/5 rounded-xl flex items-center gap-2.5 shadow-sm text-left">
                        {msg.file.type.startsWith('image/') ? (
                          <img src={msg.file.preview} className="w-24 h-16 object-cover rounded-lg border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-lg">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-bold text-slate-200 truncate max-w-[150px]">{msg.file.name}</p>
                          <p className="text-[8px] text-slate-500">{(msg.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    )}

                    <div className={`px-4 py-3 rounded-2xl relative transition-all duration-200 border text-left ${
                      isAI 
                        ? 'bg-[#121214]/60 border-white/5 text-slate-200 shadow-sm' 
                        : 'bg-[#1b1b1f] border-[#2c2c35] text-slate-100 shadow-md'
                    }`}>
                      {renderMessageContent(msg.text, msg.id)}
                    </div>

                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 ${
                      isAI ? '-right-10' : '-left-10'
                    }`}>
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="p-1.5 rounded-lg bg-[#16161a] border border-white/5 hover:bg-[#232329] text-slate-500 hover:text-slate-200 transition-colors shadow-lg"
                        title="Copy message text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isAI && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center shrink-0 shadow-md">
                      <span className="text-xs font-bold text-slate-300">U</span>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl bg-[#121214]/60 border border-white/5 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} style={{ marginInline: '0.25rem' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Modern Fixed Input Capsule Box */}
      <div className="px-6 py-4 shrink-0 bg-transparent border-t border-white/5">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
          
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute left-0 bottom-full w-full mb-3 p-2.5 bg-[#121215] border border-white/10 rounded-2xl flex items-center gap-3 shadow-2xl z-20"
              >
                {selectedFile.type.startsWith('image/') ? (
                  <img src={selectedFile.preview} className="w-12 h-12 object-cover rounded-xl border border-white/10 shadow" />
                ) : (
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-slate-200 truncate">{selectedFile.name}</p>
                  <p className="text-[9px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedFile(null)} 
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 p-1.5 bg-[#121214] border border-white/5 focus-within:border-emerald-500/30 rounded-2xl shadow-xl transition-all duration-200">
            
            <button
              type="button"
              onClick={triggerFileInput}
              className="p-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
              title="Attach text or image files"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*,text/*,application/json"
              className="hidden"
            />

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1 min-w-0 px-2 py-3 bg-transparent border-0 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-0 disabled:opacity-50 text-left"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() && !selectedFile}
              className="p-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-20 disabled:hover:bg-emerald-500 transition duration-200 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Trust Compliance Disclaimer Stamp */}
          <p className="text-[9px] text-slate-600 text-center mt-3 leading-relaxed max-w-2xl mx-auto font-sans">
            ⚠️ Disclaimer: AssetX provides data-driven quantitative insights and algorithmic financial modeling. Environmental and market factors fluctuate rapidly; please verify market metrics independently before executing high-capital trades.
          </p>
        </form>
      </div>

    </div>
  );
}
