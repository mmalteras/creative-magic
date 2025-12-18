
import React, { useState, useEffect, useCallback } from "react";
import { Business } from "@/api/entities";
import { CopyPersona } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { firecrawlScrape } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Building2,
  Globe,
  Users,
  Loader2,
  ChevronRight,
  FileText,
  Sparkles,
  User as UserIcon,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EditPersonaModal from "@/components/business/EditPersonaModal";
import BusinessDetailsModal from "@/components/business/BusinessDetailsModal";
import WebsiteScanner from "@/components/business/WebsiteScanner";

// הוספת פונקציית עזר לניהול קריאות API
const apiCallLimiter = {
  lastCall: 0,
  queue: [],
  processing: false,
  minDelay: 500, // חצי שנייה בין קריאות

  async schedule(apiFunction, context = '') {
    return new Promise((resolve, reject) => {
      this.queue.push({ apiFunction, resolve, reject, context });
      if (!this.processing) {
        this.processQueue();
      }
    });
  },

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    this.processing = true;

    const { apiFunction, resolve, reject, context } = this.queue.shift();
    
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastCall;
      await new Promise(res => setTimeout(res, waitTime));
    }

    try {
      this.lastCall = Date.now();
      const result = await apiFunction();
      resolve(result);
    } catch (error) {
      console.error(`API Error in ${context}:`, error);
      if (error.response?.status === 429) {
        console.warn(`Rate limit in ${context}. Re-queueing with delay.`);
        this.queue.unshift({ apiFunction, resolve, reject, context });
        await new Promise(res => setTimeout(res, 3000));
        this.processQueue();
      } else {
        reject(error);
      }
    }
    
    if (this.processing) {
        this.processQueue();
    }
  }
};

