// ============================================================
// AUTOVIZOR.CZ — Client-side image resize
// Před uploadem do R2 zmenšíme fotku v prohlížeči (Canvas API)
// → menší upload, šetří bandwidth + R2 storage
// ============================================================

const MAX_DIMENSION = 1920; // max šířka nebo výška
const JPEG_QUALITY = 0.85;

/**
 * Resize obrázek na max MAX_DIMENSION × MAX_DIMENSION (zachová poměr).
 * Vrací Blob s JPEG kompresí (vždy converze, ať je menší).
 *
 * Pokud je obrázek menší než MAX_DIMENSION, pouze rekomprimuje na JPEG_QUALITY
 * (úspora dat z PNG/raw JPEG).
 */
export async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  // SVG, AVIF a HEIC neresizujeme (browser je často nedokáže decodovat)
  if (file.type === 'image/svg+xml' || file.type === 'image/heic' || file.type === 'image/heif') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    // Pokud je menší než max + jpeg/webp, není co zmenšovat
    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
      bitmap.close();
      return file;
    }

    // Spočítat target rozměry zachovávající poměr stran
    let targetW = width;
    let targetH = height;
    if (width > height && width > MAX_DIMENSION) {
      targetW = MAX_DIMENSION;
      targetH = Math.round((height / width) * MAX_DIMENSION);
    } else if (height > MAX_DIMENSION) {
      targetH = MAX_DIMENSION;
      targetW = Math.round((width / height) * MAX_DIMENSION);
    }

    // Use OffscreenCanvas pokud je k dispozici (rychlejší, nezablokuje UI)
    const canvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(targetW, targetH)
      : Object.assign(document.createElement('canvas'), { width: targetW, height: targetH });

    const ctx = (canvas as OffscreenCanvas | HTMLCanvasElement).getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }

    // Vykreslíme na cílovou velikost s vysokou kvalitou
    (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = true;
    (ctx as CanvasRenderingContext2D).imageSmoothingQuality = 'high';
    (ctx as CanvasRenderingContext2D).drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    let blob: Blob;
    if ('convertToBlob' in canvas) {
      blob = await (canvas as OffscreenCanvas).convertToBlob({
        type: 'image/jpeg',
        quality: JPEG_QUALITY,
      });
    } else {
      blob = await new Promise<Blob>((resolve, reject) => {
        (canvas as HTMLCanvasElement).toBlob(
          (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
          'image/jpeg',
          JPEG_QUALITY
        );
      });
    }

    // Pokud je výsledek větší než původní (může se stát u tiny PNG),
    // vrátíme original
    if (blob.size > file.size) {
      return file;
    }

    const newName = file.name.replace(/\.[^.]+$/, '.jpg');
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (err) {
    console.warn('Image resize failed, using original:', err);
    return file;
  }
}

/**
 * Batch resize. Vrátí array File objektů, kde každý je buď zresizovaný
 * (originál pokud resize selhal nebo nebylo třeba).
 */
export async function resizeImages(files: File[]): Promise<File[]> {
  // Sériově (Canvas API není thread-safe v některých prohlížečích)
  const result: File[] = [];
  for (const f of files) {
    result.push(await resizeImage(f));
  }
  return result;
}
