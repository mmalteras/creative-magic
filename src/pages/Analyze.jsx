
import React, { useState, useEffect, useCallback } from "react";
import { Project } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/common/PageHeader";
import SoothingLoader from "@/components/common/SoothingLoader";
import GenerationLoader from "@/components/common/GenerationLoader";
import {
  Search,
  ArrowRight,
  Palette,
  Eye,
  AlertCircle,
  Loader2,
  Sparkles,
  Type,
  Wand2,
  Target,
  Zap,
  Edit3,
  Save,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function AnalyzePage() {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [headlineDraft, setHeadlineDraft] = useState("");
  const [savingHeadline, setSavingHeadline] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);

  const navigate = useNavigate();

  const loadProject = useCallback(async (projectId) => {
    try {
      const foundProject = await Project.get(projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        navigate(createPageUrl("Home"), { replace: true });
      }
    } catch {
      navigate(createPageUrl("Home"), { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");

    if (projectId) {
      loadProject(projectId);
    } else {
      navigate(createPageUrl("Home"), { replace: true });
    }
  }, [loadProject, navigate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!project) {
        navigate(createPageUrl("Home"), { replace: true });
      }
    }, 12000);
    return () => clearTimeout(timeoutId);
  }, [project, navigate]);

  useEffect(() => {
    if (project) {
      setHeadlineDraft(project.hebrew_headline || "");
      setPromptDraft(project.thumbnail_prompt || "");
    }
  }, [project]);

  const handleAnalyze = async () => {
    if (!project?.source_thumbnail_url) return;

    setIsLoading(true);
    setAnalysisError("");
    try {
      const analysisPrompt = `
      You are a world-class AI art director and visual analyst. Your mission is to deconstruct a provided image into its fundamental visual components to create a highly detailed and accurate prompt for another AI image generator. The goal is 1:1 recreation, focusing on visual facts, not interpretation.

      **CRITICAL DECONSTRUCTION - Analyze the image with extreme precision:**
      1.  **Subject & Pose:** Describe the main subject(s) using strictly neutral, factual language. Use "person" or "subject". **CRITICAL: DO NOT describe the subject's hair, hairstyle, or facial hair.** This information will be provided by a separate reference image. Focus ONLY on their clothing (type, color), their EXACT pose, and facial expression. (e.g., "A person wearing a black plaid shirt and a dark baseball cap, with a shocked, wide-eyed expression, mouth open, looking directly at the camera...").
      2.  **Composition & Framing:** Detail the shot composition. Is it a close-up, medium shot, or full body? Is the subject centered, off-center, following the rule of thirds? Describe the camera angle (eye-level, low angle, high angle).
      3.  **Key Elements, Symbols & Icons:** THIS IS THE MOST IMPORTANT PART. Meticulously list EVERY object, symbol, icon, or prop visible. Describe their appearance, material, and position relative to the subject. (e.g., "The person is holding a glowing geometric shape (an icosahedron) between their hands. A company logo 'Acquisition.com' is visible on their cap. A faint, glowing neon ear icon is floating to their right.").
      4.  **Lighting Scheme:** Describe the lighting precisely. Identify the key light, fill light, and any rim lights. Note the color of the lights. (e.g., "Cinematic 3-point lighting. A strong, soft key light from the front-left. A subtle fill light from the right. A prominent bright blue or cyan rim light outlining their head and shoulders.").
      5.  **Background:** Describe the background scene. Is it an office, a studio, outdoors? Is it in sharp focus or heavily blurred (bokeh effect)?
      6.  **Color Palette:** Extract the 2-3 most dominant hex colors from the image that define its mood.

      **OUTPUT GENERATION - Based on your factual analysis, generate the following JSON fields:**
      1.  **thumbnail_prompt:** Synthesize ALL the details from steps 1-6 into a single, dense, descriptive paragraph. This is a blueprint for recreation. Start with the overall style (e.g., "Ultra-realistic, cinematic photograph..."). Then describe the subject, their pose, ALL key elements and their placement, the precise lighting, and the background. The more detail, the better.
      2.  **color_palette:** An array of the hex color strings you identified.
      3.  **hebrew_headline:** Suggest a short, punchy, and curiosity-driving headline in HEBREW (max 6 words) that describes the content of the video, NOT the image itself.
      4.  **composition_notes:** A brief, technical summary of the composition and lighting (e.g., "Centered medium shot, eye-level. Strong blue rim lighting creates subject separation. Background has heavy bokeh.").
      `;

      const {
        thumbnail_prompt,
        color_palette,
        hebrew_headline,
        composition_notes
      } = await InvokeLLM({
        prompt: analysisPrompt,
        file_urls: [project.source_thumbnail_url],
        response_json_schema: {
          type: "object",
          properties: {
            thumbnail_prompt: { type: "string" },
            color_palette: { type: "array", items: { type: "string" } },
            hebrew_headline: { type: "string" },
            composition_notes: { type: "string" }
          },
          required: ["thumbnail_prompt", "color_palette", "hebrew_headline", "composition_notes"]
        }
      });

      const updatedProject = await Project.update(project.id, {
        thumbnail_prompt,
        color_palette,
        hebrew_headline,
        composition_notes,
        status: "analyzed",
        youtube_video_title: project.youtube_video_title || "רעיון חדש"
      });
      setProject(updatedProject);
      setHeadlineDraft(hebrew_headline || "");
      setPromptDraft(thumbnail_prompt || "");
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisError("שגיאה בניתוח התמונה. אנא נסה שוב או נסה תמונה אחרת.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(createPageUrl(`Upload?project=${project.id}`));
  };

  const saveHeadline = async () => {
    if (!project) return;
    const trimmed = (headlineDraft || "").trim();
    if (trimmed === (project.hebrew_headline || "")) return;

    setSavingHeadline(true);
    try {
      await Project.update(project.id, { hebrew_headline: trimmed });
      setProject(prev => prev ? { ...prev, hebrew_headline: trimmed } : prev);
    } catch (e) {
      console.error("Failed to save headline:", e);
      setAnalysisError("שגיאה בשמירת הכותרת. נסה שוב.");
    } finally {
      setSavingHeadline(false);
    }
  };

  const savePrompt = async () => {
    if (!project) return;
    const trimmed = (promptDraft || "").trim();
    if (trimmed === (project.thumbnail_prompt || "")) return;

    setSavingPrompt(true);
    try {
      await Project.update(project.id, { thumbnail_prompt: trimmed });
      setProject(prev => prev ? { ...prev, thumbnail_prompt: trimmed } : prev);
      setEditingPrompt(false);
    } catch (e) {
      console.error("Failed to save prompt:", e);
      setAnalysisError("שגיאה בשמירת הפרומפט. נסה שוב.");
    } finally {
      setSavingPrompt(false);
    }
  };

  const handlePromptBlur = () => {
    if (promptDraft !== (project?.thumbnail_prompt || "")) {
      savePrompt();
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <SoothingLoader label="טוען פרויקט..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="חשיפת הנוסחה הוויראלית"
          subtitle="המערכת שלנו פיענחה את הסודות מאחורי התמונה הזו. עכשיו תוכל ליצור גרסה חדשה עם הזהות שלך."
        />

        {isLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <GenerationLoader phase="analyzing" />
          </div>
        )}

        {analysisError && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="hebrew-font">{analysisError}</AlertDescription>
          </Alert>
        )}

        {!project.thumbnail_prompt ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 rounded-2xl animate-pulse" />
                  <div className="absolute inset-1 bg-white rounded-2xl flex items-center justify-center">
                    <Wand2 className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-800 hebrew-font">בואו נגלה את הסוד</h3>
                <p className="text-gray-600 hebrew-font text-lg leading-relaxed">
                  המערכת שלנו תנתח את התמונה ברמה מיקרוסקופית ותחשוף את הנוסחה הוויראלית המדויקת
                </p>

                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                  <img
                    src={project.source_thumbnail_url}
                    alt="תמונה מקורית"
                    className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${project.youtube_video_id}/hqdefault.jpg`;
                    }}
                  />
                </div>
                
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl hebrew-font"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      מנתח את הקסם...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 ml-2" />
                      גלה את הנוסחה הוויראלית
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Top Section - Image and Continue Button */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <Card className="bg-white border-gray-200 shadow-lg flex-grow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-teal-100">
                          <Eye className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 hebrew-font">התמונה המקורית</h3>
                      </div>
                      <img
                        src={project.source_thumbnail_url}
                        alt="תמונה מקורית"
                        className="w-full rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${project.youtube_video_id}/hqdefault.jpg`;
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl hebrew-font"
                >
                  המשך ליצירת הגרסה שלך
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </div>

              <Card className="bg-white border-gray-200 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-teal-100 to-purple-100">
                      <Palette className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 hebrew-font">פלטת הצבעים</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {project.color_palette?.map((color, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <div 
                          className="w-8 h-8 rounded-lg shadow-sm border-2 border-white" 
                          style={{ backgroundColor: color }} 
                        />
                        <span className="text-sm font-mono text-gray-600">{color}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 hebrew-font">הערות קומפוזיציה</span>
                    </div>
                    <p className="text-gray-600 hebrew-font text-sm leading-relaxed">
                      {project.composition_notes || "מידע לא זמין"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section - Editable Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hebrew Headline */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-teal-100">
                    <Type className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg hebrew-font text-gray-800">כותרת בעברית</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      value={headlineDraft}
                      onChange={(e) => setHeadlineDraft(e.target.value)}
                      onBlur={saveHeadline}
                      placeholder="כותרת מעוררת סקרנות"
                      className="hebrew-font text-base bg-gray-50 border-gray-200 focus:border-purple-400 focus:ring-purple-100"
                      dir="rtl"
                    />
                    <div className="text-xs text-gray-500 hebrew-font flex items-center gap-1">
                      {savingHeadline ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          שומר אוטומטית...
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          נשמר אוטומטי בעזיבת השדה
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Prompt - Editable */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-teal-100 to-purple-100">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                    </div>
                    <CardTitle className="text-lg hebrew-font text-gray-800">הפרומפט הדיגיטלי</CardTitle>
                  </div>
                  
                  {!editingPrompt ? (
                    <Button
                      onClick={() => setEditingPrompt(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 hebrew-font"
                    >
                      <Edit3 className="w-4 h-4" />
                      ערוך
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setEditingPrompt(false)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={savePrompt}
                        disabled={savingPrompt}
                        size="sm"
                        className="flex items-center gap-1 hebrew-font"
                      >
                        {savingPrompt ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        שמור
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {editingPrompt ? (
                    <Textarea
                      value={promptDraft}
                      onChange={(e) => setPromptDraft(e.target.value)}
                      onBlur={handlePromptBlur}
                      className="min-h-32 font-mono text-sm bg-gray-50 border-gray-200 focus:border-teal-400 focus:ring-teal-100"
                      dir="ltr"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed font-mono text-sm" dir="ltr">
                        {project.thumbnail_prompt}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
