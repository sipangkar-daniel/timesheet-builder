import { useState, useRef } from 'react';
import { Link, Upload, X } from 'lucide-react';

/**
 * ImageInputField - allows user to upload an image via local file OR paste a URL.
 * Both inputs are always visible (no mode toggle).
 *
 * Props:
 *  label       - text label shown above the field
 *  value       - current image URL (null if none)
 *  onFile      - (e) => void  – called when a file is selected
 *  onUrl       - (url) => void – called with the resolved URL string
 *  onClear     - () => void  – called when the field is cleared
 */
export const ImageInputField = ({ label, value, onFile, onUrl, onClear }) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const fileRef = useRef(null);

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('Enter a URL.');
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setUrlError('Invalid URL (e.g. https://...).');
      return;
    }
    setUrlError('');
    onUrl(trimmed);
  };

  const handleClear = () => {
    setUrlInput('');
    setUrlError('');
    if (fileRef.current) fileRef.current.value = '';
    onClear();
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300">
        {label}
      </label>

      <div className="space-y-2">
        {/* File row */}
        <div className="flex items-center gap-2">
          <Upload className="w-3 h-3 flex-shrink-0 text-gray-400" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="flex-1 min-w-0 text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20 cursor-pointer"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear"
              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* URL row */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link className="w-3 h-3 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleUrlApply()}
              placeholder="https://example.com/image.png"
              className={`flex-1 min-w-0 text-xs px-2.5 py-1 rounded-md border transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mandiri-blue ${
                urlError
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-md bg-mandiri-blue/10 text-mandiri-blue dark:bg-blue-900/30 dark:text-blue-400 hover:bg-mandiri-blue/20 transition-colors"
            >
              Apply
            </button>
          </div>
          {urlError && (
            <p className="text-xs text-red-500 pl-5">{urlError}</p>
          )}
        </div>
      </div>

      {/* Preview thumbnail */}
      {value && (
        <div className="flex items-center gap-2 mt-1 p-1.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-700">
          <img
            src={value}
            alt="preview"
            className="h-8 w-auto max-w-[80px] object-contain rounded"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="text-[10px] text-gray-400 truncate">Image loaded</span>
        </div>
      )}
    </div>
  );
};
