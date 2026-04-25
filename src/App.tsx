/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shirt, 
  Crown, 
  Palette, 
  Sparkles, 
  RefreshCcw, 
  Download, 
  ChevronRight, 
  History,
  Image as ImageIcon,
  Check,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialization of AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type Category = 'tops' | 'bottoms' | 'headwear' | 'accessories';

interface ItemOption {
  id: string;
  name: string;
  description: string;
}

const CATEGORIES: Record<Category, { title: string; icon: React.ReactNode; options: ItemOption[] }> = {
  tops: {
    title: 'Tops',
    icon: <Shirt className="w-5 h-5" />,
    options: [
      { id: 'jersey', name: 'Athletic Jersey', description: 'Classic mesh jersey' },
      { id: 'hoodie', name: 'Heavy Hoodie', description: 'Cozy campus favorite' },
      { id: 'varsity', name: 'Varsity Jacket', description: 'Legendary letterman style' },
      { id: 'tank', name: 'Workout Tank', description: 'Performance fit' },
    ]
  },
  bottoms: {
    title: 'Bottoms',
    icon: <Palette className="w-5 h-5" />,
    options: [
      { id: 'shorts', name: 'Bball Shorts', description: 'Loose athletic fit' },
      { id: 'joggers', name: 'Tech Joggers', description: 'Sleek modern pants' },
      { id: 'kilt', name: 'Heritage Kilt', description: 'A nod to roots' },
      { id: 'jeans', name: 'Distressed Denim', description: 'Casual campus look' },
    ]
  },
  headwear: {
    title: 'Headwear',
    icon: <Crown className="w-5 h-5" />,
    options: [
      { id: 'cap', name: 'Snapback Cap', description: 'Classic flat brim' },
      { id: 'beanie', name: 'Winter Beanie', description: 'Knitted warmth' },
      { id: 'headband', name: 'Sweat Band', description: 'Retro athlete vibes' },
      { id: 'nothing', name: 'Natural Horns', description: 'Show off the rack' },
    ]
  },
  accessories: {
    title: 'Extras',
    icon: <Sparkles className="w-5 h-5" />,
    options: [
      { id: 'sunglasses', name: 'Speed Shades', description: 'Fast performance eyewear' },
      { id: 'scarf', name: 'Collegiate Scarf', description: 'Winter accessory' },
      { id: 'backpack', name: 'Student Bag', description: 'Ready for class' },
      { id: 'whistle', name: 'Coach Whistle', description: 'Lead the team' },
    ]
  }
};

