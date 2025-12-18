
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import IconLibrary from "./IconLibrary";
import EmojiPicker from "./EmojiPicker";
import GradientControls from "./GradientControls";
import { UploadFile } from "@/api/integrations"; // New Import
import { Font } from "@/api/entities"; // New Import
import {
  Type,
  ImageIcon,
  Palette,
  Sparkles,
  Layers,
  Settings,
  Trash2,
  Copy,
  X,
  Plus,
  Wand2,
  Zap,
  Eye,
  EyeOff,
  Loader2 // New Import
} from "lucide-react";

const isSingleEmoji = (str) => {
    if (typeof str !== 'string') return false;
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\uFE0F|\u200D)/g;
    return str.replace(emojiRegex, '').trim().length === 0 && str.length > 0;
};

const CreativeToolCard = ({ icon: Icon, title, description, onClick, accent = "purple" }) => {
  const accentColors = {
    purple: "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
    teal: "from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700", 
    orange: "from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700",
    green: "from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
  };

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-200">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accentColors[accent]} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-200`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1 hebrew-font">{title}</h3>
        <p className="text-xs text-slate-400 hebrew-font leading-tight">{description}</p>
      </div>
    </div>
  );
};

const PropertySection = ({ title, icon: Icon, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors duration-150 mb-2"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-slate-200 hebrew-font">{title}</span>
        </div>
        <div className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {expanded && (
        <div className="space-y-3 px-1">
          {children}
        </div>
      )}
    </div>
  );
};

const ModernSlider = ({ label, value, onChange, min, max, step = 1, unit = "", ...props }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label className="text-xs font-medium text-slate-300 hebrew-font">{label}</Label>
      <span className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded">
        {Math.round(value)}{unit}
      </span>
    </div>
    <div className="relative">
      <Slider 
        value={[value]} 
        onValueChange={([val]) => onChange(val)} 
        min={min} 
        max={max} 
        step={step}
        className="w-full" 
        {...props} 
      />
    </div>
  </div>
);

