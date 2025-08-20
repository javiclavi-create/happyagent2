// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'https://happy-agent-api-2.onrender.com';

// A reusable card component
const Card = ({ title, children }) => (
    <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        {children}
    </div>
);

// A reusable button component
const Button = ({ onClick, children, isLoading = false, className = '' }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className={`w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed ${className}`}
    >
        {isLoading ? 'Working...' : children}
    </button>
);

// A reusable text input component
const Input = ({ value, onChange, placeholder }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 mb-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
    />
);

// A reusable textarea component
const TextArea = ({ value, onChange, placeholder, rows = 6 }) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 mb-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
    />
);

function App() {
    // State for Generate Brief section
    const [product, setProduct] = useState('');
    const [audience, setAudience] = useState('');
    const [generatedBrief, setGeneratedBrief] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // State for Upload Example section
    const [exemplarText, setExemplarText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // State for Edit DNA section
    const [dna, setDna] = useState('');
    const [isSavingDna, setIsSavingDna] = useState(false);

    // State for notifications
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Function to show notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    // Fetch DNA on component mount
    const fetchDna = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dna`);
            const data = await response.json();
            setDna(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Failed to fetch DNA:", error);
            showNotification('Failed to load Brand DNA.', 'error');
        }
    }, []);

    useEffect(() => {
        fetchDna();
    }, [fetchDna]);

    // Handler for generating a new brief
    const handleGenerateBrief = async () => {
        if (!product || !audience) {
            showNotification('Please fill out both Product and Audience.', 'error');
            return;
        }
        setIsGenerating(true);
        setGeneratedBrief(null);
        try {
            const response = await fetch(`${API_BASE_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, audience }),
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            setGeneratedBrief(data);
            showNotification('Brief generated successfully!');
        } catch (error) {
            console.error("Failed to generate brief:", error);
            showNotification('Failed to generate brief. Check console.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    // Handler for uploading a new exemplar
    const handleUploadExemplar = async () => {
        if (!exemplarText.trim()) {
            showNotification('Exemplar text cannot be empty.', 'error');
            return;
        }
        setIsUploading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: exemplarText }),
            });
             if (!response.ok) throw new Error('Network response was not ok.');
            await response.json();
            setExemplarText('');
            showNotification('Exemplar uploaded successfully!');
        } catch (error) {
            console.error("Failed to upload exemplar:", error);
            showNotification('Failed to upload exemplar.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // Handler for saving DNA changes
    const handleSaveDna = async () => {
        let parsedDna;
        try {
            parsedDna = JSON.parse(dna);
        } catch (error) {
            showNotification('Invalid JSON format. Please correct it.', 'error');
            return;
        }
        setIsSavingDna(true);
        try {
            const response = await fetch(`${API_BASE_URL}/dna`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedDna),
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            await response.json();
            showNotification('Brand DNA saved successfully!');
        } catch (error) {
            console.error("Failed to save DNA:", error);
            showNotification('Failed to save Brand DNA.', 'error');
        } finally {
            setIsSavingDna(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl font-extrabold text-center text-indigo-600">
                        Happy Face Ads AI Agent
                    </h1>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                {notification.message && (
                    <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {notification.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <Card title="Generate New Brief">
                            <Input
                                value={product}
                                onChange={(e) => setProduct(e.target.value)}
                                placeholder="Product: e.g., Protein Shake for Busy Moms"
                            />
                            <Input
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                placeholder="Audience: e.g., Moms juggling work and kids"
                            />
                            <Button onClick={handleGenerateBrief} isLoading={isGenerating}>
                                Generate
                            </Button>
                        </Card>

                        <Card title="Upload Example Ad">
                            <TextArea
                                value={exemplarText}
                                onChange={(e) => setExemplarText(e.target.value)}
                                placeholder="Paste an ad script or brief here..."
                                rows={8}
                            />
                            <Button onClick={handleUploadExemplar} isLoading={isUploading}>
                                Upload Example
                            </Button>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {generatedBrief && (
                             <Card title="Generated Brief Output">
                                <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
                                    {JSON.stringify(generatedBrief, null, 2)}
                                </pre>
                            </Card>
                        )}

                        <Card title="Edit Style DNA">
                            <TextArea
                                value={dna}
                                onChange={(e) => setDna(e.target.value)}
                                placeholder="Loading Brand DNA..."
                                rows={generatedBrief ? 10 : 25}
                            />
                            <Button onClick={handleSaveDna} isLoading={isSavingDna}>
                                Save DNA
                            </Button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