const formatDemographics = (demographics) => {
  if (!demographics) return '';
  if (typeof demographics === 'string') return demographics;
  if (typeof demographics === 'object') {
    return Object.values(demographics).filter(Boolean).join(', ');
  }
  return '';
};

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState([]);
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [inputMode, setInputMode] = useState("url"); // "url" or "text"
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  // Analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [suggestedPersonas, setSuggestedPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);

  // New state for modal and editing
  const [isEditModalOpen, setIsEditModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New state for business details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBusinessPersona, setSelectedBusinessPersona] = useState(null);

  const navigate = useNavigate();

  const getAnalysisFromContentPrompt = (content, url = '') => `
  אתה אסטרטג מותג ברמה עולמית ומומחה ליצירת פרסונות שיווקיות עמוקות.
  בהתבסס על תוכן האתר או התיאור העסקי הבא, צור ניתוח עסקי ו-5 פרסונות שיווק מפורטות.

  תוכן/תיאור לניתוח:
  ${content}
  ${url ? `\nכתובת האתר: ${url}` : ''}

  הנחיות כלליות:
  1. צור אובייקט JSON המכיל שלושה מפתחות: "business_name", "business_analysis" ו-"personas".
  2. "business_analysis" צריך להיות אובייקט המכיל את השדות הבאים: core_identity (תיאור תמציתי של זהות העסק), usp (הצעת מכירה ייחודית), ו-target_market_overview (סקירת קהל היעד).
  3. "personas" צריך להיות מערך של 5 אובייקטי פרסונה.
  4. כל פרסונה חייבת להיות בנויה לפי התבנית והדוגמאות המצורפות.

  ## תבנית מחייבת לכל פרסונה:

  לכל פרסונה, עליך לספק את השדות הבאים באובייקט ה-JSON שלה:
  - name: (string) כותרת ותיאור בסיסי (לדוגמה: "היזם החולם").
  - min_age: (number)
  - max_age: (number)
  - psychographics: (string) תיאור מפורט ומלא של הפרסונה לפי תבנית הטקסט הבאה. זהו השדה החשוב ביותר.
  - awareness_level: (number) מספר בין 1 ל-4.
  - sophistication_level: (string) "מתחיל" או "ביניים".
  - demographics, goals, frustrations, communication_channels, tone_of_voice, sample_hook_line, keywords: (string/array) לפי ההקשר.

  ### תבנית טקסט עבור שדה ה-psychographics:
  הטקסט בשדה ה-psychographics חייב לעקוב אחר המבנה הזה במדויק:

  [שם הדמות]
  גילאי [min_age]-[max_age]

  [שם הדמות] הוא/היא [תיאור קצר: עיסוק/מצב חיים].
  הוא/היא נמצא/ת כרגע ב־[מצב קיים: עבודה, לימודים, הורות, עצמאי].

  הוא/היא מתמודד/ת עם [קשיים, פחדים, תסכולים, לחצים].
  האתגרים המרכזיים: [חוסר ידע/ניסיון, פחד מכישלון, חוסר מימוש עצמי, תקרת זכוכית].

  עם זאת, [שם הדמות] חולם/ת על [שאיפות מרכזיות: עסק עצמאי, חופש כלכלי, שליטה על העתיד].
  הוא/היא רוצה להוכיח [למי? לעצמו/למשפחה/לחברים] שהוא/היא מסוגל/ת להצליח.

  מה הוא/היא מחפש/ת: [קורסים, הכשרות, ליווי, כלים פרקטיים].
  מה הוא/היא מעריך/ה: [פשטות, הדרכה צמודה, ידע מעשי, איזון].

  ### דוגמה לפרסונה תקינה (עליך ללמוד אותה וליצור פרסונות דומות):
  {
    "name": "היזם החולם",
    "min_age": 20,
    "max_age": 30,
    "psychographics": "היזם החולם\\nגילאי 20-30\\n\\nהיזם החולם הוא צעיר בשנות ה-20 לחייו, מלא באנרגיה ורעיונות. הוא תמיד חלם להקים עסק משלו, אך חסר לו הידע והניסיון הדרושים כדי להפוך את החלום למציאות.\\n\\nהוא מרגיש מתוסכל מכך שהוא רואה אחרים מצליחים בתחום היזמות בעוד הוא נשאר מאחור. הוא חושש מכישלון ומחוסר היכולת להרוויח כסף מהרעיון שלו. הוא מתמודד עם לחץ חברתי ומשפחתי להצליח ולהוכיח את עצמו.\\n\\nעם זאת, היזם החולם חולם על עצמאות כלכלית ושליטה על עתידו. הוא רוצה להוכיח לעצמו שהוא מסוגל להצליח.\\n\\nמה הוא מחפש: הכוונה ותמיכה, קורסים והכשרות שיעניקו לו כלים להקים מוצר SaaS.\\nמה הוא מעריך: פשטות, פתרונות שמעניקים ביטחון וכלים מעשיים.",
    "awareness_level": 2,
    "sophistication_level": "מתחיל"
  }

  קריטי: הפלט שלך חייב להיות רק אובייקט JSON, מתחיל ב-{ ומסתיים ב-}. ללא טקסט נוסף או markdown. הכל בעברית.`;

  // Helper function to clean LLM response from code blocks and trailing commas
  const cleanJsonResponse = (rawResponse) => {
    if (typeof rawResponse !== 'string') {
      return rawResponse;
    }
    
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    
    // Remove trailing commas that are invalid in JSON
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    
    return cleaned.trim();
  };

  const loadBusinesses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const userData = await apiCallLimiter.schedule(() => User.me(), 'User.me');
      setUser(userData);
      
      const businessList = await apiCallLimiter.schedule(() => Business.list(), 'Business.list');
      setBusinesses(businessList);
    } catch (err) {
      console.error("Error loading businesses:", err);
      setError('שגיאה בטעינת העסקים');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const triggerAnalysisFromScanner = (scannedUrl) => {
      setInputMode('url');
      setWebsiteUrl(scannedUrl);
      setBusinessName(''); // Clear any existing business name
      // Pass the scannedUrl directly to ensure the correct URL is used
      handleAnalyzeBusiness(false, scannedUrl);
  };

  const handleAnalyzeBusiness = async (isRefresh = false, initialUrl = null, initialDescription = null) => {
    // Determine the actual URL/description to use, prioritizing provided values
    const urlToUse = initialUrl || websiteUrl;
    const descriptionToUse = initialDescription || businessDescription;

    if (!isRefresh) { // Only validate for initial analysis
        if (inputMode === "url" && !urlToUse.trim()) {
            setError("אנא הזן קישור לאתר");
            return;
        }
        if (inputMode === "text" && !descriptionToUse.trim()) {
            setError("אנא תאר את העסק");
            return;
        }
    }

    setIsAnalyzing(true);
    setError("");

    try {
      let contentToAnalyze = "";

      if (isRefresh && analysisResult) {
        // For refresh, use the core_identity from the existing analysisResult
        // which acts as the main content summary.
        contentToAnalyze = analysisResult.core_identity;
        setLoadingStep("מרענן פרסונות...");
      } else if (inputMode === "url") {
        setLoadingStep("סורק את האתר...");
        const scrapeResponse = await apiCallLimiter.schedule(() => firecrawlScrape({ url: urlToUse }), 'firecrawlScrape');
        
        if (scrapeResponse.error || !scrapeResponse.data?.content) {
            throw new Error(scrapeResponse.error || "שגיאה בקבלת תוכן האתר.");
        }
        contentToAnalyze = scrapeResponse.data.content;
      } else { // inputMode === "text"
        setLoadingStep("מנתח את תיאור העסק...");
        contentToAnalyze = descriptionToUse;
      }

      setLoadingStep("מנתח את התוכן ומייצר פרסונות...");
      const analysisPrompt = getAnalysisFromContentPrompt(contentToAnalyze, urlToUse);
      
      const rawResponse = await apiCallLimiter.schedule(() => InvokeLLM({
          prompt: analysisPrompt,
          add_context_from_internet: false, // Context is explicitly provided via contentToAnalyze
      }), 'InvokeLLM for analysis');

      const cleanedResponse = cleanJsonResponse(rawResponse);
      const result = JSON.parse(cleanedResponse);

      // Set the automatically extracted business name if available
      if (result.business_name && !isRefresh) {
          setBusinessName(result.business_name);
      }

      setAnalysisResult(result.business_analysis);
      setSuggestedPersonas(result.personas || []);

    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "שגיאה בניתוח העסק. אנא נסה שוב.");
    } finally {
      setIsAnalyzing(false);
      setIsRefreshing(false);
      setLoadingStep("");
    }
  };
  
  const handleCreateBusiness = async () => {
    if (!selectedPersona) {
      setError("אנא בחר פרסונה");
      return;
    }
    if (!businessName.trim()) { // Validate business name here, after LLM provides it or user edits
      setError("אנא הזן שם עסק");
      return;
    }

    try {
      const persona = await apiCallLimiter.schedule(() => CopyPersona.create({
        persona_name: selectedPersona.name,
        tagline: selectedPersona.tagline,
        min_age: selectedPersona.min_age,
        max_age: selectedPersona.max_age,
        demographics: formatDemographics(selectedPersona.demographics),
        psychographics: selectedPersona.psychographics,
        goals: selectedPersona.goals,
        frustrations: selectedPersona.frustrations,
        communication_channels: selectedPersona.communication_channels,
        tone_of_voice: selectedPersona.tone_of_voice,
        sample_hook_line: selectedPersona.sample_hook_line,
        keywords: selectedPersona.keywords,
        awareness_level: selectedPersona.awareness_level, // New field
        sophistication_level: selectedPersona.sophistication_level, // New field
      }), 'CopyPersona.create');

      const business = await apiCallLimiter.schedule(() => Business.create({
        business_name: businessName,
        website_url: inputMode === "url" ? websiteUrl : "",
        ai_summary: `זהות ליבה: ${analysisResult?.core_identity}. הצעת מכירה ייחודית: ${analysisResult?.usp}.`,
        selected_persona_id: persona.id
      }), 'Business.create');

      setBusinesses(prev => [...prev, business]);

      setShowCreateForm(false);
      setBusinessName("");
      setWebsiteUrl("");
      setBusinessDescription("");
      setAnalysisResult(null);
      setSuggestedPersonas([]);
      setSelectedPersona(null);
      setInputMode("url");

    } catch (err) {
      console.error("Error creating business:", err);
      setError("שגיאה ביצירת העסק. אנא נסה שוב.");
    }
  };

  const handleEditPersona = (personaToEdit) => {
    setEditingPersona(personaToEdit);
    setIsEditModal(true);
  };

  const handleSavePersona = (updatedPersona) => {
    const originalName = editingPersona.name;
    setSuggestedPersonas(currentPersonas =>
        currentPersonas.map(p => p.name === originalName ? updatedPersona : p)
    );
    if (selectedPersona?.name === originalName) {
        setSelectedPersona(updatedPersona);
    }
    setEditingPersona(null);
  };

  const handleViewBusinessDetails = async (business) => {
    setSelectedBusiness(business);

    if (business.selected_persona_id) {
      try {
        const personas = await apiCallLimiter.schedule(() => CopyPersona.filter({ id: business.selected_persona_id }), 'CopyPersona.filter');
        setSelectedBusinessPersona(personas.length > 0 ? personas[0] : null);
      } catch (err) {
        console.error("Error fetching persona:", err);
        setSelectedBusinessPersona(null);
      }
    } else {
      setSelectedBusinessPersona(null);
    }
    setShowDetailsModal(true);
  };

  const handleNewConversation = (business) => {
    // יצירת שיחה חדשה עם פרמטר מיוחד שיגרום ליצירת שיחה חדשה
    navigate(createPageUrl(`CreativeHub?businessId=${business.id}&new=true`));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8" dir="rtl">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 overflow-auto" dir="rtl">
      <EditPersonaModal
            isOpen={isEditModalOpen}
            setIsOpen={setIsEditModal}
            persona={editingPersona}
            onSave={handleSavePersona}
        />
      <BusinessDetailsModal
        isOpen={showDetailsModal}
        setIsOpen={setShowDetailsModal}
        business={selectedBusiness}
        persona={selectedBusinessPersona}
      />
      <div className="max-w-6xl mx-auto pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-teal-500 to-purple-600 mb-4 hebrew-font">
            העסקים שלך
          </h1>
          <p className="text-xl text-gray-600 hebrew-font max-w-3xl mx-auto">
            צור פרופילים מפורטים לעסקים שלך וקבל פרסונות שיווק מותאמות ליצירת תוכן יעיל ומדויק
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <AlertDescription className="hebrew-font">{error}</AlertDescription>
          </Alert>
        )}

        {businesses.length === 0 && !showCreateForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Card className="p-12 bg-gradient-to-br from-purple-50 to-teal-50 border-purple-200">
              <CardContent className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 hebrew-font">
                  התחל ליצור עסקים חכמים
                </h3>
                <p className="text-gray-600 hebrew-font text-lg">
                  צור פרופיל מפורט לעסק שלך וקבל פרסונות שיווק מותאמות אישית
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white px-8 py-3 text-lg hebrew-font"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  צור עסק חדש
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : !showCreateForm ? (
          <div className="space-y-6">
            <div className="text-center">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white px-6 py-3 hebrew-font"
              >
                <Plus className="w-5 h-5 ml-2" />
                הוסף עסק חדש
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-purple-300 flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="hebrew-font text-xl text-gray-900 flex items-center">
                        <Building2 className="w-6 h-6 ml-2 text-purple-600" />
                        {business.business_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="space-y-3 flex-grow">
                        {business.website_url && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Globe className="w-4 h-4 ml-2" />
                            {business.website_url}
                          </div>
                        )}
                        <p className="text-gray-700 hebrew-font text-sm line-clamp-3">
                          {business.ai_summary}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewBusinessDetails(business)}
                        >
                          <ChevronRight className="w-4 h-4 ml-2" />
                          צפה בפרטים
                        </Button>
                        <Button
                          className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                          onClick={() => handleNewConversation(business)}
                        >
                          <MessageSquare className="w-4 h-4 ml-2" />
                          שיחה חדשה
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl hebrew-font text-gray-900">
                  צור עסק חדש
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analysisResult ? (
                  isAnalyzing ? (
                     <div className="flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                        <h3 className="text-xl font-semibold hebrew-font text-gray-800">{loadingStep || 'מעבד...'}</h3>
                        <p className="text-gray-600 hebrew-font">זה עשוי לקחת מספר רגעים, תלוי באתר...</p>
                      </div>
                  ) : (
                    inputMode === 'text' ? (
                       <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 hebrew-font mb-2">
                            תאר את העסק שלך
                            </label>
                            <Textarea
                            value={businessDescription}
                            onChange={(e) => setBusinessDescription(e.target.value)}
                            placeholder="תאר מה העסק עושה, מה המוצרים/שירותים, מי קהל היעד..."
                            className="hebrew-font min-h-32"
                            dir="rtl"
                            />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => handleAnalyzeBusiness(false)}
                            disabled={isAnalyzing}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white h-12"
                          >
                            <Sparkles className="w-5 h-5 ml-2" />
                            נתח ויצור פרסונות
                          </Button>
                           <Button
                            variant="outline"
                            onClick={() => { setShowCreateForm(false); setInputMode('url'); }}
                          >
                            ביטול
                          </Button>
                        </div>
                      </div>
                    ) : (
                       <WebsiteScanner 
                        onAnalyze={triggerAnalysisFromScanner}
                        onSkip={() => setInputMode('text')} 
                      />
                    )
                  )
                ) : (
                  <div className="space-y-8">
                    <Card className="bg-gradient-to-br from-purple-50 to-teal-50 border-purple-200">
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-purple-200">
                          <FileText className="w-8 h-8 text-purple-600" />
                        </div>
                        <CardTitle className="hebrew-font text-2xl text-gray-900">פרופיל העסק שלך</CardTitle>
                        <p className="text-gray-600 hebrew-font">זה הפרופיל שיצרנו עבורך. ניתן לערוך את הפרטים לפני שמירה.</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                              <h4 className="font-bold text-lg hebrew-font text-gray-900">פרטי העסק</h4>
                              <p className="text-sm text-gray-600 hebrew-font">שם העסק (ניתן לעריכה)</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <Input
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              placeholder="הזן את שם העסק"
                              className="hebrew-font mb-3 text-lg font-semibold"
                              dir="rtl"
                            />
                            <p className="text-gray-700 hebrew-font text-sm leading-relaxed">תיאור העסק (מנתח)</p>
                            <p className="text-gray-600 hebrew-font text-sm mt-2">{analysisResult.core_identity}</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                              <h4 className="font-bold text-lg hebrew-font text-gray-900">קהל יעד</h4>
                            </div>
                          </div>
                          <p className="text-gray-700 hebrew-font text-sm leading-relaxed">
                            {analysisResult.target_market_overview}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-teal-100 rounded-2xl flex items-center justify-center border border-purple-200">
                          <UserIcon className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold hebrew-font text-gray-900 mb-2">דמויות קהל יעד</h3>
                        <p className="text-gray-600 hebrew-font">בחר דמות קהל יעד אחת התואמת לעסק שלך. ניתן לערוך ולהתאים אותה</p>
                        <p className="text-gray-600 hebrew-font">לפני הצורך.</p>
                        <div className="flex justify-center mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnalyzeBusiness(true)}
                            disabled={isRefreshing}
                            className="flex items-center gap-2"
                          >
                            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
                            <span className="hebrew-font">רענן פרסונות</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {suggestedPersonas.map((persona, index) => (
                          <div
                            key={index}
                            className={`bg-white rounded-xl p-5 shadow-sm border transition-all duration-300 ${
                              selectedPersona?.name === persona.name
                                ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:border-purple-200 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <button
                                  onClick={() => setSelectedPersona(persona)}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedPersona?.name === persona.name
                                      ? 'border-purple-500 bg-purple-500'
                                      : 'border-gray-300 hover:border-purple-400'
                                  }`}
                                >
                                  {selectedPersona?.name === persona.name && (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  )}
                                </button>
                                
                                <div className="flex-1 text-right">
                                  <div className="flex items-center justify-between mb-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleEditPersona(persona); }}
                                      className="text-gray-400 hover:text-purple-600"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <div className="text-right">
                                      <h4 className="font-bold text-lg hebrew-font text-gray-900">{persona.name}</h4>
                                      <p className="text-sm text-gray-500 hebrew-font">
                                        גיל: {persona.min_age}-{persona.max_age}, {formatDemographics(persona.demographics)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <p className="text-gray-700 hebrew-font text-sm leading-relaxed line-clamp-2">
                                    {persona.psychographics}
                                  </p>
                                  
                                  {persona.keywords && persona.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3 justify-end">
                                      {persona.keywords.slice(0, 3).map(keyword => (
                                        <span key={keyword} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={handleCreateBusiness}
                        disabled={!selectedPersona || !businessName.trim()} // Also disable if business name is empty
                        className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white px-12 py-4 text-lg hebrew-font rounded-xl shadow-lg"
                      >
                        המשך לצ'אט עם הפרסונה
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnalysisResult(null);
                          setSuggestedPersonas([]);
                          setSelectedPersona(null);
                          setBusinessName(""); // Clear business name as we're resetting
                          setWebsiteUrl("");
                          setBusinessDescription("");
                          setInputMode("url");
                        }}
                        className="mr-4"
                      >
                        חזור לעריכה
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