const ModernColorPicker = ({ label, value, onChange, swatches = [] }) => (
  <div className="space-y-2">
    <Label className="text-xs font-medium text-slate-300 hebrew-font">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-full border-2 border-slate-600 bg-transparent cursor-pointer shadow-sm"
      />
      <div className="flex gap-1">
        {swatches.slice(0, 4).map((color, index) => (
          <button
            key={index}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
              value === color ? 'border-purple-400 scale-110' : 'border-slate-600 hover:border-slate-500'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  </div>
);

const TextEditor = ({ selectedElement, onUpdateElement, projectColors, fonts, sizePreset = "youtube" }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadingFont, setUploadingFont] = useState(false);
  const [fontFile, setFontFile] = useState(null);
  const [fontName, setFontName] = useState("");

  if (!selectedElement || selectedElement.type !== 'text') return null;

  const isEmoji = isSingleEmoji(selectedElement.content);
  const maxFont = (sizePreset === 'instagram' || sizePreset === 'square') ? 350 : 450;

  const handleFontUpload = async () => {
    if (!fontFile || !fontName.trim()) return;
    
    setUploadingFont(true);
    try {
      const { file_url } = await UploadFile({ file: fontFile });
      
      const newFont = await Font.create({
        name: fontName,
        file_url: file_url,
        is_hebrew_friendly: true,
        preview_text: "אבגדה ABCDE 12345"
      });

      // עדכון רשימת הגופנים
      // Note: Directly modifying the 'fonts' prop can be an anti-pattern in React.
      // A more robust solution might involve an 'onAddFont' prop to update fonts in the parent state.
      fonts.push(newFont); 
      
      // סגירת הדיאלוג ואיפוס השדות
      setIsUploadDialogOpen(false);
      setFontFile(null);
      setFontName("");
      
      // החלת הגופן החדש על הטקסט הנוכחי
      onUpdateElement(selectedElement.id, { fontFamily: `"${newFont.name}"` });
      
    } catch (error) {
      console.error("Error uploading font:", error);
      alert("שגיאה בהעלאת הגופן. נסה שוב.");
    } finally {
      setUploadingFont(false);
    }
  };

  if (isEmoji) {
    return (
      <PropertySection title="הגדרות אימוג'י" icon={Sparkles}>
        <ModernSlider
          label="גודל"
          value={Math.min(selectedElement.fontSize, maxFont)}
          onChange={(value) => onUpdateElement(selectedElement.id, { fontSize: value })}
          min={20}
          max={maxFont}
          unit="px"
        />
      </PropertySection>
    );
  }

  return (
    <div className="space-y-1">
      <PropertySection title="תוכן וטקסט" icon={Type}>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-slate-300 hebrew-font mb-1 block">תוכן</Label>
            <Textarea
              value={selectedElement.content}
              onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
              className="bg-slate-800/50 border-slate-600/50 text-slate-200 hebrew-font text-sm min-h-[80px] resize-none focus:border-purple-400"
              dir="rtl"
              placeholder="הקלד טקסט..."
            />
          </div>
          
          <div>
            <Label className="text-xs font-medium text-slate-300 hebrew-font mb-1 block">גופן</Label>
            <Select value={selectedElement.fontFamily || ''} onValueChange={(value) => onUpdateElement(selectedElement.id, { fontFamily: value, fontWeight: 'normal' })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-200 hebrew-font">
                <SelectValue placeholder="בחר גופן" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Noto Sans Hebrew, Arial">Noto Sans Hebrew</SelectItem>
                <SelectItem value="Arial Hebrew, Arial">Arial Hebrew</SelectItem>
                <SelectItem value="Rubik, sans-serif">Rubik</SelectItem>
                <SelectItem value="Heebo, sans-serif">Heebo</SelectItem>
                {fonts.map(font => (
                  <SelectItem key={font.id} value={`"${font.name}"`}>{font.name}</SelectItem>
                ))}
                
                {/* אופציית העלאת גופן */}
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="px-2 py-1.5 text-sm cursor-pointer hover:bg-slate-700/50 transition-colors rounded-sm border-t border-slate-700 mt-1">
                      <div className="flex items-center gap-2 text-purple-400 font-medium hebrew-font">
                        <Plus className="w-4 h-4" />
                        העלה גופן חדש
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                      <DialogTitle className="hebrew-font text-slate-100">העלאת גופן חדש</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-4">
                      <div>
                        <Label className="text-xs font-medium text-slate-300 hebrew-font mb-2 block">שם הגופן</Label>
                        <Input
                          value={fontName}
                          onChange={(e) => setFontName(e.target.value)}
                          placeholder="הכנס שם לגופן..."
                          className="bg-slate-800/50 border-slate-600/50 text-slate-200 hebrew-font"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-slate-300 hebrew-font mb-2 block">קובץ הגופן</Label>
                        <input
                          type="file"
                          accept=".ttf,.otf,.woff,.woff2"
                          onChange={(e) => setFontFile(e.target.files?.[0] || null)}
                          className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer"
                        />
                        <p className="text-xs text-slate-500 mt-1 hebrew-font">
                          פורמטים נתמכים: TTF, OTF, WOFF, WOFF2
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsUploadDialogOpen(false)}
                          className="hebrew-font text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-200"
                        >
                          ביטול
                        </Button>
                        <Button
                          onClick={handleFontUpload}
                          disabled={!fontFile || !fontName.trim() || uploadingFont}
                          className="bg-purple-500 hover:bg-purple-600 hebrew-font"
                        >
                          {uploadingFont ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              מעלה...
                            </div>
                          ) : (
                            'העלה גופן'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ModernSlider
              label="גודל"
              value={Math.min(selectedElement.fontSize, maxFont)}
              onChange={(value) => onUpdateElement(selectedElement.id, { fontSize: value })}
              min={12}
              max={maxFont}
              unit="px"
            />
            <ModernSlider
              label="ריווח שורות"
              value={selectedElement.lineHeight || 1.2}
              onChange={(value) => onUpdateElement(selectedElement.id, { lineHeight: value })}
              min={0.8}
              max={2.5}
              step={0.1}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-300 hebrew-font mb-2 block">יישור</Label>
            <div className="flex gap-1">
              {[
                { value: 'right', icon: '→' },
                { value: 'center', icon: '↔' },
                { value: 'left', icon: '←' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => onUpdateElement(selectedElement.id, { textAlign: option.value })}
                  className={`flex-1 h-8 rounded-lg text-sm font-mono transition-all duration-150 ${
                    selectedElement.textAlign === option.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PropertySection>

      <PropertySection title="צבעים ומילוי" icon={Palette}>
        <div className="space-y-3">
          <ModernColorPicker
            label="צבע טקסט"
            value={selectedElement.color}
            onChange={(color) => onUpdateElement(selectedElement.id, { color })}
            swatches={projectColors}
          />
          <GradientControls element={selectedElement} onChange={onUpdateElement} />
        </div>
      </PropertySection>

      <PropertySection title="אפקטים ויזואליים" icon={Wand2} defaultExpanded={false}>
        <div className="space-y-4">
          {/* Shadow Effect */}
          <div className="bg-slate-900/50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 hebrew-font">הצללה</span>
              <Switch
                checked={selectedElement.textShadow?.enabled || false}
                onCheckedChange={(enabled) => onUpdateElement(selectedElement.id, { textShadow: { ...selectedElement.textShadow, enabled } })}
              />
            </div>
            {selectedElement.textShadow?.enabled && (
              <div className="space-y-2">
                <ModernColorPicker
                  label="צבע הצל"
                  value={selectedElement.textShadow?.color || '#000000'}
                  onChange={(color) => onUpdateElement(selectedElement.id, { textShadow: { ...selectedElement.textShadow, color } })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <ModernSlider
                    label="טשטוש"
                    value={selectedElement.textShadow?.blur || 0}
                    onChange={(blur) => onUpdateElement(selectedElement.id, { textShadow: { ...selectedElement.textShadow, blur } })}
                    min={0}
                    max={30}
                    unit="px"
                  />
                  <ModernSlider
                    label="מרחק"
                    value={Math.sqrt((selectedElement.textShadow?.offsetX || 0) ** 2 + (selectedElement.textShadow?.offsetY || 0) ** 2)}
                    onChange={(distance) => {
                      const angle = Math.atan2(selectedElement.textShadow?.offsetY || 0, selectedElement.textShadow?.offsetX || 0);
                      onUpdateElement(selectedElement.id, {
                        textShadow: {
                          ...selectedElement.textShadow,
                          offsetX: Math.cos(angle) * distance,
                          offsetY: Math.sin(angle) * distance
                        }
                      });
                    }}
                    min={0}
                    max={40}
                    unit="px"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stroke Effect */}
          <div className="bg-slate-900/50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 hebrew-font">קו מתאר</span>
              <Switch
                checked={selectedElement.stroke?.enabled || false}
                onCheckedChange={(enabled) => onUpdateElement(selectedElement.id, { stroke: { ...selectedElement.stroke, enabled } })}
              />
            </div>
            {selectedElement.stroke?.enabled && (
              <div className="space-y-2">
                <ModernColorPicker
                  label="צבע קו"
                  value={selectedElement.stroke?.color || '#000000'}
                  onChange={(color) => onUpdateElement(selectedElement.id, { stroke: { ...selectedElement.stroke, color } })}
                />
                <ModernSlider
                  label="עובי"
                  value={selectedElement.stroke?.width || 0}
                  onChange={(width) => onUpdateElement(selectedElement.id, { stroke: { ...selectedElement.stroke, width } })}
                  min={0}
                  max={15}
                  step={0.5}
                  unit="px"
                />
              </div>
            )}
          </div>

          {/* Glow Effect */}
          <div className="bg-slate-900/50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 hebrew-font">זוהר</span>
              <Switch
                checked={selectedElement.glow?.enabled || false}
                onCheckedChange={(enabled) => onUpdateElement(selectedElement.id, { glow: { ...selectedElement.glow, enabled } })}
              />
            </div>
            {selectedElement.glow?.enabled && (
              <div className="space-y-2">
                <ModernColorPicker
                  label="צבע זוהר"
                  value={selectedElement.glow?.color || '#FFFFFF'}
                  onChange={(color) => onUpdateElement(selectedElement.id, { glow: { ...selectedElement.glow, color } })}
                />
                <ModernSlider
                  label="עוצמה"
                  value={selectedElement.glow?.blur || 0}
                  onChange={(blur) => onUpdateElement(selectedElement.id, { glow: { ...selectedElement.glow, blur } })}
                  min={0}
                  max={40}
                  unit="px"
                />
              </div>
            )}
          </div>
        </div>
      </PropertySection>

      <PropertySection title="הגדרות מתקדמות" icon={Settings} defaultExpanded={false}>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 hebrew-font">רקע טקסט</span>
              <Switch
                checked={selectedElement.backgroundColor?.enabled || false}
                onCheckedChange={(enabled) => onUpdateElement(selectedElement.id, { backgroundColor: { ...selectedElement.backgroundColor, enabled } })}
              />
            </div>
            {selectedElement.backgroundColor?.enabled && (
              <div className="space-y-2">
                <ModernColorPicker
                  label="צבע רקע"
                  value={selectedElement.backgroundColor?.color || '#FFFFFF'}
                  onChange={(color) => onUpdateElement(selectedElement.id, { backgroundColor: { ...selectedElement.backgroundColor, color } })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <ModernSlider
                    label="ריפוד"
                    value={selectedElement.backgroundColor?.padding || 0}
                    onChange={(padding) => onUpdateElement(selectedElement.id, { backgroundColor: { ...selectedElement.backgroundColor, padding } })}
                    min={0}
                    max={40}
                    unit="px"
                  />
                  <ModernSlider
                    label="פינות עגולות"
                    value={selectedElement.backgroundColor?.borderRadius || 0}
                    onChange={(borderRadius) => onUpdateElement(selectedElement.id, { backgroundColor: { ...selectedElement.backgroundColor, borderRadius } })}
                    min={0}
                    max={40}
                    unit="px"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-xs font-medium text-slate-300 hebrew-font">נראות</span>
            <Switch
              checked={selectedElement.visible}
              onCheckedChange={(visible) => onUpdateElement(selectedElement.id, { visible })}
            />
          </div>
        </div>
      </PropertySection>
    </div>
  );
};

const ImageEditor = ({ selectedElement, onUpdateElement }) => {
  if (!selectedElement || selectedElement.type !== 'image') return null;
  
  return (
    <PropertySection title="הגדרות תמונה" icon={ImageIcon}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <ModernSlider
            label="רוחב"
            value={selectedElement.width}
            onChange={(width) => onUpdateElement(selectedElement.id, { width })}
            min={50}
            max={1280}
            unit="px"
          />
          <ModernSlider
            label="גובה"
            value={selectedElement.height}
            onChange={(height) => onUpdateElement(selectedElement.id, { height })}
            min={50}
            max={1280}
            unit="px"
          />
        </div>
      </div>
    </PropertySection>
  );
};

const IconEditor = ({ selectedElement, onUpdateElement }) => {
  if (!selectedElement || selectedElement.type !== 'icon') return null;
  
  return (
    <PropertySection title="הגדרות איקון" icon={Zap}>
      <div className="space-y-3">
        <ModernSlider
          label="גודל"
          value={selectedElement.width}
          onChange={(size) => onUpdateElement(selectedElement.id, { width: size, height: size })}
          min={20}
          max={500}
          unit="px"
        />
        <ModernColorPicker
          label="צבע"
          value={selectedElement.color}
          onChange={(color) => onUpdateElement(selectedElement.id, { color })}
        />
      </div>
    </PropertySection>
  );
};

export default function ToolsPanel({ 
  onAddText, 
  onAddImage, 
  onAddIcon, 
  onAddEmoji, 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement, 
  onDuplicateElement, 
  project, 
  fonts, 
  onCloseMobilePanel, 
  isMobile 
}) {
  const [isIconLibraryOpen, setIsIconLibraryOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  return (
    <div className="h-full bg-slate-900 border-l border-slate-700 flex flex-col">
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 hebrew-font">כלי עיצוב</h2>
          <Button variant="ghost" size="icon" onClick={onCloseMobilePanel}>
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      )}
      
      {/* Tools Section */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 hebrew-font flex items-center gap-2">
          <Plus className="w-4 h-4" />
          הוסף אלמנטים
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CreativeToolCard
            icon={Type}
            title="טקסט"
            description="הוסף כותרות וטקסט"
            onClick={() => { onAddText(); onCloseMobilePanel?.(); }}
            accent="purple"
          />
          <CreativeToolCard
            icon={ImageIcon}
            title="תמונה"
            description="העלה תמונות"
            onClick={() => { onAddImage(); onCloseMobilePanel?.(); }}
            accent="teal"
          />
          <Dialog open={isIconLibraryOpen} onOpenChange={setIsIconLibraryOpen}>
            <DialogTrigger asChild>
              <div>
                <CreativeToolCard
                  icon={Zap}
                  title="אייקונים"
                  description="סמלים וצורות"
                  onClick={() => {}}
                  accent="orange"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="hebrew-font text-slate-100">ספריית אייקונים</DialogTitle>
              </DialogHeader>
              <IconLibrary onSelectIcon={(icon) => { onAddIcon(icon); setIsIconLibraryOpen(false); onCloseMobilePanel?.(); }} />
            </DialogContent>
          </Dialog>
          <Dialog open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <DialogTrigger asChild>
              <div>
                <CreativeToolCard
                  icon={Sparkles}
                  title="אימוג'י"
                  description="רגשות וסמלים"
                  onClick={() => {}}
                  accent="green"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-0 bg-slate-900 border-slate-700 text-white">
              <DialogHeader className="p-4 border-b border-slate-700">
                <DialogTitle className="hebrew-font text-slate-100">בחירת אימוג'י</DialogTitle>
              </DialogHeader>
              <EmojiPicker onSelectEmoji={(emoji) => { onAddEmoji(emoji); setIsEmojiPickerOpen(false); onCloseMobilePanel?.(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Properties Section */}
      <div className="flex-1 overflow-y-auto">
        {selectedElement ? (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-200 hebrew-font">עריכת אלמנט</h3>
            </div>
            <TextEditor
              selectedElement={selectedElement}
              onUpdateElement={onUpdateElement}
              projectColors={project?.color_palette}
              fonts={fonts}
              sizePreset={project?.size_preset || "youtube"}
            />
            <ImageEditor selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
            <IconEditor selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 mb-2 hebrew-font">בחר אלמנט לעריכה</h3>
            <p className="text-xs text-slate-500 hebrew-font">לחץ על טקסט, תמונה או אייקון בקנווס</p>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      {selectedElement && (
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex gap-2">
            <Button
              onClick={() => { onDuplicateElement(selectedElement.id); onCloseMobilePanel?.(); }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600 hebrew-font"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              שכפל
            </Button>
            <Button
              onClick={() => { onDeleteElement(selectedElement.id); onCloseMobilePanel?.(); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white hebrew-font"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              מחק
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
