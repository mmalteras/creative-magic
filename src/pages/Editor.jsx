
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Project } from "@/api/entities";
import { Font } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import TopBar from '../components/editor/TopBar';
import ToolsPanel from '../components/editor/ToolsPanel';
import Canvas from '../components/editor/Canvas';
import SoothingLoader from "@/components/common/SoothingLoader";
import GenerationLoader from "@/components/common/GenerationLoader";
import MobileQuickBar from "@/components/editor/MobileQuickBar";

const canvasSizes = {
  youtube: { width: 1280, height: 720 },
  instagram: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
};

export default function Editor() {
  const [project, setProject] = useState(null);
  const [fonts, setFonts] = useState([]);
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [sizePreset, setSizePreset] = useState("youtube");
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState("שמור");
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isInitialSetupLoading, setIsInitialSetupLoading] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);

  const imageUploadRef = useRef(null);
  const visibleCanvasRef = useRef(null);

  const navigate = useNavigate();

  const loadProject = useCallback(async (projectId) => {
    try {
      const foundProject = await Project.get(projectId);
      if (foundProject) {
        setProject(foundProject);
        setSizePreset(foundProject.size_preset || "youtube");
        if (foundProject.editor_json?.elements && foundProject.editor_json.elements.length > 0) {
          setCanvasElements(foundProject.editor_json.elements);
        } else {
          const canvasSize = canvasSizes[foundProject.size_preset || "youtube"];
          let baseFontSize = Math.round(canvasSize.width * 0.12);
          
          const y1 = Math.round(canvasSize.height * 0.18);
          const y2 = y1 + Math.round(baseFontSize * 0.88);

          const headline = (foundProject.hebrew_headline || "איך לעצב\nת'אמבנייל").trim();
          const parts = headline.includes('\n')
            ? headline.split('\n')
            : (() => {
                const w = headline.split(/\s+/);
                if (w.length <= 1) return [headline, ""];
                const mid = Math.ceil(w.length / 2);
                return [w.slice(0, mid).join(' '), w.slice(mid).join(' ')];
              })();
          const line1Text = (parts[0] || "איך לעצב").trim();
          const line2Text = (parts[1] || "ת'אמבנייל").trim();

          const lineCommon = {
            type: "text",
            x: (canvasSize.width / 2),
            fontSize: baseFontSize,
            fontFamily: "Heebo, Noto Sans Hebrew, Arial",
            fontWeight: 900,
            textAlign: "center",
            isHebrew: true,
            visible: true,
            lineHeight: 0.9,
            textShadow: { enabled: true, offsetX: 4, offsetY: 4, blur: 12, color: "rgba(0,0,0,0.9)" },
            stroke: { enabled: true, width: 9, color: "#000000" },
            glow: { enabled: true, blur: 18, color: "rgba(255,255,255,0.5)" },
            backgroundColor: { enabled: false, color: "#000000", opacity: 0.5, padding: 10 }
          };

          const firstLine = {
            id: Date.now(),
            ...lineCommon,
            content: line1Text,
            y: y1,
            color: "#ECEFF4"
          };

          const secondLine = {
            id: Date.now() + 1,
            ...lineCommon,
            content: line2Text,
            y: y2,
            color: "#FFD54A",
            gradient: {
              enabled: true,
              type: "linear",
              direction: "vertical",
              colors: ["#F7D14C", "#FFFFFF", "#FF7A1A"]
            }
          };

          setCanvasElements([firstLine, secondLine]);
        }
      } else {
        navigate(createPageUrl("Home"), { replace: true });
      }
    } catch (err) {
      console.error("Error loading project:", err);
      navigate(createPageUrl("Home"), { replace: true });
    }
  }, [navigate]);

  const loadFonts = useCallback(async () => {
    try {
      const fontList = await Font.list();
      setFonts(fontList);
    } catch (err) {
      console.error("Error loading fonts:", err);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");

    const initEditor = async () => {
      if (!projectId) {
        navigate(createPageUrl("Home"), { replace: true });
        return;
      }

      setIsInitialSetupLoading(true);

      await loadProject(projectId);
      await loadFonts();

      try {
        await document.fonts.ready;
      } catch (error) {
        console.error("Error waiting for fonts to load:", error);
      } finally {
        setIsInitialSetupLoading(false);
      }
    };
    initEditor();
  }, [loadProject, loadFonts, navigate]);

  useEffect(() => {
    if (project?.flux_result_image_url) {
      setIsPreparing(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setTimeout(() => setIsPreparing(false), 300);
      img.onerror = () => setTimeout(() => setIsPreparing(false), 300);
      img.src = project.flux_result_image_url;
    } else {
      setIsPreparing(false);
    }
  }, [project?.flux_result_image_url]);

  const saveProject = useCallback(async () => {
    if (!project) return;
    setSaveStatus("שומר...");
    try {
      const editorData = { elements: canvasElements, sizePreset };
      await Project.update(project.id, {
        editor_json: editorData,
        size_preset: sizePreset,
        status: "editing"
      });
      setTimeout(() => setSaveStatus("נשמר"), 1000);
      setTimeout(() => setSaveStatus("שמור"), 2000);
    } catch {
      setSaveStatus("שגיאה בשמירה");
    }
  }, [project, canvasElements, sizePreset]);

  useEffect(() => {
    if (project && canvasElements.length > 0) {
      const handler = setTimeout(saveProject, 2000);
      return () => clearTimeout(handler);
    }
  }, [canvasElements, sizePreset, project, saveProject]);

  const addTextElement = () => {
    const canvasSize = canvasSizes[sizePreset];
    const newElement = {
      id: Date.now(),
      type: "text",
      content: "טקסט חדש",
      x: canvasSize.width / 2,
      y: (canvasSize.height / 2) - 50,
      fontSize: (sizePreset === 'instagram' || sizePreset === 'square') ? 80 : 100,
      fontFamily: "Heebo, Noto Sans Hebrew, Arial",
      color: "#FFD54A",
      fontWeight: 900,
      textAlign: "center",
      isHebrew: true,
      visible: true,
      lineHeight: 1.0,
      textShadow: { enabled: true, offsetX: 3, offsetY: 3, blur: 10, color: "rgba(0,0,0,0.9)" },
      stroke: { enabled: true, width: 8, color: "#000000" },
      glow: { enabled: true, blur: 14, color: "rgba(255,255,255,0.45)" },
      backgroundColor: { enabled: false, color: "#000000", opacity: 0.5, padding: 10 },
      gradient: {
        enabled: true,
        type: "linear",
        direction: "vertical",
        colors: ["#F7D14C", "#FFFFFF", "#FF7A1A"]
      }
    };
    setCanvasElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const addImageElement = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await UploadFile({ file });
      const canvasSize = canvasSizes[sizePreset];
      const newElement = {
        id: Date.now(),
        type: "image",
        src: file_url,
        x: (canvasSize.width / 2) - 150,
        y: (canvasSize.height / 2) - 100,
        width: 300,
        height: 200,
        visible: true,
      };
      setCanvasElements(prev => [...prev, newElement]);
      setSelectedElement(newElement);
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const addIconElement = ({ svgContent, name }) => {
    if (!svgContent) return;
    const canvasSize = canvasSizes[sizePreset];
    const iconSize = 100;
    const newElement = {
      id: Date.now(),
      type: 'icon',
      name: name,
      svgContent: svgContent,
      x: (canvasSize.width / 2) - (iconSize / 2),
      y: (canvasSize.height / 2) - (iconSize / 2),
      width: iconSize,
      height: iconSize,
      color: '#FFFFFF',
      visible: true,
    };
    setCanvasElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  };
  
  const addEmojiElement = (emoji) => {
    const canvasSize = canvasSizes[sizePreset];
    const emojiSize = 120;
    const newElement = {
        id: Date.now(),
        type: "text",
        content: emoji,
        x: (canvasSize.width / 2) - (emojiSize / 2.5),
        y: (canvasSize.height / 2) - (emojiSize / 1.5),
        fontSize: emojiSize,
        fontFamily: "sans-serif",
        color: "#000000",
        fontWeight: "normal",
        textAlign: "center",
        isHebrew: false,
        visible: true,
        lineHeight: 1,
        textShadow: { enabled: false },
        stroke: { enabled: false },
        glow: { enabled: false },
        backgroundColor: { enabled: false }
    };
    setCanvasElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = useCallback((id, updates) => {
    setCanvasElements(elements => elements.map(el => el.id === id ? { ...el, ...updates } : el));
    if (selectedElement?.id === id) {
      setSelectedElement(prev => ({ ...prev, ...updates }));
    }
  }, [selectedElement]);

  const deleteElement = (id) => {
    setCanvasElements(elements => elements.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const duplicateElement = (id) => {
    const elementToDuplicate = canvasElements.find(el => el.id === id);
    if (!elementToDuplicate) return;

    const clonedElement = JSON.parse(JSON.stringify(elementToDuplicate));
    clonedElement.id = Date.now() + Math.random();
    clonedElement.x = (clonedElement.x || 0) + 20;
    clonedElement.y = (clonedElement.y || 0) + 20;
    clonedElement.visible = true;

    setCanvasElements(prev => [...prev, clonedElement]);
    setSelectedElement(clonedElement);
  };

  const exportImage = async () => {
    const previouslySelected = selectedElement;
    setSelectedElement(null);
    
    await new Promise(resolve => setTimeout(resolve, 50));

    setIsExporting(true);
    const canvas = visibleCanvasRef.current;

    if (!canvas) {
      alert('שגיאה: לא ניתן למצוא את הקנבס.');
      setIsExporting(false);
      if (previouslySelected) setSelectedElement(previouslySelected);
      return;
    }

    try {
      canvas.toBlob(async (blob) => {
        if (!blob || !blob.size) {
          alert('שגיאה ביצירת קובץ התמונה.');
          setIsExporting(false);
          if (previouslySelected) setSelectedElement(previouslySelected);
          return;
        }

        try {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = `creative_magic_${project.id}.png`;
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);

          const imageFile = new File([blob], fileName, { type: 'image/png' });
          if (!imageFile.size) throw new Error("קובץ ריק לאחר ההורדה");
          const { file_url } = await UploadFile({ file: imageFile });
          await Project.update(project.id, { final_image_url: file_url, status: "completed" });

        } catch (processError) {
          console.error("Download/Upload of final image failed:", processError);
          alert('שגיאה בעיבוד התמונה הסופית: ' + processError.message);
        } finally {
          setIsExporting(false);
          if (previouslySelected) setSelectedElement(previouslySelected);
        }
      }, 'image/png');
    } catch (error) {
      console.error("Export failed:", error);
      alert('שגיאה ביצוא התמונה: ' + error.message);
      setIsExporting(false);
      if (previouslySelected) setSelectedElement(previouslySelected);
    }
  };

  if (!project || isInitialSetupLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <SoothingLoader label={!project ? "טוען פרויקט..." : "מכין את העורך..."} />
      </div>
    );
  }

  if (isPreparing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <GenerationLoader phase="generating" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white" dir="rtl">
      <style>
        {fonts.map(font => `@font-face { font-family: "${font.name}"; src: url(${font.file_url}); }`).join('\n')}
      </style>
      <input type="file" ref={imageUploadRef} onChange={(e) => addImageElement(e.target.files[0])} accept="image/*" className="hidden" />

      <TopBar
        projectName={project.youtube_video_id}
        onExport={exportImage}
        isExporting={isExporting}
        saveStatus={saveStatus}
        onToggleMobilePanel={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
        isMobilePanelOpen={isMobilePanelOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <aside className="w-80 bg-neutral-950 border-l border-neutral-800 shadow-lg z-10 overflow-y-auto hidden md:block">
          <ToolsPanel
            onAddText={addTextElement}
            onAddImage={() => imageUploadRef.current.click()}
            onAddIcon={addIconElement}
            onAddEmoji={addEmojiElement}
            selectedElement={selectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onDuplicateElement={duplicateElement}
            project={project}
            fonts={fonts}
          />
        </aside>

        <div
          className={`absolute inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-300 ease-out ${isMobilePanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobilePanelOpen(false)}
        />
        
        <aside
          className={`absolute bottom-0 left-0 right-0 h-[75vh] bg-neutral-950 border-t border-neutral-800 shadow-2xl overflow-y-auto rounded-t-2xl transition-transform duration-300 ease-out z-40 md:hidden transform ${isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
           <ToolsPanel
            onAddText={addTextElement}
            onAddImage={() => imageUploadRef.current.click()}
            onAddIcon={addIconElement}
            onAddEmoji={addEmojiElement}
            selectedElement={selectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onDuplicateElement={duplicateElement}
            project={project}
            fonts={fonts}
            onCloseMobilePanel={() => setIsMobilePanelOpen(false)}
            isMobile={true}
          />
        </aside>

        <main className="flex-1 bg-neutral-900 overflow-auto canvas-container relative">
          <div className="w-full h-full flex items-center justify-center">
              <Canvas
                ref={visibleCanvasRef}
                project={project}
                elements={canvasElements}
                sizePreset={sizePreset}
                onSelectElement={(el) => { setSelectedElement(el); }}
                onUpdateElement={updateElement}
                selectedElement={selectedElement}
                onDeleteElement={deleteElement}
              />
          </div>
        </main>

        <MobileQuickBar
          onOpenPanel={() => setIsMobilePanelOpen(true)}
          onAddText={addTextElement}
          onAddImage={() => imageUploadRef.current.click()}
          onExport={exportImage}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}
