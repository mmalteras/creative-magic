
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Business } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { Message } from '@/api/entities';
import { User } from '@/api/entities';
import { LikedAd } from '@/api/entities';
import { creativeAssistant } from '@/api/functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, Loader2, X, MessageSquare } from 'lucide-react';
import { UploadFile } from "@/api/integrations";
import ConversationList from '@/components/creative/ConversationList';
import ChatMessage from '@/components/creative/ChatMessage';
import { createPageUrl } from '@/utils';
import _ from 'lodash';
import ConversationStarters from '@/components/creative/ConversationStarters';
import { conversationStarters } from '@/components/creative/conversationStartersData';
import TypingIndicator from '@/components/creative/TypingIndicator';
import { AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { useNotificationSound } from '@/components/creative/NotificationSound'; // Added import

// הגדרת מנגנון ניהול קריאות API משותף
const apiLimiter = {
  lastCallTime: 0,
  callQueue: [],
  isProcessing: false,
  minInterval: 800,

  async execute(apiFunc, context) {
    return new Promise((resolve, reject) => {
      this.callQueue.push({ apiFunc, resolve, reject, context });
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  },

  async processQueue() {
    if (this.callQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    this.isProcessing = true;

    const { apiFunc, resolve, reject, context } = this.callQueue.shift();
    
    const timeSinceLast = Date.now() - this.lastCallTime;
    if (timeSinceLast < this.minInterval) {
      await new Promise(res => setTimeout(res, this.minInterval - timeSinceLast));
    }

    try {
      this.lastCallTime = Date.now();
      const result = await apiFunc();
      resolve(result);
    } catch (error) {
      console.error(`API Error in ${context}:`, error);
      if (error.response?.status === 429) {
        console.warn(`Rate limit hit in ${context}. Re-queueing with backoff.`);
        this.callQueue.unshift({ apiFunc, resolve, reject, context });
        await new Promise(res => setTimeout(res, 3500));
      } else {
        reject(error);
      }
    }
    
    requestAnimationFrame(() => this.processQueue());
  }
};

export default function CreativeHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationsByBusiness, setConversationsByBusiness] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false); // For messages loading
  const [isLoadingConversations, setIsLoadingConversations] = useState(true); // For initial conversation/list loading
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // New state for conversation starters
  const [displayedStarters, setDisplayedStarters] = useState([]);
  const [starterIndex, setStarterIndex] = useState(0);
  const [isGeneratingStarters, setIsGeneratingStarters] = useState(false);

  const playNotificationSound = useNotificationSound(); // Added hook call

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleNewConversation = useCallback(async (businessId) => {
      if (!user) return;
      
      if (!businessId) {
        navigate(createPageUrl('Business'));
        return;
      }
      
      try {
        const newConv = await apiLimiter.execute(
          () => Conversation.create({
            business_id: businessId,
            title: "שיחה חדשה"
          }),
          'create conversation'
        );

        setConversations(prev => [newConv, ...prev].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)));
        setActiveConversation(newConv);
        setMessages([]); // Clear messages for new conversation
        
        // הסרת הפרמטר 'new' מה-URL לאחר יצירת השיחה
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('new');
        setSearchParams(newParams);
        
      } catch (error) {
        console.error("Failed to create new conversation:", error);
        setError('יצירת השיחה נכשלה');
      }
  }, [user, navigate, searchParams, setSearchParams]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);

    try {
      const [convs, businesses] = await Promise.all([
        apiLimiter.execute(
          () => Conversation.filter({}, '-updated_date'),
          'loadConversations'
        ),
        apiLimiter.execute(
          () => Business.list(),
          'loadBusinesses for grouping'
        )
      ]);
      
      setConversations(convs);
      
      const businessMap = _.keyBy(businesses, 'id');
      const grouped = _.groupBy(convs, (c) => businessMap[c.business_id]?.business_name || 'עסק לא ידוע');
      setConversationsByBusiness(grouped);

      const businessIdFromUrl = searchParams.get('businessId');
      const shouldCreateNew = searchParams.get('new') === 'true';
      
      if (businessIdFromUrl && shouldCreateNew) {
        // יצירת שיחה חדשה אוטומטית אם יש פרמטר new=true
        await handleNewConversation(businessIdFromUrl);
      } else if (businessIdFromUrl) {
        // חיפוש שיחה קיימת לעסק זה
        const initialConv = convs.find(c => c.business_id === businessIdFromUrl);
        if (initialConv) {
          setActiveConversation(initialConv);
        } else {
          // אם אין שיחות קיימות לעסק זה, יצירת שיחה חדשה
          await handleNewConversation(businessIdFromUrl);
        }
      } else if (convs.length > 0) {
        setActiveConversation(convs[0]);
      } else {
        // No conversations at all, and no businessId in URL. Keep activeConversation null.
        setActiveConversation(null); 
      }

    } catch (err) {
      console.error("Error loading conversations:", err);
      setError('שגיאה בטעינת השיחות. נסה לרענן את העמוד.');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user, searchParams, handleNewConversation]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        console.error("User not authenticated", e);
        setUser(null);
        navigate(createPageUrl("Home"));
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  useEffect(() => {
    const loadMessages = async () => {
      if (activeConversation) {
        setIsLoading(true); // Set loading for messages
        setError('');
        try {
          const fetchedMessages = await apiLimiter.execute(
            () => Message.filter({ conversation_id: activeConversation.id }, 'created_date'),
            'loadMessages'
          );
          setMessages(fetchedMessages);
          
          if (fetchedMessages.length === 0) {
            // If conversation is empty, show first starters
            setDisplayedStarters(conversationStarters.slice(0, 4));
            setStarterIndex(4);
          } else {
            setDisplayedStarters([]); // Clear starters if there are messages
            setStarterIndex(0);
          }

        } catch (err) {
          console.error("Error loading messages:", err);
          setError('שגיאה בטעינת ההודעות.');
        } finally {
          setIsLoading(false); // Done loading messages
        }
      } else {
        setMessages([]);
        setDisplayedStarters([]); // Clear starters if no active conversation
        setStarterIndex(0);
        setIsLoading(false); // Not loading messages if no active conversation
      }
    };
    loadMessages();
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleGenerateMoreStarters = () => {
    setIsGeneratingStarters(true);
    setTimeout(() => {
      const nextIndex = starterIndex + 4;
      const newStarters = conversationStarters.slice(starterIndex, nextIndex);
      setDisplayedStarters(prev => [...prev, ...newStarters]);
      setStarterIndex(nextIndex);
      setIsGeneratingStarters(false);
    }, 1500); // Simulate generation
  };

  const handleSelectStarter = async (starter, contentType) => {
    if (contentType === 'campaign') {
      const messageContent = `${starter.prompt} - אני רוצה לקבל קמפיין שלם`;
      await handleSendMessage(null, messageContent);
    } else {
      // עבור מודעה ספציפית - פשוט שולח את ה-prompt כמו שהוא
      await handleSendMessage(null, starter.prompt);
    }
  }
  
  const handleLikeAd = useCallback(async (message) => {
    try {
      await apiLimiter.execute(
        () => LikedAd.create({
          content: message.content,
          original_conversation_id: message.conversation_id,
        }),
        'like ad'
      );
      toast.success("המודעה נשמרה בגלריה!");
    } catch (error) {
      console.error("Failed to save liked ad:", error);
      toast.error("שגיאה בשמירת המודעה");
    }
  }, []);
  
  const handleSendMessage = useCallback(async (e, forcedContent = null, displayContent = null) => {
    if (e) e.preventDefault();
    const contentToProcess = forcedContent || newMessage;
    const contentToDisplay = displayContent || contentToProcess;
    
    if ((!contentToProcess.trim() && !attachment) || !activeConversation || isSending) return;

    setIsSending(true);
    setError('');
    
    let uploadedAttachment = null;
    if (attachment) {
      try {
        const { file_url } = await UploadFile({ file: attachment.file });
        uploadedAttachment = {
          url: file_url,
          type: attachment.type,
          name: attachment.file.name,
        };
      } catch (err) {
            console.error("File upload failed:", err);
            setError('העלאת הקובץ נכשלה');
            setIsSending(false);
            return;
      }
    }

    const userMessage = {
      role: 'user',
      content: contentToDisplay,
      attachments: uploadedAttachment ? [uploadedAttachment] : [],
    };
    
    const tempMessage = {
        ...userMessage,
        conversation_id: activeConversation.id,
        created_date: new Date().toISOString(),
        id: 'temp-' + Date.now()
    };
    setMessages(prev => [...prev, tempMessage]);
    
    if (!forcedContent) {
        setNewMessage('');
        setAttachment(null);
    }
    
    try {
      const response = await creativeAssistant({
        conversation_id: activeConversation.id,
        message: contentToProcess,
        business_id: activeConversation.business_id,
        user_message_to_save: userMessage,
      });
      
      const latestMessages = await apiLimiter.execute(
          () => Message.filter({ conversation_id: activeConversation.id }, 'created_date'),
          'fetch latest messages after send'
      );
      setMessages(latestMessages);
      setDisplayedStarters([]);
      setStarterIndex(0);

      // 🔊 השמעת צליל כאשר מגיעה תגובה חדשה מהמערכת
      playNotificationSound();

      // אם הכותרת עודכנה, טוען מחדש את רשימת השיחות
      if (response.data.titleUpdated) {
        const updatedConversations = await apiLimiter.execute(
          () => Conversation.filter({}, '-updated_date'),
          'reload conversations after title update'
        );
        setConversations(updatedConversations);
        
        // מעדכן את הקבוצות לפי עסקים
        const businesses = await apiLimiter.execute(
          () => Business.list(),
          'reload businesses for updated grouping'
        );
        const businessMap = _.keyBy(businesses, 'id');
        const grouped = _.groupBy(updatedConversations, (c) => businessMap[c.business_id]?.business_name || 'עסק לא ידוע');
        setConversationsByBusiness(grouped);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setError("שגיאה בשליחת ההודעה, נסה שוב");
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      if (!forcedContent) {
          setNewMessage(contentToProcess);
      }
    } finally {
      setIsSending(false);
    }
  }, [attachment, activeConversation, isSending, newMessage, playNotificationSound]); // Added playNotificationSound to dependencies

  const handleImproveAd = useCallback(async (message, userFeedback) => {
    const improvePrompt = `
אתה אסטרטג שיווק וקופירייטר מומחה. עליך לשפר את המודעה הבאה על סמך בקשת המשתמש.
תרגם את הבקשה הפשוטה של המשתמש להנחיה מקצועית וממוקדת שתפיק תוצאה מעולה.

**המודעה המקורית:**
---
${message.content}
---

**בקשת המשתמש:**
"${userFeedback}"

**המשימה שלך:**
צור גרסה משופרת של המודעה שמתייחסת ישירות לבקשת המשתמש תוך שמירה על כל עקרונות הקופירייטינג הוויראלי: הוק חזק, כאב, סיפור, חלום, וקריאה לפעולה.
`;
    await handleSendMessage(null, improvePrompt, "שיפור מודעה");
  }, [handleSendMessage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment({
        file,
        preview: URL.createObjectURL(file),
        type: file.type,
        name: file.name
      });
    }
  };
  
  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    navigate(createPageUrl('CreativeHub'));
  };

  return (
    <div className="flex flex-row h-full bg-gray-100" dir="rtl" style={{ height: 'calc(100vh - 80px - 80px)' }}>
      <div className="w-1/4 max-w-xs flex-shrink-0">
        <ConversationList 
            conversationsByBusiness={conversationsByBusiness}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
        />
      </div>

      <div className="flex-grow flex flex-col">
        <div className="w-full bg-white rounded-none shadow-sm border-b border-gray-200 flex flex-col h-full">
            {error && (
              <div className="bg-yellow-100 border-r-4 border-yellow-500 p-3 text-yellow-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex-grow overflow-y-auto">
                {isLoadingConversations ? ( // Display loading for the whole chat area if conversations are still loading
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : isLoading && messages.length === 0 ? ( // Display loading only if messages are loading AND no messages are present yet
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : messages.length === 0 && activeConversation ? ( // Show conversation starters if no messages but an active conversation
                    <ConversationStarters 
                        starters={displayedStarters}
                        onSelectStarter={handleSelectStarter}
                        onGenerateMore={handleGenerateMoreStarters}
                        isGenerating={isGeneratingStarters}
                        hasMore={starterIndex < conversationStarters.length}
                    />
                ) : messages.length === 0 ? ( // Show "select conversation" message if no messages and no active conversation
                    <div className="text-center text-gray-500 pt-16 flex flex-col items-center justify-center h-full">
                        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                        <p>בחר שיחה או התחל שיחה חדשה מהעסקים שלך.</p>
                    </div>
                ) : ( // Display messages
                    <div className="p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <ChatMessage 
                                key={msg.id || index} 
                                message={msg}
                                onLike={handleLikeAd}
                                onImprove={handleImproveAd}
                            />
                        ))}
                        <AnimatePresence>
                            {isSending && <TypingIndicator />}
                        </AnimatePresence>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {activeConversation && (
            <div className="p-4 border-t border-gray-200 bg-white">
                {attachment && (
                  <div className="relative w-fit mb-2 p-2 border rounded-md bg-gray-50">
                      <img src={attachment.preview} alt="Attachment Preview" className="w-20 h-20 object-cover rounded" />
                    <Button
                      variant="destructive" size="icon"
                      onClick={() => setAttachment(null)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    ><X className="w-4 h-4" /></Button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                    <Button type="button" variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input 
                        value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={"כתוב את הודעתך כאן..."} className="flex-1"
                        disabled={isSending || !activeConversation}
                    />
                    <Button type="submit" size="icon" disabled={isSending || !activeConversation || (!newMessage.trim() && !attachment)}>
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
