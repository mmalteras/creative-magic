
import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Youtube, ArrowRight, ArrowLeft, AlertCircle, Wand2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import LoginModal from "@/components/common/LoginModal";

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('youtube');
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setError("");

    if (!youtubeUrl.trim()) {
      setError("אנא הזן קישור YouTube");
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError("קישור YouTube לא תקין");
      return;
    }

    setIsLoading(true);
    try {
      const sourceThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const project = await Project.create({
        youtube_url: youtubeUrl,
        youtube_video_id: videoId,
        source_thumbnail_url: sourceThumbnailUrl,
        status: "thumbnail_fetched"
      });
      navigate(createPageUrl(`Analyze?project=${project.id}`));
    } catch (err) {
      setError("שגיאה ביצירת הפרויקט. אנא נסה שוב");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setError("");

    if (!manualPrompt.trim()) {
      setError("אנא תאר את הויז'ן שלך בתיבת הטקסט");
      return;
    }

    setIsPromptLoading(true);
    try {
      const project = await Project.create({
        thumbnail_prompt: manualPrompt,
        status: "created"
      });
      navigate(createPageUrl(`Upload?project=${project.id}`));
    } catch (err) {
      setError("שגיאה ביצירת הפרויקט. אנא נסה שוב");
    } finally {
      setIsPromptLoading(false);
    }
  };

  return (
    <>
      <LoginModal isOpen={showLoginModal} setIsOpen={setShowLoginModal} />
      
      <div className="flex-grow flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-teal-500 to-purple-600 bg-[200%_auto] animate-gradient mb-6 hebrew-font tracking-tight">
              יוצר קאברים ויראליים
            </h1>
            <p className="text-xl text-slate-600 hebrew-font font-medium max-w-2xl mx-auto leading-relaxed">
              מתחילים מקישור YouTube או מרעיון, יוצרים קאבר עם הזהות שלכם
            </p>
          </div>

          {/* Premium Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 relative overflow-hidden">
            
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-white to-teal-100/30 rounded-3xl"></div>
            
            <div className="relative z-10">
              {/* Tab Navigation */}
              <div className="flex justify-center mb-10">
                <div className="inline-flex bg-slate-100/70 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60">
                  <button
                    onClick={() => {setActiveTab('youtube');setError("");}}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hebrew-font ${
                    activeTab === 'youtube' ?
                    'bg-white text-slate-800 shadow-lg shadow-slate-200/60 border border-white' :
                    'text-slate-600 hover:text-slate-800'}`
                    }>

                    <Play className="w-5 h-5" />
                    מ-YouTube
                  </button>
                  <button
                    onClick={() => {setActiveTab('prompt');setError("");}}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hebrew-font ${
                    activeTab === 'prompt' ?
                    'bg-white text-slate-800 shadow-lg shadow-slate-200/60 border border-white' :
                    'text-slate-600 hover:text-slate-800'}`
                    }>

                    <Wand2 className="w-5 h-5" />
                    מרעיון
                  </button>
                </div>
              </div>

              {/* Content */}
              {activeTab === 'youtube' &&
              <form onSubmit={handleYoutubeSubmit} className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg shadow-red-500/25">
                      <Youtube className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 hebrew-font mb-3">נתח סרטון YouTube</h3>
                    <p className="text-slate-600 hebrew-font text-lg">הדבק קישור והמערכת תנתח את הקאבר</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..." className="bg-slate-100 px-3 py-2 text-lg flex w-full border ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1 h-14 backdrop-blur-sm border-slate-200/60 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-xl shadow-sm"

                    dir="ltr" />

                    <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-14 px-8 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">

                      {isLoading ?
                    <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          מנתח...
                        </div> :

                    <>
                          המשך
                          <ArrowLeft className="w-5 h-5 mr-2" />
                        </>
                    }
                    </Button>
                  </div>
                </form>
              }
              
              {activeTab === 'prompt' &&
              <form onSubmit={handlePromptSubmit} className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/25">
                      <Wand2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 hebrew-font mb-3">צור מרעיון</h3>
                    <p className="text-slate-600 hebrew-font text-lg">תאר את הרעיון במילים</p>
                  </div>

                  <Textarea
                  value={manualPrompt}
                  onChange={(e) => setManualPrompt(e.target.value)}
                  placeholder="תאר את הרעיון שלך..."
                  className="min-h-32 bg-white/70 backdrop-blur-sm border-slate-200/60 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 resize-none rounded-xl text-lg shadow-sm"
                  dir="rtl" />

                  
                  <Button
                  type="submit"
                  disabled={isPromptLoading}
                  className="w-full h-14 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                  >

                    {isPromptLoading ?
                  <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        יוצר...
                      </div> :

                  "צור קאבר"
                  }
                  </Button>
                </form>
              }

              {/* Error Display */}
              {error &&
              <Alert variant="destructive" className="mt-8 bg-red-50/80 backdrop-blur-sm border-red-200/60 rounded-xl">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="hebrew-font text-base font-medium">{error}</AlertDescription>
                </Alert>
              }
            </div>
          </div>
        </div>
      </div>
    </>);

}
