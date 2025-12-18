
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Project } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { generateWithFlux } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import {
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Wand2,
  Youtube,
  Instagram,
  Crop,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import IdentitySelector from "@/components/upload/IdentitySelector";
import GenerationLoader from "@/components/common/GenerationLoader";
import SoothingLoader from "@/components/common/SoothingLoader";
import { createPageUrl } from "@/utils";
import { detectFaces } from "@/api/functions";
import LoginModal from "@/components/common/LoginModal";

// Helper: get error message
function getErrorMessage(err, fallback = "שגיאה לא צפויה") {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  // New Check for DatabaseTimeout
  const fullErrorString = JSON.stringify(err);
  if (fullErrorString.includes("DatabaseTimeout") || fullErrorString.includes("544")) {
    return "אירעה שגיאה זמנית בתקשורת עם מסד הנתונים. אנא נסו שוב בעוד מספר רגעים. אם הבעיה ממשיכה, אנא צרו קשר.";
  }

  // Check for the specific 451 status code for prohibited content
  if (err.response?.status === 451) {
    return "יצירת התמונה נחסמה בגלל תוכן רגיש. ה-AI זיהה מילים או דימויים שעלולים להיות קשורים לאלימות, כלי נשק, או נושאים אחרים שאינם מורשים. אנא נסו לחזור לשלב הניתוח וליצור פרומפט חדש, או תארו את הרעיון במילים עדינות יותר.";
  }

  const errorDetails = err?.response?.data?.error || err?.error || "";
  if (typeof errorDetails === 'string') {
    if (errorDetails.includes("Cloud Vision API has not been used") || errorDetails.includes("SERVICE_DISABLED")) {
      return "שגיאת הגדרה: שירות זיהוי הפנים של גוגל (Vision API) אינו מופעל. יש להפעיל אותו בחשבון Google Cloud שלך ולאחר מכן לנסות שוב.";
    }
    // הוספת בדיקה לשגיאה החדשה
    if (errorDetails.includes("API_KEY_SERVICE_BLOCKED") || errorDetails.includes("Requests to this API vision.googleapis.com method ... are blocked")) {
      return "שגיאת הרשאה: מפתח ה-API שלך חסום מלהשתמש בשירות זיהוי הפנים. יש לבדוק את הגדרות מפתח ה-API בחשבון Google Cloud ולוודא שהוא מורשה להשתמש ב-'Cloud Vision API'.";
    }
  }

  // Fallback check for the specific Gemini content policy error
  const details = err.response?.data?.details;
  if (details) {
    try {
      // The details might be a stringified JSON, so we parse it just in case.
      const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
      if (parsedDetails?.candidates?.[0]?.finishReason === "PROHIBITED_CONTENT") {
        return "יצירת התמונה נחסמה בגלל תוכן רגיש. ה-AI זיהה מילים או דימויים שעלולים להיות קשורים לאלימות, כלי נשק, או נושאים אחרים שאינם מורשים. אנא נסו ליצור מחדש את ניתוח התמונה עם קישור אחר, או תארו את הרעיעיון במילים עדינות יותר.";
      }
    } catch (e) {
      // Ignore parsing errors, proceed to other checks
    }
  }

  if (err.message && typeof err.message === "string" && err.message.trim()) return err.message;
  if (err.response?.data?.error) return String(err.response.data.error);
  if (err.error) return String(err.error);
  try { return JSON.stringify(err); } catch { return fallback; }
}

// NEW: Helper to process an image to fit target dimensions with "contain" logic (black borders)
const processImageToContain = async (file, currentAspectRatio) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // crossOrigin is usually relevant for images loaded from different origins via URL,
    // but less so for data URLs from FileReader. Keeping it is harmless.
    img.crossOrigin = 'Anonymous';
    img.onerror = () => reject(new Error('Failed to load image for processing.'));

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let targetWidth, targetHeight;
      if (currentAspectRatio === '16:9') {
        targetWidth = 1280; targetHeight = 720;
      } else if (currentAspectRatio === '3:4') {
        targetWidth = 1080; targetHeight = 1350;
      } else { // 1:1
        targetWidth = 1080; targetHeight = 1080;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill background with black to create letterboxes/pillarboxes
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate scale factor to fit the image within the canvas (contain logic)
      const scale = Math.min(targetWidth / img.width, targetHeight / img.height);

      // Calculate new dimensions and centered position
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;

      // Draw the scaled image onto the canvas
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Convert canvas to Blob (and then to File)
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], 'processed_user_image.jpeg', { type: 'image/jpeg', lastModified: Date.now() }));
        } else {
          reject(new Error('Failed to create blob from processed image.'));
        }
      }, 'image/jpeg', 0.95); // Using JPEG for potentially smaller file size and common use
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};


