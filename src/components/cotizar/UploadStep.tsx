'use client';

import { useState } from 'react';

interface UploadStepProps {
  onUpload: (file: File | null) => void;
  currentFile: File | null;
}

export default function UploadStep({ onUpload, currentFile }: UploadStepProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">1. Subí tu logo</h3>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? 'border-accent bg-accent/10'
            : 'border-secondary-dark hover:border-accent'
        }`}
      >
        {currentFile ? (
          <div className="space-y-4">
            <p className="text-green-600 font-semibold">✓ Archivo cargado</p>
            <p className="text-sm text-gray-600">{currentFile.name}</p>
            <button
              onClick={() => onUpload(null)}
              className="text-sm text-red-600 hover:underline"
            >
              Cambiar archivo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Arrastrá tu logo aquí o hacé clic para seleccionar
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, SVG o PDF
            </p>
            <label className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold cursor-pointer hover:bg-primary-light transition-colors">
              Seleccionar archivo
              <input
                type="file"
                accept="image/*,.pdf,.svg"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Cualquier formato sirve: foto, dibujo, vector o PDF. Lo vectorizamos nosotros. No te preocupes si no tenés el archivo perfecto, trabajamos con lo que tengas.
      </p>
    </div>
  );
}

