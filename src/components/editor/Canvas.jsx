
import React, { useEffect, useLayoutEffect, useRef, useState, forwardRef } from "react";

const sizes = {
  youtube: { width: 1280, height: 720 },
  instagram: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
};

const Canvas = forwardRef((
  {
    project,
    elements = [],
    sizePreset = "youtube",
    onSelectElement,
    onUpdateElement,
    selectedElement,
    onDeleteElement,
  },
  ref
) => {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [bgImage, setBgImage] = useState(null);
  const hitmapRef = useRef([]);
  const draggingRef = useRef({ active: false, id: null, offsetX: 0, offsetY: 0, pointerId: null });
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasSize = sizes[sizePreset] || sizes.youtube;

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;
      // The parent wrapper has `p-8` which means 32px padding on each side.
      // So, the available width/height for the canvas wrapper is reduced by 64px.
      // We also apply an additional 0.85 scale to the canvas inside, so the effective
      // available space should account for that.
      const maxW = wrapperRef.current.clientWidth - 64; // p-8 -> 32px padding on each side = 64px total
      const maxH = wrapperRef.current.clientHeight - 64; // p-8 -> 32px padding on each side = 64px total

      // The canvas itself will be scaled down by 0.85 of the available space.
      // So, when calculating the `scale` factor, we consider the canvas's intended
      // dimensions relative to the available space, accounting for the 0.85 factor.
      const s = Math.min(maxW / (canvasSize.width * 0.85), maxH / (canvasSize.height * 0.85));
      setScale(Math.min(1, s > 0 ? s : 1));
    };
    handleResize();
    const ro = new ResizeObserver(handleResize);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    window.addEventListener("resize", handleResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", handleResize); };
  }, [wrapperRef, canvasSize]);

  useEffect(() => {
    if (!project?.flux_result_image_url) { setBgImage(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBgImage(img);
    img.onerror = () => setBgImage(null);
    img.src = project.flux_result_image_url;
  }, [project?.flux_result_image_url]);

  const drawImage = (ctx, src, x, y, w, h) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { ctx.drawImage(img, x, y, w, h); resolve(); };
    img.onerror = () => resolve();
    img.src = src;
  });

  useEffect(() => {
    const draw = async () => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch (err) { /* ignore */ }

      if (bgImage) {
        const canvasRatio = canvas.width / canvas.height;
        const imageRatio = bgImage.naturalWidth / bgImage.naturalHeight;
        let sx = 0, sy = 0, sWidth = bgImage.naturalWidth, sHeight = bgImage.naturalHeight;

        if (imageRatio > canvasRatio) {
          sWidth = bgImage.naturalHeight * canvasRatio;
          sx = (bgImage.naturalWidth - sWidth) / 2;
        } else if (imageRatio < canvasRatio) {
          sHeight = bgImage.naturalWidth / canvasRatio;
          sy = (bgImage.naturalHeight - sHeight) / 2;
        }
        ctx.drawImage(bgImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#18181b"; // neutral-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const hexToRgba = (hex, alpha = 1) => {
        if (!hex) return `rgba(0,0,0,${alpha})`;
        const h = hex.replace("#", "");
        const val = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
        const r = (val >> 16) & 255, g = (val >> 8) & 255, b = val & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      const getPrimaryFamily = (ff) => {
        if (!ff) return "sans-serif";
        const primary = String(ff).split(",")[0].trim().replace(/^['"]+|['"]+$/g, "");
        return primary || "sans-serif";
      };

      const hitmap = [];

      for (const el of elements) {
        if (el?.visible === false) continue;
        ctx.save();

        if (el.type === "text") {
          const safeAlign = ["left", "center", "right"].includes(el.textAlign) ? el.textAlign : (el.isHebrew ? "right" : "left");
          const primaryFamily = getPrimaryFamily(el.fontFamily);
          const familyForCanvas = /\s/.test(primaryFamily) ? `"${primaryFamily}"` : primaryFamily;
          const weight = el.fontWeight || "normal";
          const fz = Math.max(10, Math.floor(el.fontSize || 16));
          ctx.font = `${weight} ${fz}px ${familyForCanvas}, Arial, sans-serif`;
          ctx.textAlign = safeAlign;
          ctx.textBaseline = "top";

          const lineHeight = (el.lineHeight || 1.2) * fz;
          const lines = String(el.content ?? "").split("\n");

          let maxLineWidth = 0;
          let textMetrics = { ascent: fz * 0.8, descent: fz * 0.2, height: fz };
          if (lines.length > 0 && lines[0]) {
            const m = ctx.measureText(lines[0]);
            textMetrics.ascent = m.actualBoundingBoxAscent || fz * 0.8;
            textMetrics.descent = m.actualBoundingBoxDescent || fz * 0.2;
            textMetrics.height = textMetrics.ascent + textMetrics.descent;
          }
          for (const line of lines) {
            maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
          }
          const totalHeight = textMetrics.height + (lines.length - 1) * lineHeight;

          if (el.backgroundColor?.enabled) {
            const pad = el.backgroundColor.padding || 0;
            const radius = el.backgroundColor.borderRadius || 0;
            const xLeft = safeAlign === "left" ? el.x : safeAlign === "center" ? el.x - maxLineWidth / 2 : el.x - maxLineWidth;
            const yTop = el.y - textMetrics.ascent;
            ctx.fillStyle = hexToRgba(el.backgroundColor.color || "#000000", Math.min(Math.max(el.backgroundColor.opacity ?? 0.5, 0), 1));
            
            ctx.beginPath();
            ctx.moveTo(xLeft - pad + radius, yTop - pad);
            ctx.lineTo(xLeft - pad + maxLineWidth + pad * 2 - radius, yTop - pad);
            ctx.quadraticCurveTo(xLeft - pad + maxLineWidth + pad * 2, yTop - pad, xLeft - pad + maxLineWidth + pad * 2, yTop - pad + radius);
            ctx.lineTo(xLeft - pad + maxLineWidth + pad * 2, yTop - pad + totalHeight + pad * 2 - radius);
            ctx.quadraticCurveTo(xLeft - pad + maxLineWidth + pad * 2, yTop - pad + totalHeight + pad * 2, xLeft - pad + maxLineWidth + pad * 2 - radius, yTop - pad + totalHeight + pad * 2);
            ctx.lineTo(xLeft - pad + radius, yTop - pad + totalHeight + pad * 2);
            ctx.quadraticCurveTo(xLeft - pad, yTop - pad + totalHeight + pad * 2, xLeft - pad, yTop - pad + totalHeight + pad * 2 - radius);
            ctx.lineTo(xLeft - pad, yTop - pad + radius);
            ctx.quadraticCurveTo(xLeft - pad, yTop - pad, xLeft - pad + radius, yTop - pad);
            ctx.closePath();
            ctx.fill();
          }

          const xTextStart = safeAlign === "left" ? el.x : safeAlign === "center" ? el.x - maxLineWidth / 2 : el.x - maxLineWidth;
          const yTextStart = el.y - textMetrics.ascent;

          let gradientFill = null;
          if (el.gradient?.enabled && Array.isArray(el.gradient.colors) && el.gradient.colors.length >= 2) {
            const direction = (el.gradient.direction || "vertical");
            if (direction === "vertical") {
              gradientFill = ctx.createLinearGradient(0, yTextStart, 0, yTextStart + totalHeight);
            } else {
              gradientFill = ctx.createLinearGradient(xTextStart, 0, xTextStart + maxLineWidth, 0);
            }
            const stopsCount = el.gradient.colors.length;
            el.gradient.colors.forEach((c, i) => {
              const stop = stopsCount === 1 ? 0 : i / (stopsCount - 1);
              gradientFill.addColorStop(stop, c);
            });
          }
          const applyFill = () => {
            ctx.fillStyle = gradientFill || (el.color || "#FFFFFF");
          };

          if (el.glow?.enabled) {
            applyFill();
            ctx.shadowColor = el.glow.color || "#ffffff";
            ctx.shadowBlur = el.glow.blur || 10;
            for (let i = 0; i < lines.length; i++) {
              ctx.fillText(lines[i], el.x, yTextStart + (i * lineHeight));
            }
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          if (el.textShadow?.enabled) {
            ctx.shadowColor = el.textShadow.color || "rgba(0,0,0,0.8)";
            ctx.shadowBlur = el.textShadow.blur || 0;
            ctx.shadowOffsetX = el.textShadow.offsetX || 0;
            ctx.shadowOffsetY = el.textShadow.offsetY || 0;
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          if (el.stroke?.enabled) {
            ctx.strokeStyle = el.stroke.color || "#000000";
            ctx.lineWidth = el.stroke.width || 1;
            for (let i = 0; i < lines.length; i++) {
              ctx.strokeText(lines[i], el.x, yTextStart + (i * lineHeight));
            }
          }

          applyFill();
          ctx.textBaseline = "top";
          for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], el.x, yTextStart + (i * lineHeight));
          }

          const bbox = {
            x: safeAlign === "left" ? el.x : (safeAlign === "center" ? el.x - maxLineWidth / 2 : el.x - maxLineWidth),
            y: el.y - textMetrics.ascent,
            w: maxLineWidth,
            h: totalHeight
          };

          const pad = (typeof window !== 'undefined' && window.innerWidth < 768) ? 20 : 12;
          const padded = { x: bbox.x - pad, y: bbox.y - pad, w: bbox.w + pad * 2, h: bbox.h + pad * 2 };
          hitmap.push({ id: el.id, bbox: padded });

          if (selectedElement?.id === el.id) {
            ctx.save();
            ctx.shadowColor = "transparent";
            ctx.strokeStyle = "rgba(139, 92, 246, 0.9)"; // Purple-500
            ctx.lineWidth = 3 / scale;
            ctx.setLineDash([8 / scale, 6 / scale]);
            ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);
            ctx.restore();
          }

        } else if (el.type === "image") {
          await drawImage(ctx, el.src, el.x, el.y, el.width, el.height);
          const bbox = { x: el.x, y: el.y, w: el.width, h: el.height };
          hitmap.push({ id: el.id, bbox });

          if (selectedElement?.id === el.id) {
            ctx.save();
            ctx.strokeStyle = "rgba(139, 92, 246, 0.9)";
            ctx.lineWidth = 3 / scale;
            ctx.setLineDash([8 / scale, 6 / scale]);
            ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);
            ctx.restore();
          }

        } else if (el.type === "icon") {
          const coloredSvg = (el.svgContent || "").replace(/currentColor/g, el.color || "#FFFFFF");
          const src = "data:image/svg+xml;base64," + btoa(coloredSvg);
          await drawImage(ctx, src, el.x, el.y, el.width, el.height);
          const bbox = { x: el.x, y: el.y, w: el.width, h: el.height };
          hitmap.push({ id: el.id, bbox });

          if (selectedElement?.id === el.id) {
            ctx.save();
            ctx.strokeStyle = "rgba(139, 92, 246, 0.9)";
            ctx.lineWidth = 3 / scale;
            ctx.setLineDash([8 / scale, 6 / scale]);
            ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);
            ctx.restore();
          }
        }

        ctx.restore();
      }
      hitmapRef.current = hitmap;
    };
    draw();
  }, [bgImage, elements, selectedElement, canvasSize, scale, ref]);

  const ptInRect = (px, py, r) => px >= r.x && py >= r.y && px <= r.x + r.w && py <= r.y + r.h;

  const toCanvasCoords = (clientX, clientY) => {
    if (!ref.current) return {x: 0, y: 0};
    const rect = ref.current.getBoundingClientRect();
    const x = (clientX - rect.left) / (scale * 0.85); // Account for the 0.85 scale applied via style
    const y = (clientY - rect.top) / (scale * 0.85); // Account for the 0.85 scale applied via style
    return { x, y };
  };

  const handlePointerDown = (e) => {
    if (!ref.current) return;
    ref.current.focus();
    const { x, y } = toCanvasCoords(e.clientX, e.clientY);
    const map = hitmapRef.current;
    let hit = null;
    
    for (let i = map.length - 1; i >= 0; i--) {
      if (ptInRect(x, y, map[i].bbox)) { hit = map[i]; break; }
    }

    if (hit) {
      const el = elements.find(el => el.id === hit.id);
      onSelectElement?.(el);
      draggingRef.current = {
        active: true,
        id: el.id,
        offsetX: x - el.x,
        offsetY: y - el.y,
        pointerId: e.pointerId,
      };
      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch (err) { /* ignore */ }
      setIsDragging(true);
    } else {
      onSelectElement?.(null);
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current.active) return;
    const { offsetX, offsetY, id } = draggingRef.current;
    const { x, y } = toCanvasCoords(e.clientX, e.clientY);
    onUpdateElement?.(id, { x: x - offsetX, y: y - offsetY });
  };

  const handlePointerUp = (e) => {
    if (draggingRef.current.active) {
      try { e.currentTarget.releasePointerCapture?.(draggingRef.current.pointerId); } catch (err) { /* ignore */ }
    }
    draggingRef.current = { active: false, id: null, offsetX: 0, offsetY: 0, pointerId: null };
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    if (!selectedElement) return;
    const step = e.shiftKey ? 10 : 1;
    let dx = 0, dy = 0;
    if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;

    if (dx !== 0 || dy !== 0) {
      e.preventDefault();
      onUpdateElement?.(selectedElement.id, { x: selectedElement.x + dx, y: selectedElement.y + dy });
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onDeleteElement?.(selectedElement.id);
    }
  };

  return (
    <div ref={wrapperRef} className="h-full w-full flex items-center justify-center select-none relative p-8">
      <canvas
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label="Canvas editor"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onKeyDown={handleKeyDown}
        style={{
          width: canvasSize.width * scale * 0.85,
          height: canvasSize.height * scale * 0.85,
          imageRendering: "auto",
          display: "block",
          cursor: isDragging ? "grabbing" : (selectedElement ? "grab" : "default"),
          touchAction: 'none',
          overscrollBehavior: 'contain',
          borderRadius: '12px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          border: '2px solid rgba(100, 116, 139, 0.2)'
        }}
      />
    </div>
  );
});

export default Canvas;
