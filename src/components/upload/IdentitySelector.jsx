import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export default function IdentitySelector({ onGenerate, isDisabled, peopleCount }) {
  
  const handleGenerateClick = () => {
    onGenerate([]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl p-4 border border-purple-200">
        <p className="text-gray-700 hebrew-font text-sm">
          {peopleCount > 1 ? `זוהו ${peopleCount} דמויות בתמונה.` : 'זוהתה דמות אחת בתמונה.'} 
          כעת ניתן ליצור גרסה חדשה המשמרת את הזהות.
        </p>
      </div>
      <Button
        onClick={handleGenerateClick}
        disabled={isDisabled}
        className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 rounded-xl"
      >
        <Wand2 className="w-5 h-5" />
        צור גרסה חדשה
      </Button>
    </div>
  );
}