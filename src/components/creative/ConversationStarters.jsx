
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Loader2, Megaphone, FileText } from 'lucide-react';

const StarterCard = ({ starter, onSelect, contentType }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="bg-white rounded-2xl border border-gray-200/80 shadow-md shadow-gray-200/20 p-4 flex items-center gap-5 cursor-pointer hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/40 transition-all duration-300 group"
    onClick={() => onSelect(starter, contentType)}
  >
    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${starter.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
      <starter.Icon className="w-6 h-6" />
    </div>
    <div className="flex-grow">
        <h3 className="text-md font-bold text-gray-800 hebrew-font">{starter.title}</h3>
        <p className="text-sm text-gray-500 hebrew-font leading-relaxed">{starter.description}</p>
    </div>
    <div className="flex-shrink-0 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0 duration-300">
      <Zap className="w-5 h-5" />
    </div>
  </motion.div>
);

export default function ConversationStarters({ starters, onSelectStarter, onGenerateMore, isGenerating, hasMore }) {
  const [selectedContentType, setSelectedContentType] = useState('ad');

  const handleStarterSelect = (starter) => {
    onSelectStarter(starter, selectedContentType);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 hebrew-font tracking-tight">מרכז הקריאייטיב</h2>
            <p className="text-lg text-gray-500 mt-2 hebrew-font">בחר נקודת פתיחה או קבל רעיונות נוספים</p>
        </div>

        {/* Content Type Selection */}
        <div className="mb-8">
          <div className="inline-flex bg-slate-100/70 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setSelectedContentType('ad')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hebrew-font ${
                selectedContentType === 'ad' ?
                'bg-white text-slate-800 shadow-lg shadow-slate-200/60 border border-white' :
                'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              מודעה ספציפית
            </button>
            <button
              onClick={() => setSelectedContentType('campaign')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hebrew-font ${
                selectedContentType === 'campaign' ?
                'bg-white text-slate-800 shadow-lg shadow-slate-200/60 border border-white' :
                'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Megaphone className="w-5 h-5" />
              קמפיין שלם
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {starters.map((starter) => (
                <StarterCard key={starter.title} starter={starter} onSelect={handleStarterSelect} contentType={selectedContentType} />
              ))}
            </motion.div>
          </AnimatePresence>

          {hasMore && (
            <Button
              onClick={onGenerateMore}
              disabled={isGenerating}
              variant="outline"
              className="w-full md:w-auto mx-auto flex items-center gap-2 h-12 px-8 text-base font-semibold hebrew-font bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  יוצר רעיונות...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  צור לי רעיונות נוספים
                </>
              )}
            </Button>
          )}
        </div>
    </div>
  );
}
