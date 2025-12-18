import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Copy, Download, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function MessageActions({ message, onLike, onImprove }) {
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('המודעה הועתקה בהצלחה!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('שגיאה בהעתקה');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([message.content], { type: 'text/plain; charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'מודעה.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('המודעה הורדה בהצלחה!');
  };
  
  const handleLike = () => {
    setIsLiked(true); // Optimistic UI update
    if(onLike) onLike(message);
  };

  const handleImprove = () => {
    if (onImprove) onImprove(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200"
    >
      <div className="text-center text-sm font-medium text-green-700 hebrew-font mb-3">
        המודעה נוצרה בהצלחה
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiked}
          className={`flex items-center gap-2 text-xs hebrew-font transition-colors ${
            isLiked ? 'text-red-600 bg-red-100' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {isLiked ? 'נשמר בגלריה' : 'אהבתי'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleImprove}
          className="flex items-center gap-2 text-xs hebrew-font text-gray-600 hover:text-orange-600 hover:bg-orange-50"
        >
          <Sparkles className="w-4 h-4" />
          שיפור
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs hebrew-font text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        >
          {copied ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
          העתק
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-2 text-xs hebrew-font text-gray-600 hover:text-green-600 hover:bg-green-50"
        >
          <Download className="w-4 h-4" />
          הורדה
        </Button>
      </div>
    </motion.div>
  );
}