import { useState } from 'react'
import { Upload, Music, Instagram, Loader } from 'lucide-react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setAnalysis(null)
      setCaption('')
    }
  }

  const analyzeMedia = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/analyze-media', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to analyze media')
      
      const result = await response.json()
      setAnalysis(result)
      
      await generateCaption(result)
      
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const generateCaption = async (analysisData) => {
    try {
      const response = await fetch('http://localhost:8000/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          musicians: ["Serigne Diagne"],
          venue: "Studio",
          instruments: ["trumpet"],
          style: "jazz"
        })
      })

      const result = await response.json()
      setCaption(result.caption)
      
    } catch (error) {
      console.error('Error generating caption:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-10 h-10 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Caption Generator</h1>
          </div>
          <p className="text-xl text-gray-600">
            Générez automatiquement des légendes Instagram pour vos posts musicaux
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-2 text-purple-600" />
              Upload Média
            </h2>
            
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="block w-full mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
            />

            {selectedFile && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Fichier:</strong> {selectedFile.name}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
              </div>
            )}

            <button
              onClick={analyzeMedia}
              disabled={!selectedFile || loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Analyse...' : 'Analyser le média'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Instagram className="w-6 h-6 mr-2 text-purple-600" />
              Légende générée
            </h2>

            {caption && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Légende Instagram:</h3>
                <p className="whitespace-pre-line">{caption}</p>
              </div>
            )}

            {!caption && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Instagram className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Uploadez un média pour générer une légende</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App