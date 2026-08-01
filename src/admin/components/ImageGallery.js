import React, { useRef, useState } from 'react';
import { FiUpload, FiX, FiCheck, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { adminApi, ApiError, assetUrl } from '../utils/api';

// Multiple image manager. `images` is an array of URL strings.
// The first image acts as the thumbnail unless `thumbnail` is provided.
export default function ImageGallery({ images = [], onChange, thumbnail, onThumbnailChange, token }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const urls = [];
      for (const file of files) {
        const url = await adminApi.upload(file, token);
        urls.push(url);
      }
      onChange([...images, ...urls]);
      if (!thumbnail && images.length === 0 && urls.length) onThumbnailChange(urls[0]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    if (thumbnail && images[index] === thumbnail) {
      onThumbnailChange(next[0] || '');
    }
  };

  const move = (index, dir) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    if (thumbnail === images[index]) onThumbnailChange(next[index]);
    else if (thumbnail === images[target]) onThumbnailChange(next[target]);
  };

  return (
    <div className="mg-uploader">
      <label className="mg-label">Images ({images.length})</label>
      <div className="mg-gallery">
        {images.map((img, i) => {
          const isThumb = thumbnail && thumbnail === img;
          return (
            <div key={`${img}-${i}`} className={`mg-gallery-item ${isThumb ? 'is-thumb' : ''}`}>
              <img src={assetUrl(img)} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
              {isThumb && <span className="mg-gallery-thumb-tag"><FiStar /> Thumb</span>}
              <div className="mg-gallery-actions">
                <button type="button" title="Move left" onClick={() => move(i, -1)} disabled={i === 0}><FiChevronLeft /></button>
                <button type="button" title="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}><FiChevronRight /></button>
                <button type="button" className="set-thumb" title="Set as thumbnail" onClick={() => onThumbnailChange(img)}><FiCheck /></button>
                <button type="button" className="remove" title="Remove" onClick={() => removeAt(i)}><FiX /></button>
              </div>
            </div>
          );
        })}

        <button type="button" className="mg-gallery-add" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <><span className="spinner-border spinner-border-sm" style={{ color: '#ff6b35' }} /> Uploading...</>
          ) : (
            <><FiUpload size={20} /><span>Add images</span><small>PNG, JPG · max 5MB each</small></>
          )}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
      {error && <small className="mg-error-text">{error}</small>}
    </div>
  );
}
