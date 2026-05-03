import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Move } from 'lucide-react';
import { useSellWizardStore } from '../../stores/sellWizardStore';
import { useAuthStore } from '../../stores/authStore';
import { uploadVehiclePhoto } from '../../lib/api';

const MAX_FILES = 12;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export default function SellStep4() {
  const { data, patch, vehicleId } = useSellWizardStore();
  const { appUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const photos = data.image_urls ?? [];
  const draftKey = vehicleId ? `vehicle-${vehicleId}` : `draft-${appUser?.id?.slice(0, 8) ?? 'tmp'}`;

  const handleFiles = async (files: FileList | File[]) => {
    if (!appUser) {
      setUploadError('Pro upload fotek se musíte přihlásit.');
      return;
    }

    const fileArray = Array.from(files);
    if (photos.length + fileArray.length > MAX_FILES) {
      setUploadError(`Maximum je ${MAX_FILES} fotek. Aktuálně máte ${photos.length}.`);
      return;
    }

    setUploadError(null);
    setUploading(true);

    const newUrls: string[] = [];
    let nextIndex = photos.length;

    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`Soubor "${file.name}" má nepodporovaný formát. Použijte JPG, PNG, WebP nebo AVIF.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(`Soubor "${file.name}" je větší než ${MAX_FILE_SIZE_MB} MB.`);
        continue;
      }

      const url = await uploadVehiclePhoto(appUser.id, draftKey, file, nextIndex);
      if (url) {
        newUrls.push(url);
        nextIndex++;
      }
    }

    if (newUrls.length > 0) {
      patch({ image_urls: [...photos, ...newUrls] });
    }
    setUploading(false);
  };

  const handleRemove = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    patch({ image_urls: next });
  };

  const handleMoveToFirst = (index: number) => {
    if (index === 0) return;
    const next = [...photos];
    const [moved] = next.splice(index, 1);
    next.unshift(moved);
    patch({ image_urls: next });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-surface-50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Fotografie
        </h2>
        <p className="text-sm text-surface-400">
          Nahrajte fotky vozu (min. 1, max. {MAX_FILES}). První fotka bude hlavní (zobrazí se v listingu).
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-500/5'
            : 'border-surface-700 hover:border-surface-600 bg-surface-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload className="w-10 h-10 text-surface-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-surface-200 mb-1">
          Klikněte nebo přetáhněte fotky sem
        </p>
        <p className="text-xs text-surface-500">
          JPG, PNG, WebP, AVIF · max {MAX_FILE_SIZE_MB} MB / soubor · až {MAX_FILES} fotek
        </p>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Nahrávám…
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {uploadError}
        </div>
      )}

      {/* Gallery */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs text-surface-400 mb-2">
            {photos.length} {photos.length === 1 ? 'fotka' : photos.length < 5 ? 'fotky' : 'fotek'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <div
                key={url}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-800 group ${
                  i === 0 ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded">
                    HLAVNÍ
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {i !== 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveToFirst(i); }}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-surface-900"
                      title="Nastavit jako hlavní"
                    >
                      <Move className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                    className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white"
                    title="Smazat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-8 text-surface-500">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Zatím žádné fotky.</p>
        </div>
      )}
    </div>
  );
}
