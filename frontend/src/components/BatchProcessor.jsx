import { useState, useRef } from 'react';
import { Upload, Folder, Download, Trash2, Play, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

function BatchProcessor() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    addFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      status: 'pending', // pending, processing, success, error
      caption: null,
      analysis: null,
      error: null
    }));

    setFiles(prev => [...prev, ...fileObjects]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setResults([]);
    setProgress({ current: 0, total: 0 });
  };

  const processBatch = async () => {
    if (files.length === 0) {
      alert('Veuillez ajouter au moins une image');
      return;
    }

    setProcessing(true);
    setProgress({ current: 0, total: files.length });
    const batchResults = [];

    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];

      // Update status to processing
      setFiles(prev => prev.map(f =>
        f.id === fileObj.id ? { ...f, status: 'processing' } : f
      ));

      try {
        // Simulate API call - replace with actual API
        const formData = new FormData();
        formData.append('file', fileObj.file);

        const response = await fetch('http://localhost:8000/analyze-and-generate', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to process image');
        }

        const result = await response.json();

        // Update file with success
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id ? {
            ...f,
            status: 'success',
            caption: result.caption,
            analysis: result.analysis
          } : f
        ));

        batchResults.push({
          filename: fileObj.name,
          caption: result.caption,
          analysis: result.analysis
        });

      } catch (error) {
        console.error(`Error processing ${fileObj.name}:`, error);

        // Update file with error
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id ? {
            ...f,
            status: 'error',
            error: error.message
          } : f
        ));

        batchResults.push({
          filename: fileObj.name,
          error: error.message
        });
      }

      setProgress({ current: i + 1, total: files.length });
    }

    setResults(batchResults);
    setProcessing(false);
  };

  const exportToJSON = () => {
    const exportData = files.map(file => ({
      filename: file.name,
      project: projectName || 'Untitled Project',
      caption: file.caption,
      analysis: file.analysis,
      status: file.status,
      timestamp: new Date().toISOString()
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-captions-${projectName || 'export'}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Filename', 'Project', 'Caption', 'Status', 'Timestamp'];
    const rows = files.map(file => [
      file.name,
      projectName || 'Untitled Project',
      file.caption ? file.caption.replace(/"/g, '""') : '',
      file.status,
      new Date().toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-captions-${projectName || 'export'}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Folder className="w-8 h-8 mr-3 text-purple-600" />
            Batch Processing
          </h2>
          <p className="text-gray-600 mt-2">
            Uploadez plusieurs images et générez toutes les captions en une seule fois
          </p>
        </div>
      </div>

      {/* Project Name */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom du Projet / Album
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Ex: Concert Jazz Festival 2024"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Upload Area */}
      <div
        className={`bg-white rounded-lg shadow-lg p-8 border-2 border-dashed transition-all ${
          dragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Glissez-déposez vos images ici
          </h3>
          <p className="text-gray-600 mb-4">
            ou cliquez pour sélectionner jusqu'à 50 images
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Sélectionner des fichiers
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Formats supportés: JPG, PNG, WebP - Max 50 images
          </p>
        </div>
      </div>

      {/* Files Grid */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Images ({files.length})
              </h3>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-gray-600">
                  ✓ Succès: <span className="font-semibold text-green-600">{successCount}</span>
                </span>
                <span className="text-gray-600">
                  ⏳ En attente: <span className="font-semibold text-gray-600">{pendingCount}</span>
                </span>
                <span className="text-gray-600">
                  ✗ Erreurs: <span className="font-semibold text-red-600">{errorCount}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={processBatch}
                disabled={processing || files.length === 0}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 mr-2" />
                {processing ? 'Traitement...' : 'Générer Tout'}
              </button>
              <button
                onClick={clearAll}
                disabled={processing}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Tout Effacer
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Traitement en cours...
                </span>
                <span className="text-sm text-gray-600">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map(file => (
              <div
                key={file.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  file.status === 'success'
                    ? 'border-green-500'
                    : file.status === 'error'
                    ? 'border-red-500'
                    : file.status === 'processing'
                    ? 'border-blue-500 animate-pulse'
                    : 'border-gray-200'
                }`}
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Status Overlay */}
                <div className="absolute top-2 right-2">
                  {getStatusIcon(file.status)}
                </div>

                {/* Remove Button */}
                {!processing && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* File Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                  <p className="text-xs truncate">{file.name}</p>
                </div>

                {/* Caption Preview (on hover for success) */}
                {file.status === 'success' && file.caption && (
                  <div className="absolute inset-0 bg-black bg-opacity-90 text-white p-3 opacity-0 group-hover:opacity-100 transition flex flex-col">
                    <p className="text-xs line-clamp-6 flex-1">{file.caption}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(file.caption);
                        alert('Caption copiée !');
                      }}
                      className="mt-2 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                    >
                      Copier
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-90 text-white p-2 opacity-0 group-hover:opacity-100 transition">
                    <p className="text-xs">{file.error || 'Erreur de traitement'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Export Buttons */}
          {successCount > 0 && (
            <div className="mt-6 pt-6 border-t flex justify-end gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter CSV
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter JSON
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && !processing && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Folder className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune image pour le moment
          </h3>
          <p className="text-gray-500">
            Commencez par ajouter des images pour générer des captions en masse
          </p>
        </div>
      )}
    </div>
  );
}

export default BatchProcessor;
