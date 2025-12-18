
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";

const suggestions = [
  "תקצר ותהדק את המסר",
  "הוסף יותר רגש וחיבור אישי",
  "הדגש את הבעיה שהמוצר פותר",
  "כתוב בסגנון יותר קליל והומוריסטי",
  "הפוך את הקריאה לפעולה ליותר חזקה",
  "פנה לקהל יעד צעיר יותר",
];

export default function ImproveAdModal({ isOpen, setIsOpen, onSubmit, isSubmitting }) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!feedback.trim() || isSubmitting) return;
    onSubmit(feedback);
  };

  const handleSuggestionClick = (suggestion) => {
    setFeedback(prev => prev ? `${prev}\n${suggestion}` : suggestion);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-white hebrew-font" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-purple-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">שיפור מודעה</DialogTitle>
          </div>
          <DialogDescription>
            מה תרצה לשנות או לשפר במודעה? לדוגמה: "תקצר את זה", "תוסיף יותר רגש", "תדגיש את המחיר".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="כתוב את הבקשה שלך כאן..."
            className="min-h-[120px] text-base"
            disabled={isSubmitting}
          />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">או נסה אחת מההצעות שלנו:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(s)}
                  className="text-xs hebrew-font text-gray-700 bg-gray-50 border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isSubmitting}
            className="w-full btn-gradient h-11"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Wand2 className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? 'משפר...' : 'שפר עכשיו'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
