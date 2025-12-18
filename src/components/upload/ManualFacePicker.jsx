
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

export default function ManualFacePicker({ imageUrl, maxFaces = 2, onCancel, onConfirm }) {
  const containerRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const [boxes, setBoxes] = React.useState([]);
  const [drag, setDrag] = React.useState(null); // {x,y,w,h}

  const reset = () => {
    setBoxes([]);
    setDrag(null);
  };

  // Helper for unified pointer (mouse/touch)
  const getClientXY = (evt) => {
    const t = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]) || evt;
    return { clientX: t.clientX, clientY: t.clientY };
  };

  const toImageCoords = (clientX, clientY) => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    const scaleX = (img.naturalWidth || img.width) / rect.width;
    const scaleY = (img.naturalHeight || img.height) / rect.height;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return { x: Math.round(x * scaleX), y: Math.round(y * scaleY) };
  };

  // Mouse handlers – prevent default to stop native image drag/select
  const onMouseDown = (e) => {
    e.preventDefault();
    if (boxes.length >= maxFaces) return;
    const { clientX, clientY } = getClientXY(e);
    const start = toImageCoords(clientX, clientY);
    setDrag({ x: start.x, y: start.y, w: 0, h: 0, startClient: { x: clientX, y: clientY } });
  };

  const onMouseMove = (e) => {
    if (!drag) return;
    e.preventDefault();
    const { clientX, clientY } = getClientXY(e);
    const start = drag.startClient;
    const dx = clientX - start.x;
    const dy = clientY - start.y;

    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const scaleX = (img.naturalWidth || img.width) / rect.width;
    const scaleY = (img.naturalHeight || img.height) / rect.height;

    const w = Math.round(Math.abs(dx) * scaleX);
    const h = Math.round(Math.abs(dy) * scaleY);
    const x = dx >= 0 ? drag.x : drag.x - w;
    const y = dy >= 0 ? drag.y : drag.y - h;

    setDrag({ ...drag, x: Math.max(0, x), y: Math.max(0, y), w, h });
  };

  const onMouseUp = (e) => {
    e.preventDefault();
    if (!drag) return;
    if (drag.w > 10 && drag.h > 10) {
      setBoxes([...boxes, { x: drag.x, y: drag.y, width: drag.w, height: drag.h }]);
    }
    setDrag(null);
  };

  // Touch handlers – prevent scroll/zoom and map to same logic
  const onTouchStart = (e) => {
    e.preventDefault();
    if (boxes.length >= maxFaces) return;
    const { clientX, clientY } = getClientXY(e);
    const start = toImageCoords(clientX, clientY);
    setDrag({ x: start.x, y: start.y, w: 0, h: 0, startClient: { x: clientX, y: clientY } });
  };

  const onTouchMove = (e) => {
    if (!drag) return;
    e.preventDefault();
    const { clientX, clientY } = getClientXY(e);
    const start = drag.startClient;
    const dx = clientX - start.x;
    const dy = clientY - start.y;

    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const scaleX = (img.naturalWidth || img.width) / rect.width;
    const scaleY = (img.naturalHeight || img.height) / rect.height;

    const w = Math.round(Math.abs(dx) * scaleX);
    const h = Math.round(Math.abs(dy) * scaleY);
    const x = dx >= 0 ? drag.x : drag.x - w;
    const y = dy >= 0 ? drag.y : drag.y - h;

    setDrag({ ...drag, x: Math.max(0, x), y: Math.max(0, y), w, h });
  };

  const onTouchEnd = (e) => {
    e.preventDefault();
    if (!drag) return;
    if (drag.w > 10 && drag.h > 10) {
      setBoxes([...boxes, { x: drag.x, y: drag.y, width: drag.w, height: drag.h }]);
    }
    setDrag(null);
  };

  const canConfirm = boxes.length === 2;

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-neutral-800">
          <h3 className="text-lg font-bold text-neutral-100 hebrew-font">סימון פנים ידני (בחר/י 2 אזורים)</h3>
          <button onClick={onCancel} className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 md:p-6">
          <div
            ref={containerRef}
            className="relative mx-auto max-w-full"
            style={{ cursor: boxes.length >= maxFaces ? "not-allowed" : "crosshair", userSelect: "none", touchAction: "none" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Manual face pick"
              className="w-full max-h-[65vh] object-contain rounded-lg border border-neutral-700 select-none"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Draw existing boxes (projected back to screen coords) */}
            {imgRef.current && boxes.map((b, idx) => {
              const rect = imgRef.current.getBoundingClientRect();
              const scaleX = rect.width / (imgRef.current.naturalWidth || imgRef.current.width);
              const scaleY = rect.height / (imgRef.current.naturalHeight || imgRef.current.height);
              const sx = b.x * scaleX;
              const sy = b.y * scaleY;
              const sw = b.width * scaleX;
              const sh = b.height * scaleY;
              return (
                <div
                  key={idx}
                  className="absolute border-2 rounded-xl"
                  style={{
                    left: `${sx + rect.left - containerRef.current.getBoundingClientRect().left}px`,
                    top: `${sy + rect.top - containerRef.current.getBoundingClientRect().top}px`,
                    width: `${sw}px`,
                    height: `${sh}px`,
                    borderColor: idx === 0 ? "#a78bfa" : "#f472b6",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.15)"
                  }}
                />
              );
            })}

            {/* Dragging preview */}
            {imgRef.current && drag && drag.w > 0 && drag.h > 0 && (() => {
              const rect = imgRef.current.getBoundingClientRect();
              const scaleX = rect.width / (imgRef.current.naturalWidth || imgRef.current.width);
              const scaleY = rect.height / (imgRef.current.naturalHeight || imgRef.current.height);
              const sx = drag.x * scaleX;
              const sy = drag.y * scaleY;
              const sw = drag.w * scaleX;
              const sh = drag.h * scaleY;
              return (
                <div
                  className="absolute border-2 border-dashed rounded-xl"
                  style={{
                    left: `${sx + rect.left - containerRef.current.getBoundingClientRect().left}px`,
                    top: `${sy + rect.top - containerRef.current.getBoundingClientRect().top}px`,
                    width: `${sw}px`,
                    height: `${sh}px`,
                    borderColor: "#94a3b8",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.1)"
                  }}
                />
              );
            })()}
          </div>

          <div className="flex items-center justify-between gap-3 mt-5">
            <div className="text-sm text-neutral-400 hebrew-font">
              סימון: {boxes.length} / {maxFaces} אזורי פנים
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="hebrew-font border-neutral-600 text-neutral-200">איפוס</Button>
              <Button onClick={() => onConfirm(boxes)} disabled={!canConfirm} className="hebrew-font bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-50">
                <Check className="w-4 h-4 ml-2" />
                אשר/י 2 פנים
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
