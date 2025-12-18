
import React, { useState } from 'react';
import { FileText, Heart, Wand2, Download, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import ImproveAdModal from './ImproveAdModal';
import { toast } from "sonner";

export default function ChatMessage({ message, onLike, onImprove }) {
  const isUser = message.role === 'user';
  const [showImproveModal, setShowImproveModal] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const handleDownloadAd = () => {
    if (!message.content) return;
    const blob = new Blob([message.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'creative-magic-ad.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleCopyAd = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    toast.success("המודעה הועתקה");
  };

  const handleImproveRequest = async (feedback) => {
    if (isImproving) return;
    setIsImproving(true);
    await onImprove(message, feedback);
    setIsImproving(false);
    setShowImproveModal(false);
  };

  return (
    <>
      {!isUser && (
        <ImproveAdModal 
          isOpen={showImproveModal}
          setIsOpen={setShowImproveModal}
          onSubmit={handleImproveRequest}
          isSubmitting={isImproving}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-xl ${isUser ? 'max-w-md' : 'w-full'}`}>
          <div className={`rounded-lg ${isUser ? 'bg-teal-600 text-white p-3' : 'bg-gradient-to-r from-purple-100/50 to-teal-100/50 text-gray-800 border border-purple-200/30 shadow-sm p-6'}`}>
            {isUser ? (
              <div className="prose prose-sm max-w-none text-inherit break-words overflow-wrap-anywhere prose-invert">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              <>
                <ReactMarkdown
                  className="text-gray-800 hebrew-font"
                  components={{
                    p: ({node, ...props}) => <p className="my-1.5 text-base leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-extrabold text-lg text-gray-900 block my-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-none p-0 my-4 space-y-2" {...props} />,
                    li: ({node, ...props}) => (
                      <li className="flex items-start gap-2">
                        <span className="text-gray-900 font-bold mt-1 text-lg">•</span>
                        <span className="flex-1">{props.children}</span>
                      </li>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                
                {/* Action Buttons - רק עבור הודעות של 100 תווים ומעלה */}
                {message.content && message.content.length >= 100 && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-purple-200/30">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onLike?.(message)}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      שמור
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowImproveModal(true)}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Wand2 className="w-4 h-4" />
                      שפר
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyAd}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      העתק
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDownloadAd}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      הורד
                    </Button>
                  </div>
                )}
              </>
            )}

            {message.attachments && message.attachments.map((attachment, index) => (
              <div key={index} className="mt-2">
                {attachment.type.startsWith('image/') ? (
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    <img src={attachment.url} alt={attachment.name} className="max-w-xs rounded-lg object-cover" />
                  </a>
                ) : (
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${isUser ? 'bg-teal-700 hover:bg-teal-800' : 'bg-gray-300 hover:bg-gray-400'}`}>
                    <FileText className="w-5 h-5" />
                    <span>{attachment.name}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