export default function UploadPage() {
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [originalFile, setOriginalFile] = useState(null); // <-- NEW: Stores the original file selected
  const [userImageUrl, setUserImageUrl] = useState(""); // Stores URL for preview (local or uploaded)
  const [isUploading, setIsUploading] = useState(false); // Used for both upload and local processing
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [aspectRatio, setAspectRatio] = useState('16:9');
  // New states for loading and face detection
  const [isLoading, setIsLoading] = useState(true); // Initial page load state
  const [detectingFaces, setDetectingFaces] = useState(false); // State for when face detection is running
  const [detectedFaces, setDetectedFaces] = useState([]); // <-- NEW: Array of detected face coordinates
  const [showLoginModal, setShowLoginModal] = useState(false); // <-- הוספת מצב עבור מודל התחברות


  const navigate = useNavigate();
  const location = useLocation();

  // Helper: retry UploadFile - Wrapped in useCallback for memoization
  const uploadWithRetry = useCallback(async (file, retries = 4) => {
    if (!(file instanceof File) || !file.size) {
      throw new Error("קובץ לא תקין להעלאה");
    }
    let lastErr;
    for (let i = 0; i <= retries; i++) {
      try {
        return await UploadFile({ file });
      } catch (e) {
        lastErr = e;
        if (i < retries) {
          const delayMs = 1000 * Math.pow(2, i); // Exponential backoff: 1s, 2s, 4s, 8s
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }
    throw lastErr || new Error("שגיאה לא ידועה בהעלאה");
  }, []);

  // Load project and user
  const loadProjectAndUser = useCallback(async (projectId) => {
    setIsLoading(true); // Start loading the page
    try {
      const foundProject = await Project.get(projectId);
      if (foundProject) {
        setProject(foundProject);

        // Skip if already generated
        if (foundProject.flux_result_image_url) {
          navigate(createPageUrl(`Editor?project=${projectId}`));
          return; // Exit early as we are redirecting
        }

        // If project has an existing user image URL, set it for display and trigger face detection
        // user_image_url should now point to a processed image (with black bars) if recently uploaded
        if (foundProject.user_image_url) {
          setUserImageUrl(foundProject.user_image_url);
          // Attempt face detection, but don't let it block the flow on initial load
          try {
            setDetectingFaces(true); // Start face detection
            const { data } = await detectFaces({ image_url: foundProject.user_image_url }); // Updated call based on outline's data structure expectation
            setDetectedFaces(data.faces || []); // Store faces directly
          } catch (faceDetectionError) {
            console.warn("Face detection failed during initial load, but proceeding anyway:", faceDetectionError);
            setDetectedFaces([]);
          } finally {
            setDetectingFaces(false); // End face detection
          }
        }
      } else {
        navigate(createPageUrl("Home"), { replace: true });
        return; // Exit early as we are redirecting
      }

      const u = await User.me();
      setUser(u);
    } catch (err) {
      console.error("Error loading project or user:", err);
      setUser(null); // Ensure user is null on error
      if (err.response?.status !== 401) { // If not an authentication error, redirect to home
        navigate(createPageUrl("Home"), { replace: true });
      }
    } finally {
      setIsLoading(false); // End page loading regardless of success/failure
      setDetectingFaces(false); // Ensure detection flag is reset
    }
  }, [navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const projectId = urlParams.get("project");

    if (projectId) {
      loadProjectAndUser(projectId);
    } else {
      navigate(createPageUrl("Home"), { replace: true });
    }

    window.scrollTo(0, 0);
  }, [loadProjectAndUser, location.search, navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]; // Handle both input and drag-drop
    if (!file || !file.type.startsWith('image/')) {
      setError("אנא בחר קובץ תמונה תקין");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for original input file
      setError("קובץ התמונה גדול מדי (מקסימום 10MB)");
      return;
    }
    setOriginalFile(file); // Store the original file
    setError("");
  };

  const processAndUpload = useCallback(async () => {
    if (!originalFile || !project?.id) { // Ensure originalFile and project are available
      setUserImageUrl(""); // Clear image if no file to process
      setDetectedFaces([]);
      return;
    }

    setIsUploading(true); // Indicate that processing and uploading are in progress
    setError("");
    setDetectedFaces([]); // Reset face detection states on new processing

    try {
      // 1. Process and upload the image. This part is critical.
      const processedFile = await processImageToContain(originalFile, aspectRatio);
      const { file_url } = await uploadWithRetry(processedFile);
      setUserImageUrl(file_url); // Update local state for preview
      await Project.update(project.id, { user_image_url: file_url });

      // 2. Attempt face detection, but don't let it block the flow.
      try {
        setDetectingFaces(true);
        const { data } = await detectFaces({ image_url: file_url });
        setDetectedFaces(data.faces || []);
      } catch (faceDetectionError) {
        console.warn("Face detection failed, but proceeding anyway:", faceDetectionError);
        // We catch the error here, log it, but don't set a blocking error message.
        // We simply leave detectedFaces as an empty array.
        setDetectedFaces([]);
      }

    } catch (err) {
      // This main catch block will now only handle critical errors from image processing or uploading.
      console.error("Critical Upload/Processing failed:", err);
      const specificErrorMessage = getErrorMessage(err);

      if (err.response?.status === 401) {
        setShowLoginModal(true);
        setError("עליך להתחבר כדי להעלות תמונה.");
      } else {
        setError(specificErrorMessage);
      }
      setUserImageUrl("");
      setDetectedFaces([]);
    } finally {
      setIsUploading(false); // End upload/processing indication
      setDetectingFaces(false); // Ensure detection flag is reset
    }
  }, [originalFile, aspectRatio, project, uploadWithRetry]);

  useEffect(() => {
    processAndUpload();
  }, [processAndUpload]); // Trigger processing when originalFile or aspectRatio changes

  const handleGenerate = async (identityRefs = []) => { // Takes identityRefs from IdentitySelector
    setError(""); // Clear previous errors

    // Re-authenticate and check credits right before generation
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        setError("סשן ההתחברות פג. אנא התחברו מחדש כדי להמשיך.");
        return;
      }
      if ((currentUser.credits || 0) < 1) {
        setError("אין מספיק קרדיטים ליצירת תמונה. אנא רכשו קרדיטים נוספים.");
        return;
      }

      setIsGenerating(true);

      let targetWidth, targetHeight, sizePresetValue;

      // Determine target dimensions based on aspect ratio
      if (aspectRatio === '16:9') {
        targetWidth = 1280; targetHeight = 720; sizePresetValue = 'youtube';
      } else if (aspectRatio === '3:4') {
        targetWidth = 1080; targetHeight = 1350; sizePresetValue = 'instagram';
      } else { // 1:1
        targetWidth = 1080; targetHeight = 1080; sizePresetValue = 'square';
      }

      const hebrewTitle = project.hebrew_headline || project.youtube_video_title || '';
      const userPrompt = project.thumbnail_prompt || hebrewTitle || 'viral thumbnail';

      // NEW: Enhanced prompt to explicitly instruct frame filling
      const finalPrompt = `Create a cinematic, ultra-high quality, viral thumbnail based on the provided image and subject: "${userPrompt}". Fill the entire frame seamlessly, ensuring no empty spaces. Enhance the lighting, colors, and composition. Maintain the subject's identity, ensuring no changes to their facial features. Do not add any text. The subject is already centered in the provided image; integrate them into a full, seamless scene, extending the background to fill all black areas.`;

      const response = await generateWithFlux({
        text_prompt: finalPrompt,
        user_images: [userImageUrl], // Send the *already processed* user image URL
        identity_refs: identityRefs,
        width: targetWidth,
        height: targetHeight,
      });

      const resultImageBase64 = response?.data?.imagesBase64?.[0];

      if (resultImageBase64) {
        // Decode base64 and upload the final result
        const resultFile = new File([new Uint8Array(atob(resultImageBase64).split("").map(c => c.charCodeAt(0)))], `flux_result_${project.id}.png`, { type: "image/png" });
        const { file_url: fluxResultUrl } = await uploadWithRetry(resultFile);

        await Project.update(project.id, {
          flux_result_image_url: fluxResultUrl,
          user_image_url: userImageUrl, // Keep reference to the *processed* user image URL
          size_preset: sizePresetValue,
          status: "flux_generated",
          thumbnail_prompt: project.thumbnail_prompt || project.hebrew_headline || 'a viral, high-energy scene' // Save the original prompt idea based on previous logic
        });

        navigate(createPageUrl(`Editor?project=${project.id}`));
      } else {
        const errorMessage = response?.data?.error?.message || response?.data?.error || "לא התקבלה תמונה מה-AI";
        const details = response?.data?.details ? `פרטים: ${JSON.stringify(response.data.details)}` : '';
        throw new Error(`${errorMessage}. ${details}`);
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };


  // Loading states based on outline
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <GenerationLoader phase="loading" />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <GenerationLoader phase="generating" />
      </div>
    );
  }

  if (!user && !showLoginModal) { // Only show login if not loading, not generating, user is null, and modal isn't already showing
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-xl bg-neutral-800 border-neutral-700">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-xl font-bold text-neutral-100 hebrew-font">נדרש להתחבר</h2>
              <p className="text-neutral-400 hebrew-font">כדי להשתמש בטכנולוגיית ה-AI עליך להתחבר לחשבון.</p>
              <Button
                className="btn-primary hebrew-font"
                onClick={() => setShowLoginModal(true)}
              >
                התחבר והמשך ליצירה
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If we reach here, project should be loaded due to the isLoading check and redirects.
  // This check acts as a safeguard.
  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <SoothingLoader label="טוען פרויקט..." />
      </div>
    );
  }

  // Determine target dimensions for face box calculations based on current aspect ratio
  let previewWidth = 1080;
  let previewHeight = 1080; // Default for 1:1
  if (aspectRatio === '16:9') {
    previewWidth = 1280;
    previewHeight = 720;
  } else if (aspectRatio === '3:4') {
    previewWidth = 1080;
    previewHeight = 1350;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100" dir="rtl">
      {/* הוספת מודל התחברות */}
      <LoginModal isOpen={showLoginModal} setIsOpen={setShowLoginModal} />

      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="הטאץ' האישי שלך"
          subtitle="העלה תמונה ברורה של פנים, בחר יחס תמונה, וה-AI ישמור על הזהות שלך בזמן שהוא יוצר קאבר ויראלי חדש."
        />

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <AlertCircle className="h-4 w-4 ml-2" />
            <AlertDescription className="hebrew-font">{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl p-4 sm:p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

              {/* Left: Image Upload & Preview */}
              <div className="space-y-4">
                <div className="relative aspect-[16/9] bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors overflow-hidden">
                  {userImageUrl ? (
                    <>
                      <img src={userImageUrl} alt="Uploaded Preview" className="w-full h-full object-contain rounded-lg bg-black" />
                      {detectedFaces.map((face, index) => (
                        <div
                          key={index}
                          className="absolute border-2 border-cyan-400 bg-cyan-400/20 rounded-md"
                          style={{
                            left: `${(face.x / previewWidth) * 100}%`,
                            top: `${(face.y / previewHeight) * 100}%`,
                            width: `${(face.width / previewWidth) * 100}%`,
                            height: `${(face.height / previewHeight) * 100}%`,
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 p-4">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="hebrew-font">תצוגה מקדימה</p>
                    </div>
                  )}
                  {(isUploading || detectingFaces) && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                      <Loader2 className="animate-spin w-8 h-8" />
                      <p className="mt-2 hebrew-font">{isUploading ? 'מעבד תמונה...' : 'מזהה פנים...'}</p>
                    </div>
                  )}
                </div>
                <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*" />
                <Button asChild className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl">
                  <label htmlFor="file-upload">
                    בחר תמונה מהמחשב
                  </label>
                </Button>
              </div>

              {/* Right: Controls & Generation */}
              <div className="space-y-6">
                {/* Aspect Ratio Selector */}
                <div>
                  <h3 className="text-lg font-semibold hebrew-font text-gray-800 mb-3">1. בחר יחס תמונה</h3>
                  <div className="flex gap-4">
                    {['16:9', '1:1', '3:4'].map(ratio => (
                      <Button
                        key={ratio}
                        variant={aspectRatio === ratio ? "default" : "outline"}
                        onClick={() => setAspectRatio(ratio)}
                        className={`flex-1 h-12 text-sm ${aspectRatio === ratio ?
                          'bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-lg' :
                          'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                          } flex items-center justify-center transition-all duration-200`}
                      >
                        {ratio === '16:9' ? (
                          <>
                            <Youtube className="ml-2 w-4 h-4" /> YouTube
                          </>
                        ) : ratio === '1:1' ? (
                          <>
                            <Crop className="ml-2 w-4 h-4" /> ריבוע
                          </>
                        ) : (
                          <>
                            <Instagram className="ml-2 w-4 h-4" /> סטורי/רילס
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generation Step */}
                {userImageUrl && !isUploading && ( // Only show if image is uploaded and not currently processing
                  <div>
                    <h3 className="text-lg font-semibold hebrew-font text-gray-800 mb-3">2. צור גרסה חדשה</h3>
                    {detectingFaces ? (
                      <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 rounded-xl p-4">
                        <Loader2 className="animate-spin w-5 h-5 text-purple-500" />
                        <span className="hebrew-font">מזהה פנים...</span>
                      </div>
                    ) : detectedFaces.length > 0 ? (
                      <IdentitySelector onGenerate={handleGenerate} isDisabled={isGenerating} peopleCount={detectedFaces.length} />
                    ) : (
                      // Fallback to direct generate if no faces are detected or detection failed
                      <Button
                        onClick={() => handleGenerate([])}
                        disabled={isGenerating || !userImageUrl}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 rounded-xl"
                      >
                        <Wand2 className="w-5 h-5" />
                        צור גרסה חדשה
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
