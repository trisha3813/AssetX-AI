import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollHero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [images, setImages] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [hasScrolled, setHasScrolled] = useState(false);

  const totalFrames = 192;

  // Pre-load all 192 frames when component mounts
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      // Path maps perfectly to our public/images/herosection directory
      img.src = `/images/herosection/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        setLoadingProgress(Math.floor((loadedCount / totalFrames) * 100));
        
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        // Fallback or skip gracefully
        loadedCount++;
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
        }
      };

      loadedImages.push(img);
    }

    setImages(loadedImages);
  }, []);

  // Handle rendering of current frame on canvas
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    const img = images[frameIndex - 1];

    if (img && img.complete) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image centering it and scaling to fill canvas
      const imgWidth = img.width;
      const imgHeight = img.height;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      } else {
        drawHeight = canvasWidth / imgRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  };

  // Monitor scroll position and map it to frames
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container || !isLoaded) return;

      const rect = container.getBoundingClientRect();
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Scroll position relative to the container
      const scrollTop = -rect.top;
      const scrollMax = containerHeight - windowHeight;

      if (scrollTop > 50) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }

      // Calculate scroll progress (0 to 1)
      let progress = scrollTop / scrollMax;
      progress = Math.max(0, Math.min(1, progress));

      // Calculate corresponding frame index
      const frameIndex = Math.floor(progress * (totalFrames - 1)) + 1;
      setCurrentFrame(frameIndex);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Initial draw
    if (isLoaded) {
      drawFrame(1);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isLoaded, images]);

  // Update canvas when currentFrame changes
  useEffect(() => {
    if (isLoaded) {
      drawFrame(currentFrame);
    }
  }, [currentFrame, isLoaded]);

  // Adjust canvas size to parent width/height
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      if (isLoaded) {
        drawFrame(currentFrame);
      }
    };

    window.addEventListener('resize', handleResize);
    // Trigger initial sizing
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded, currentFrame]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[250vh] bg-black/90 text-white font-mono select-none"
    >
      {/* Sticky viewport content container */}
      <div className="sticky top-0 w-full h-screen flex flex-col justify-center items-center overflow-hidden">
        
        {/* Loading overlay panel */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-center items-center space-y-4"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-pulse" />
                <span className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-emerald-400 font-bold text-xs">{loadingProgress}%</span>
              </div>
              <h3 className="text-sm font-bold tracking-widest text-emerald-400 animate-pulse">PRE-LOADING ASSETX HERO CORE</h3>
              <p className="text-[10px] text-gray-500">OPTIMIZING IMAGE SEQUENCE FRAMES...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD grid overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient Top Spotlight */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header telemetry details */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
          <div className="text-left">
            <span className="text-[9px] text-emerald-400 font-bold tracking-widest block uppercase border border-emerald-500/30 px-1.5 py-0.5 rounded bg-emerald-500/5 w-fit">ACTIVE PROJECTION</span>
            <h2 className="text-xl font-bold tracking-widest mt-2 uppercase text-white">HERO SEQ CORE</h2>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block uppercase">FRAME INDEX</span>
            <span className="text-lg font-bold text-emerald-400 font-mono tracking-widest">
              {String(currentFrame).padStart(3, '0')} / {totalFrames}
            </span>
          </div>
        </div>

        {/* Central Display Screen */}
        <div className="relative w-[90%] max-w-4xl aspect-[16/9] rounded-2xl border border-white/10 bg-black/50 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.05)]">
          
          {/* Hardware-accelerated canvas player */}
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover" 
          />

          {/* Premium Gradient Scope masking to feather edges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl" />
        </div>

        {/* Sub-telemetry panels */}
        <div className="absolute bottom-12 left-8 right-8 flex justify-between items-end pointer-events-none z-10">
          <div className="p-3 bg-black/60 border border-white/10 backdrop-blur-md rounded-xl text-left text-[10px] space-y-1.5 w-60">
            <div className="flex justify-between">
              <span className="text-gray-500">BUFFER DEPTH</span>
              <span className="text-white">100% (CACHED)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">RENDER INTERMEDIARY</span>
              <span className="text-emerald-400">CANVAS_2D_GL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">RESOLVE RATIO</span>
              <span className="text-white">16:9 ACCURATE</span>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-white/10 backdrop-blur-md rounded-xl text-right text-[10px] space-y-1.5 w-60">
            <div className="flex justify-between">
              <span className="text-gray-500">SYSTEM VELOCITY</span>
              <span className="text-emerald-400">SCRUB READY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">RENDER ACCURACY</span>
              <span className="text-white">LOSSLESS JPG</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LINK SECURITY</span>
              <span className="text-emerald-400">SECURE LOCAL</span>
            </div>
          </div>
        </div>

        {/* Scroll Helper arrow indicators */}
        <AnimatePresence>
          {!hasScrolled && isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
              className="absolute bottom-6 flex flex-col items-center pointer-events-none"
            >
              <span className="text-[10px] text-emerald-400/80 tracking-[0.2em] font-bold uppercase mb-1">SCROLL DOWN TO SCRUB COGNITIVE CORE</span>
              <svg className="w-4 h-4 text-emerald-400/80 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