const COLORS = [
  { name: 'CSU Green', hex: '#1E4D2B' },
  { name: 'CSU Gold', hex: '#C8C372' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Deep Black', hex: '#1A1A1A' },
  { name: 'Vibrant Orange', hex: '#FF6321' },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('tops');
  const [selections, setSelections] = useState<Record<Category, string>>({
    tops: 'jersey',
    bottoms: 'shorts',
    headwear: 'cap',
    accessories: 'nothing'
  });
  const [primaryColor, setPrimaryColor] = useState(COLORS[0].hex);
  const [secondaryColor, setSecondaryColor] = useState(COLORS[1].hex);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  // Generate initial image on load
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const top = CATEGORIES.tops.options.find(o => o.id === selections.tops)?.name;
      const bottom = CATEGORIES.bottoms.options.find(o => o.id === selections.bottoms)?.name;
      const head = CATEGORIES.headwear.options.find(o => o.id === selections.headwear)?.name;
      const extra = CATEGORIES.accessories.options.find(o => o.id === selections.accessories)?.name;

      const prompt = `A professional, 3D cinematic render of the CSU Cam the Ram mascot in a heroic, friendly pose. 
      The mascot is wearing: 
      - A ${top} in ${primaryColor} with ${secondaryColor} accents.
      - ${bottom} in ${secondaryColor}.
      ${head !== 'Natural Horns' ? `- A ${head} on his head.` : ''}
      ${extra !== 'nothing' ? `- Wearing ${extra} as an accessory.` : ''}
      The background is a clean, minimal white studio set with soft professional lighting. 
      The mascot has realistic fur texture and majestic curved horns. High resolution, high fashion apparel photography style.`;

      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
      });

      const part = result.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        setCurrentImage(imageUrl);
        setGallery(prev => [imageUrl, ...prev].slice(0, 8));
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (cat: Category, id: string) => {
    setSelections(prev => ({ ...prev, [cat]: id }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation / Header */}
      <header className="h-16 px-6 border-b border-gray-100 flex items-center justify-between glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-csu-green rounded-lg flex items-center justify-center">
            <Sparkles className="text-csu-gold w-6 h-6" />
          </div>
          <h1 className="font-display text-xl tracking-tight text-csu-green">
            RamStyle<span className="text-csu-gold italic">Lab</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowGallery(!showGallery)}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors relative"
          >
            <History className="w-5 h-5 text-gray-600" />
            {gallery.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-csu-gold rounded-full border border-white" />
            )}
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400">CSU Mascot Designer</p>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Designer Canvas */}
        <section className="flex-1 bg-[#F9F9F7] p-8 flex items-center justify-center relative">
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-csu-green rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-csu-gold rounded-full blur-3xl" />
          </div>

          <div className="relative w-full max-w-2xl aspect-square">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-3xl z-20"
                >
                  <RefreshCcw className="w-12 h-12 text-csu-green animate-spin mb-4" />
                  <p className="font-athletic text-lg text-csu-green pulse transition-all">Stitching Gear...</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.div 
              layoutId="main-image"
              className="w-full h-full bg-white rounded-3xl shadow-2xl mascot-glow overflow-hidden relative border border-white/50"
            >
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt="Customized Mascot" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="w-20 h-20 mb-4 opacity-20" />
                  <p className="font-athletic uppercase tracking-widest text-sm italic">Awaiting Selection</p>
                </div>
              )}
            </motion.div>

            {/* Floating Action Buttons */}
            {currentImage && !isGenerating && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                <button className="bg-white shadow-xl p-4 rounded-full hover:scale-110 active:scale-95 transition-transform">
                  <Download className="w-5 h-5 text-gray-800" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right: Customization Sidebar */}
        <aside className="w-[420px] bg-white border-l border-gray-100 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="mb-10">
              <h2 className="font-display text-2xl text-csu-green mb-2">Build Your Look</h2>
              <p className="text-gray-500 text-sm">Customize Cam the Ram with official CSU inspired apparel.</p>
            </div>

            {/* Category Toggle */}
            <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-2xl">
              {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                    activeCategory === cat 
                      ? 'bg-white shadow-sm text-csu-green' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {CATEGORIES[cat].icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{CATEGORIES[cat].title}</span>
                </button>
              ))}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-3 mb-10">
              {CATEGORIES[activeCategory].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleSelection(activeCategory, opt.id)}
                  className={`group text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    selections[activeCategory] === opt.id
                      ? 'border-csu-green bg-csu-green/5'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <h4 className={`font-bold text-sm ${selections[activeCategory] === opt.id ? 'text-csu-green' : 'text-gray-700'}`}>
                      {opt.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
                  </div>
                  {selections[activeCategory] === opt.id && (
                    <div className="bg-csu-green text-white p-1 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Color Palette */}
            <div className="mb-10">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 block">Color Identity</label>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-3">Primary Gear Color</p>
                  <div className="flex gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setPrimaryColor(c.hex)}
                        className={`w-10 h-10 rounded-full border-4 transition-all shadow-sm ${
                          primaryColor === c.hex ? 'border-csu-green scale-110' : 'border-white'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-3">Accent Details</p>
                  <div className="flex gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setSecondaryColor(c.hex)}
                        className={`w-10 h-10 rounded-full border-4 transition-all shadow-sm ${
                          secondaryColor === c.hex ? 'border-csu-gold scale-110' : 'border-white'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-8 border-t border-gray-100 bg-white">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary w-full h-14 group"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Render Look
                </>
              )}
            </button>
          </div>
        </aside>
      </main>

      {/* Gallery Overlay */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed inset-y-0 right-0 w-[420px] bg-white z-[100] shadow-2xl border-l border-gray-100 flex flex-col"
          >
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="text-csu-green w-6 h-6" />
                <h2 className="font-display text-xl text-csu-green">Lookbook</h2>
              </div>
              <button 
                onClick={() => setShowGallery(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {gallery.map((img, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square rounded-2xl overflow-hidden shadow-md cursor-pointer border border-gray-100"
                    onClick={() => {
                      setCurrentImage(img);
                      setShowGallery(false);
                    }}
                  >
                    <img src={img} alt={`Gallery look ${i}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
                {gallery.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-300">
                    <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium uppercase tracking-widest italic">No designs saved</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
