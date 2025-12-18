
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';

export default function ConversationList({ conversationsByBusiness, activeConversation, onSelectConversation, onNewConversation }) {
  
  return (
    <div className="bg-gray-50 border-l border-gray-200 h-full flex flex-col p-3">
      <div className="flex items-center justify-between p-2 mb-2">
        <h2 className="text-lg font-semibold text-gray-800">שיחות</h2>
        <Button
          onClick={() => onNewConversation && onNewConversation(null)} // Corrected: Explicitly pass null for a general new conversation
          className="h-8 w-8 p-0 bg-gradient-to-br from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
          title="שיחה חדשה"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto pr-1">
        {Object.keys(conversationsByBusiness).length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-8 px-2">
            אין עדיין שיחות.
            <br/>
            התחל שיחה חדשה מעמוד 'העסקים'.
          </div>
        ) : (
          Object.entries(conversationsByBusiness).map(([businessName, conversations]) => (
            <div key={businessName} className="mb-4">
              <h3 className="text-sm font-bold text-gray-500 px-2 mb-1">{businessName}</h3>
              <div className="space-y-1">
                {conversations.map(conv => (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => onSelectConversation(conv)}
                      className={`w-full text-right flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                        activeConversation?.id === conv.id
                          ? 'bg-gradient-to-r from-purple-100/50 to-teal-100/50 text-purple-800 border border-purple-200/30 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </button>
                    
                    {/* כפתור פלוס שמופיע ב-hover */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNewConversation && onNewConversation(conv.business_id);
                      }}
                      className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-white hover:bg-purple-50 border border-gray-200 shadow-sm"
                      title="שיחה חדשה לעסק זה"
                    >
                      <Plus className="w-3 h-3 text-purple-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
