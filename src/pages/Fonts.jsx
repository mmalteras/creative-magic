
import React, { useState, useEffect, useRef } from "react";
import { Font } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import PageHeader from "@/components/common/PageHeader";
import {
  Type,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function FontsPage() {
  const [fonts, setFonts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    file: null,
    is_hebrew_friendly: true,
    preview_text: "הטקסט הכי יפה בעולם"
  });
  const [error, setError] = useState("");

  const fileInputRef = useRef(null); // Ref for clearing the file input

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (user) {
        const userFonts = await Font.filter({ created_by: user.email }, "-created_date");
        setFonts(userFonts);
      } else {
        setFonts([]);
        setError("שגיאה בטעינת הגופנים. ייתכן שיש צורך להתחבר.");
      }
    } catch (err) {
      console.error("Error loading fonts:", err);
      setError("שגיאה בטעינת הגופנים. ייתכן שיש צורך להתחבר.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2'];
      const validType = allowedTypes.includes(file.type) || /\.(ttf|otf|woff|woff2)$/i.test(file.name);
      if (validType && file.size > 0) {
        setFormData(prev => ({
          ...prev,
          file,
          name: prev.name || file.name.replace(/\.[^/.]+$/, "") // Set name from file if not already set
        }));
        setError("");
      } else {
        setFormData(prev => ({ ...prev, file: null }));
        setError("אנא בחר קובץ גופן תקין (TTF, OTF, WOFF, WOFF2)");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file || !(formData.file instanceof File) || formData.file.size <= 0) {
      setError("אנא בחר קובץ גופן תקין להעלאה.");
      return;
    }
    if (!formData.name.trim()) {
      setError("אנא הזן שם לגופן.");
      return;
    }

    // Additional file type validation, consistent with outline's approach
    const allowedTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2'];
    const isFileValid = allowedTypes.includes(formData.file.type) || /\.(ttf|otf|woff|woff2)$/i.test(formData.file.name);
    if (!isFileValid) {
        setError("סוג קובץ לא נתמך. אנא העלה קובץ TTF, OTF, WOFF, או WOFF2.");
        return;
    }

    setIsUploading(true);
    setError("");

    try {
      const { file_url } = await UploadFile({ file: formData.file });
      const user = await User.me();
      if (!user) {
        setError("שגיאה: לא ניתן לזהות את המשתמש. אנא התחבר מחדש.");
        setIsUploading(false);
        return;
      }

      const newFont = await Font.create({
        name: formData.name,
        file_url,
        is_hebrew_friendly: formData.is_hebrew_friendly,
        preview_text: formData.preview_text,
        created_by: user.email
      });

      // Update state to immediately display the new font
      setFonts(prev => [...prev, newFont]);

      // Reset form and close it
      setFormData({ name: "", file: null, is_hebrew_friendly: true, preview_text: "הטקסט הכי יפה בעולם" });
      setShowUploadForm(false);

      // Reset the file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error("Error submitting font:", err);
      setError("שגיאה בהעלאת הגופן. אנא נסה שוב.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFont = async (fontId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק גופן זה? הפעולה אינה הפיכה.")) {
      try {
        await Font.delete(fontId);
        setFonts(prev => prev.filter(font => font.id !== fontId)); // Immediately remove from UI
      } catch (err) {
        console.error("Error deleting font:", err);
        setError("שגיאה במחיקת הגופן");
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <PageHeader
          title="ניהול גופנים אישיים"
          subtitle="העלו גופנים שאתם אוהבים והשתמשו בהם ישירות בעורך – בעברית מושלמת"
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full md:w-auto flex justify-end" /* Added for correct positioning of button in new header structure */
          >
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 hebrew-font shadow-lg shadow-red-500/20"
            >
              <Plus className="w-4 h-4 ml-2" />
              {showUploadForm ? 'סגור טופס' : 'הוסף גופן חדש'}
            </Button>
          </motion.div>
        </div>
        <p className="text-xs text-neutral-400 hebrew-font text-center mb-8">
              העלו קובץ גופן לשילוב טקסטים ייחודיים בעיצובים שלכם
            </p>

        {error && <Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription className="hebrew-font">{error}</AlertDescription></Alert>}

        {showUploadForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-xl shadow-black/20 mb-8 bg-neutral-800 border-neutral-700">
              <CardHeader><CardTitle className="flex items-center gap-2 hebrew-font text-neutral-200"><Upload className="w-5 h-5 text-purple-400" />העלאת גופן</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="font-name" className="hebrew-font text-neutral-300">שם הגופן</Label>
                      <Input id="font-name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="לדוגמה: Rubik Hebrew" className="hebrew-font bg-neutral-900 border-neutral-600 text-white" dir="rtl"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="font-file" className="hebrew-font text-neutral-300">קובץ גופן</Label>
                      <Input id="font-file" type="file" ref={fileInputRef} accept=".ttf,.otf,.woff,.woff2" onChange={handleFileSelect} className="cursor-pointer file:text-violet-300 file:bg-neutral-700 file:border-0 file:rounded-md file:px-3 file:py-2 file:mr-3"/>
                      <p className="text-sm text-neutral-400 hebrew-font">נתמך: TTF, OTF, WOFF, WOFF2</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preview-text" className="hebrew-font text-neutral-300">טקסט לתצוגה מקדימה</Label>
                    <Input id="preview-text" value={formData.preview_text} onChange={(e) => setFormData(prev => ({ ...prev, preview_text: e.target.value }))} className="hebrew-font bg-neutral-900 border-neutral-600 text-white" dir="rtl"/>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="hebrew-friendly" checked={formData.is_hebrew_friendly} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_hebrew_friendly: checked }))}/>
                    <Label htmlFor="hebrew-friendly" className="hebrew-font mr-2 text-neutral-300">גופן תומך עברית</Label>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isUploading} className="bg-purple-600 hover:bg-purple-700 text-white hebrew-font">
                      {isUploading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin"/>מעלה...</> : <><Upload className="w-4 h-4 ml-2"/>העלה גופן</>}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)} className="hebrew-font border-neutral-600 hover:bg-neutral-700">ביטול</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400"/></div>
        ) : fonts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fonts.map((font, index) => (
              <motion.div key={font.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 bg-neutral-800 border-neutral-700 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-neutral-200">
                      <span className="hebrew-font">{font.name}</span>
                      {font.is_hebrew_friendly && <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full hebrew-font border border-green-500/30">תומך עברית</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <style>{`@font-face { font-family: "${font.name}"; src: url(${font.file_url}); }`}</style>
                    <div className="p-4 bg-neutral-900/70 rounded-lg text-center hebrew-font border border-neutral-700 text-neutral-100" style={{ fontFamily: `"${font.name}", Noto Sans Hebrew, Arial`, fontSize: '20px' }}>
                      {font.preview_text}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(font.file_url, '_blank')} className="flex-1 hebrew-font border-neutral-600 hover:bg-neutral-700"><Download className="w-4 h-4 ml-1"/>הורד</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteFont(font.id)} className="hebrew-font"><Trash2 className="w-4 h-4"/></Button>
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
            className="text-center col-span-full p-12 bg-neutral-800/50 rounded-lg shadow-md border border-neutral-700"
          >
            <Type className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-100 mb-2 hebrew-font">עוד אין גופנים באוסף האישי</h3>
            <p className="text-neutral-400 mb-4 hebrew-font">העלו גופן ראשון ותנו לטקסטים שלכם לבלוט בעורך של ThumbGenius.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
