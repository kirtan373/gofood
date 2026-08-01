import React, { useRef, useState } from 'react';
import { FiUpload, FiX, FiLink, FiImage } from 'react-icons/fi';
import { adminApi, ApiError, assetUrl } from '../utils/api';

export default function ImageUploader({ value, onChange, token, label = 'Image', help }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await adminApi.upload(file, token);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mg-uploader">
      <label className="mg-label">{label}</label>
      <div className="mg-uploader-body">
        {value ? (
          <div className="mg-uploader-preview">
            <img src={assetUrl(value)} alt="preview" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
            <div className="mg-uploader-overlay">
              <button type="button" className="mg-uploader-action" onClick={() => inputRef.current?.click()} disabled={uploading}>
                <FiUpload /> Change
              </button>
              <button type="button" className="mg-uploader-action danger" onClick={() => onChange('')} disabled={uploading}>
                <FiX /> Remove
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="mg-uploader-drop" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <><span className="spinner-border spinner-border-sm" style={{ color: '#ff6b35' }} /> Uploading...</>
            ) : (
              <><FiImage size={22} /><span>Drop an image or click to upload</span><small>PNG, JPG or WEBP · max 5MB</small></>
            )}
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
      <div className="mg-url-row">
        <FiLink />
        <input
          className="form-control form-control-sm"
          placeholder="...or paste an image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && <small className="mg-error-text">{error}</small>}
      {help && <small className="mg-help-text">{help}</small>}
    </div>
  );
}
