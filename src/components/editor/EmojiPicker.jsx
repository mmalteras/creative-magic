import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const emojis = {
  'פרצופים ואנשים': ['😀', '😂', '😍', '🤔', '😎', '😭', '🤯', '😱', '🥳', '😴', '👍', '👎', '🙏', '💪', '👀', '🧑‍💻'],
  'בעלי חיים וטבע': ['🐶', '🐱', '🐭', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦋', '🐞', '🐠', '🐳', '🌵', '🎄', '🌴', '🌸', '🔥', '💧', '☀️', '🌙', '⭐️'],
  'אוכל ושתיה': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🍔', '🍟', '🍕', '🌭', '🥪', '🍿', '🍩', '🍪', '🎂', '☕️', '🍺', '🍷'],
  'פעילויות וספורט': ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '⛳️', '🏹', '🎣', '🥊', '🥋', '🛹', '🚴‍♀️', '🏆', '🎮', '🎯', '🎰', '🎲'],
  'חפצים': ['💻', '📱', '⌚️', '📷', '💡', '💰', '💎', '🎁', '🎉', '🎈', '❤️', '💔', '💣', '🔑', '📈', '📊'],
  'סמלים': ['➡️', '⬅️', '⬆️', '⬇️', '✔️', '❌', '❓', '❗️', '💯', '✅', '⛔️', '⚠️', '▶️', '⏸️', '⏹️', '🚀', '✨', '🌍']
};

export default function EmojiPicker({ onSelectEmoji }) {
  return (
    <div dir="rtl" className="flex flex-col h-[50vh]">
      <Tabs defaultValue={Object.keys(emojis)[0]} className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-shrink-0 border-b border-slate-700">
          <TabsList className="p-2">
            {Object.keys(emojis).map(category => (
              <TabsTrigger key={category} value={category} className="hebrew-font text-xs h-8 data-[state=active]:bg-slate-800 data-[state=active]:text-violet-400">{category}</TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        <ScrollArea className="flex-1 p-4">
          {Object.entries(emojis).map(([category, emojiList]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {emojiList.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => onSelectEmoji(emoji)}
                    className="text-3xl p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
}