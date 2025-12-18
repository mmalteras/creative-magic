
export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    // Enable CORS for cross-origin images (e.g., from storage)
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Reject with a proper Error instead of the raw event to avoid "[object Event]"
      reject(new Error(`Failed to load image from URL: ${url}. It may be missing, blocked by CORS, or not an image.`));
    };
    img.src = url;
  });
}

// boxes: [{x, y, width, height}], padding: 0..1
export async function cropFacesFromImage(
  imageUrl,
  boxes,
  { padding = 0.3, toSquare = true, mimeType = "image/jpeg", quality = 0.92 } = {}
) {
  const img = await loadImage(imageUrl);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  const results = [];

  for (const box of boxes) {
    if (!box) continue;
    const bx = Math.max(0, Math.floor(box.x ?? 0));
    const by = Math.max(0, Math.floor(box.y ?? 0));
    const bw = Math.max(1, Math.floor(box.width ?? 1));
    const bh = Math.max(1, Math.floor(box.height ?? 1));

    // Add padding around the face
    const padX = Math.floor(bw * padding);
    const padY = Math.floor(bh * padding);

    let x = Math.max(0, bx - padX);
    let y = Math.max(0, by - padY);
    let w = Math.min(iw - x, bw + padX * 2);
    let h = Math.min(ih - y, bh + padY * 2);

    // Make square if requested
    if (toSquare) {
      const side = Math.max(w, h);
      const cx = Math.max(0, Math.min(iw - side, Math.round(x - (side - w) / 2)));
      const cy = Math.max(0, Math.min(ih - side, Math.round(y - (side - h) / 2)));
      x = cx; y = cy; w = side; h = side;
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

    const dataUrl = canvas.toDataURL(mimeType, quality);
    results.push(dataUrl);
  }

  return results;
}

export function dataUrlToFile(dataUrl, filename = "face.jpg") {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(parts[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], filename, { type: mime });
}
