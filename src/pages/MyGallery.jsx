import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { LikedAd } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Edit, Image as ImageIcon, Download, Heart, Copy, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import LoadingDots from "@/components/common/LoadingDots";
import PageHeader from "@/components/common/PageHeader";
import { toast } from "sonner";

export default function MyGallery() {
  const [activeTab, setActiveTab] = useState('covers');
  const [projects, setProjects] = useState([]);
  const [savedAds, setSavedAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        if (user && user.email) {
          // Load covers
          const userProjects = await Project.filter(
            { 
              created_by: user.email,
              flux_result_image_url: { $ne: null } 
            },
            '-updated_date'
          );
          const validProjects = userProjects.filter(p => p.flux_result_image_url && p.flux_result_image_url.trim() !== '');
          setProjects(validProjects);

          // Load saved ads
          const userAds = await LikedAd.filter({ created_by: user.email }, '-created_date');
          setSavedAds(userAds);
        }
      } catch (error) {
        console.error("Failed to load content:", error);
        setProjects([]);
        setSavedAds([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleDownload = async (project) => {
    const downloadUrl = project.final_image_url || project.flux_result_image_url;
    if (!downloadUrl) return;

    setDownloadingId(project.id);
    const fileName = `CreativeMagic_${project.hebrew_headline?.replace(/[^\w\s]/gi, '') || project.youtube_video_id || project.id}.png`;
    try {
      const res = await fetch(downloadUrl, { mode: 'cors', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS && typeof a.download === 'undefined') {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        window.URL.revokeObjectURL(url);
      } else {
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1500);
      }
    } catch (error) {
      console.error("Download failed, opening in new tab fallback:", error);
      try {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      } catch (fallbackError) {
        console.error("Fallback to new tab failed as well:", fallbackError);
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 500);
    }
  };

  const handleCopyAd = (adContent) => {
    navigator.clipboard.writeText(adContent);
    toast.success("המודעה הועתקה");
  };

  const handleDownloadAd = (adContent, index) => {
    const blob = new Blob([adContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creative-magic-ad-${index + 1}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="הגלריה שלך"
          subtitle="כל היצירות והמודעות שלכם במקום אחד"
        />

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('covers')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all hebrew-font ${
                activeTab === 'covers' 
                  ? 'bg-white text-gray-800 shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              קאברים ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all hebrew-font ${
                activeTab === 'ads' 
                  ? 'bg-white text-gray-800 shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Heart className="w-4 h-4" />
              מודעות שמורות ({savedAds.length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <LoadingDots />
            <p className="text-neutral-400 hebrew-font">טוען את הגלריה…</p>
          </div>
        ) : (
          <>
            {/* Covers Tab */}
            {activeTab === 'covers' && (
              projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="shadow-lg shadow-black/30 transition-all duration-300 overflow-hidden group bg-neutral-900 card-glow-border">
                        <CardContent className="p-0">
                          <div className={`${
                            project.size_preset === 'instagram' ? 'aspect-[3/4]' : 'aspect-video'
                          } overflow-hidden bg-neutral-950`}>
                            <img
                              src={project.final_image_url || project.flux_result_image_url}
                              alt={`תמונה שנוצרה עבור: ${project.hebrew_headline || project.youtube_video_id}`}
                              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                            />
                          </div>
                          <div className="p-4 space-y-4">
                            <p className="font-semibold text-neutral-200 truncate hebrew-font" title={project.hebrew_headline}>
                              {project.hebrew_headline || `פרויקט ${project.youtube_video_id}`}
                            </p>
                            
                            <div className="flex gap-2">
                                <Link to={createPageUrl(`Editor?project=${project.id}`)} className="flex-1">
                                  <Button className="w-full hebrew-font bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700" variant="secondary">
                                    <Edit className="w-4 h-4 ml-2" aria-hidden="true"/>
                                    ערוך
                                  </Button>
                                </Link>
                                <Button
                                  className="flex-1 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hebrew-font"
                                  onClick={() => handleDownload(project)}
                                  disabled={downloadingId === project.id}
                                >
                                  {downloadingId === project.id ? (
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" aria-hidden="true"/>
                                  ) : (
                                    <Download className="w-4 h-4 ml-2" aria-hidden="true"/>
                                  )}
                                  הורד
                                </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center col-span-full p-12 bg-neutral-800/50 rounded-lg shadow-md border border-neutral-700 mt-8"
                >
                  <ImageIcon className="w-16 h-16 text-neutral-500 mx-auto mb-4" aria-hidden="true"/>
                  <h3 className="text-xl font-bold text-neutral-100 mb-2 hebrew-font">הקאברים שלכם מחכים להברקות</h3>
                  <p className="text-neutral-400 mb-4 hebrew-font">
                    התחילו פרויקט חדש – והקאברים יופיעו כאן באופן אוטומטי.
                  </p>
                  <Link to={createPageUrl("Home")}>
                      <Button className="hebrew-font bg-red-600 hover:bg-red-700 text-white">התחל ליצור</Button>
                  </Link>
                </motion.div>
              )
            )}

            {/* Saved Ads Tab */}
            {activeTab === 'ads' && (
              savedAds.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {savedAds.map((ad, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 hebrew-font mb-2">מודעה שמורה</h3>
                                <div className="text-sm text-gray-500 hebrew-font">
                                  נשמר ב-{new Date(ad.created_date).toLocaleDateString('he-IL')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                              <div className="text-gray-800 hebrew-font leading-relaxed whitespace-pre-wrap text-sm">
                                {ad.content}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyAd(ad.content)}
                                className="flex items-center gap-2 text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                                העתק
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadAd(ad.content, index)}
                                className="flex items-center gap-2 text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                הורד
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center col-span-full p-12 bg-gray-50 rounded-lg shadow-md border border-gray-200 mt-8"
                >
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true"/>
                  <h3 className="text-xl font-bold text-gray-700 mb-2 hebrew-font">עדיין לא שמרת מודעות</h3>
                  <p className="text-gray-500 mb-4 hebrew-font">
                    לך למרכז הקריאייטיב, צור מודעות ולחץ על "שמור" כדי לראות אותן כאן.
                  </p>
                  <Link to={createPageUrl("CreativeHub")}>
                      <Button className="hebrew-font bg-purple-600 hover:bg-purple-700 text-white">מרכז הקריאייטיב</Button>
                  </Link>
                </motion.div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}