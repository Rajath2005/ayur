import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import type { ParsedResult } from '@/types/imageDetection';
import { Client } from '@gradio/client';
import { apiRequest } from '@/lib/queryClient';
import '../styles/ImageDetection.css';

interface ImageDetectionProps {
    onCreditsCheck?: () => Promise<boolean>;
}

export default function ImageDetection({ onCreditsCheck }: ImageDetectionProps) {
    const { toast } = useToast();
    const { credits, refreshCredits } = useCredits();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState<ParsedResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const CREDITS_REQUIRED = 10;

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;

        // Validate file type
        if (!f.type.startsWith('image/')) {
            toast({
                title: 'Invalid File',
                description: 'Please select an image file',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (max 10MB)
        if (f.size > 10 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'Please select an image smaller than 10MB',
                variant: 'destructive',
            });
            return;
        }

        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResultData(null);
        setError(null);
    }

    async function submitImage() {
        if (!file) {
            toast({
                title: 'No Image Selected',
                description: 'Please select an image first',
                variant: 'destructive',
            });
            return;
        }

        // Check credits locally first
        if (credits < CREDITS_REQUIRED) {
            toast({
                title: 'Insufficient Credits',
                description: `You need ${CREDITS_REQUIRED} credits for analysis. Please upgrade your plan.`,
                variant: 'destructive',
            });
            return;
        }

        // Optional: check credits via callback
        if (onCreditsCheck) {
            const ok = await onCreditsCheck();
            if (!ok) return;
        }

        setLoading(true);
        setError(null);

        try {
            // Deduct credits before analysis
            console.log('💰 Deducting credits...');
            const creditRes = await apiRequest('POST', '/api/credits/deduct', {
                type: 'DRISHTI_ANALYSIS',
                amount: CREDITS_REQUIRED,
                mode: 'DRISHTI'
            });

            if (!creditRes.ok) {
                const errData = await creditRes.json();
                throw new Error(errData.message || 'Failed to deduct credits');
            }

            // Refresh credits UI immediately
            refreshCredits();

            console.log('🔄 Connecting to Gradio API...');
            const client = await Client.connect("https://ayurvedic-disease-api.onrender.com/");

            console.log('📤 Sending image to /predict endpoint...');
            const result = await client.predict("/predict", {
                img: file,
            });

            console.log('📦 Gradio API Response:', result);
            console.log('📝 Result data:', result.data);

            // The result.data should be a string (markdown)
            const markdownResponse = result.data as string;
            console.log('📄 Markdown response:', markdownResponse);

            // Parse and format the response
            const formatted = parseApiResponse(markdownResponse);
            console.log('✅ Parsed Result:', formatted);
            setResultData(formatted);

            toast({
                title: 'Analysis Complete',
                description: 'Your image has been analyzed successfully!',
            });

        } catch (err: any) {
            console.error('❌ Image detection error:', err);
            const errorMessage = err.message || 'Unknown error occurred';
            setError(errorMessage);
            toast({
                title: 'Analysis Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    function parseApiResponse(data: any): ParsedResult {
        // The API returns a plain text/markdown string
        let markdownText = '';

        if (typeof data === 'string') {
            markdownText = data;
        } else if (data.markdown) {
            markdownText = data.markdown;
        } else {
            markdownText = JSON.stringify(data, null, 2);
        }

        // Convert escaped newlines to actual newlines
        markdownText = markdownText.replace(/\\n/g, '\n');

        // Note: We do NOT strip Google links here anymore, 
        // because we want to render them as clickable links.

        console.log('📄 Markdown text to parse:', markdownText);

        // Parse the markdown text to extract sections
        const result: ParsedResult = {
            disease: '',
            remedy: [],
            recommended: [],
            avoid: [],
            source: '',
            logs: '',
        };

        // Extract Predicted Disease (with or without emoji)
        const diseaseMatch = markdownText.match(/(?:🩺\s*)?(?:\*\*)?Predicted Disease:?\*?\*?\s*(.+?)(?:\n|$)/i);
        if (diseaseMatch) {
            result.disease = diseaseMatch[1].trim();
            console.log('✅ Found disease:', result.disease);
        }

        // Extract Remedy section (with or without emoji)
        const remedyMatch = markdownText.match(/(?:🌿\s*)?(?:\*\*)?Remedy:?\*?\*?\s*\n([\s\S]*?)(?=\n\n|(?:✅|🚫|📖|🧾)\s*\*\*|$)/i);
        if (remedyMatch) {
            const remedyText = remedyMatch[1];
            const items = remedyText
                .split('\n')
                .map(line => line.replace(/^[\-\*•]\s*/, '').trim())
                .filter(line => line.length > 0 && !line.match(/^\*\*/));
            result.remedy = items;
            console.log('✅ Found remedy:', items);
        }

        // Extract Recommended (Pathya) section (with or without emoji)
        const recommendedMatch = markdownText.match(/(?:✅\s*)?(?:\*\*)?Recommended\s*\(Pathya\):?\*?\*?\s*\n([\s\S]*?)(?=\n\n|(?:🚫|📖|🧾)\s*\*\*|$)/i);
        if (recommendedMatch) {
            const items = recommendedMatch[1]
                .split('\n')
                .map(line => line.replace(/^[\-\*•]\s*/, '').trim())
                .filter(line => line.length > 0 && !line.match(/^\*\*/));
            result.recommended = items;
            console.log('✅ Found recommended:', items);
        }

        // Extract Avoid (Apathya) section (with or without emoji)
        const avoidMatch = markdownText.match(/(?:🚫\s*)?(?:\*\*)?Avoid\s*\(Apathya\):?\*?\*?\s*\n([\s\S]*?)(?=\n\n|(?:📖|🧾)\s*\*\*|$)/i);
        if (avoidMatch) {
            const items = avoidMatch[1]
                .split('\n')
                .map(line => line.replace(/^[\-\*•]\s*/, '').trim())
                .filter(line => line.length > 0 && !line.match(/^\*\*/));
            result.avoid = items;
            console.log('✅ Found avoid:', items);
        }

        // Extract Source (with or without emoji)
        const sourceMatch = markdownText.match(/(?:📖\s*)?(?:\*\*)?Source:?\*?\*?\s*(.+?)(?:\n|$)/i);
        if (sourceMatch) {
            result.source = sourceMatch[1].trim();
            console.log('✅ Found source:', result.source);
        }

        // Extract Logs (with or without emoji)
        const logsMatch = markdownText.match(/(?:🧾\s*)?(?:\*\*)?Logs:?\*?\*?\s*([\s\S]*?)$/i);
        if (logsMatch) {
            result.logs = logsMatch[1].trim();
            console.log('✅ Found logs (length):', result.logs.length);
        }

        // If we couldn't parse anything, store raw text
        if (!result.disease) {
            console.warn('⚠️ Could not parse disease, showing raw text');
            result.rawText = markdownText;
        }

        return result;
    }

    function renderMarkdownWithLinks(text: string) {
        // Regex to match markdown links: [text](url)
        // We use a capturing group to split the text, so the links are included in the result array
        const regex = /(\[[^\]]+\]\(https?:\/\/[^\)]+\))/g;
        const parts = text.split(regex);

        return parts.map((part, index) => {
            // Check if this part is a link
            const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\)]+)\)$/);
            if (match) {
                return (
                    <a
                        key={index}
                        href={match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {match[1]}
                    </a>
                );
            }
            // Otherwise return text
            return part;
        });
    }

    function clearAll() {
        setFile(null);
        setPreview(null);
        setResultData(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div className="ad-image-detect">
            <div className="left">
                <Card className="upload-card">
                    <CardContent className="p-6">
                        <label className="upload-box">
                            {!preview && (
                                <div className="placeholder">
                                    <div className="upload-icon-wrapper">
                                        <Upload className="upload-icon" />
                                    </div>
                                    <h3 className="upload-title">Upload Skin Image</h3>
                                    <p className="upload-description">
                                        Click to select or drag and drop an image
                                    </p>
                                    <p className="upload-hint">PNG, JPG up to 10MB</p>
                                </div>
                            )}
                            {preview && (
                                <div className="preview-wrapper">
                                    <img src={preview} alt="preview" className="preview-img" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="clear-preview-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            clearAll();
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="file-input"
                            />
                        </label>

                        <div className="controls">
                            <Button
                                variant="outline"
                                className="btn-clear"
                                onClick={clearAll}
                                disabled={!file || loading}
                            >
                                Clear
                            </Button>
                            <Button
                                className="btn-submit"
                                onClick={submitImage}
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    `Submit (${CREDITS_REQUIRED} Credits)`
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="right">
                <Card className="results-card">
                    <CardHeader>
                        <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!resultData && !error && !loading && (
                            <div className="hint">
                                <p>Upload an image and click Submit to see predictions</p>
                            </div>
                        )}

                        {loading && (
                            <div className="loading-state">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Analyzing your image...
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground/70 max-w-xs text-center">
                                    Note: The analysis server may take up to a minute to wake up if it hasn't been used recently.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="error-state">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                                <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
                            </div>
                        )}

                        {resultData && (
                            <div className="results-content">
                                {resultData.rawText ? (
                                    <pre className="raw-results">{resultData.rawText}</pre>
                                ) : (
                                    <>
                                        {/* Predicted Disease */}
                                        <div className="result-section">
                                            <h3 className="result-label">🔍 Predicted Disease</h3>
                                            <p className="result-value disease">{resultData.disease}</p>
                                        </div>

                                        {/* Remedy */}
                                        {resultData.remedy && resultData.remedy.length > 0 && (
                                            <div className="result-section">
                                                <h3 className="result-label">💊 Remedy</h3>
                                                <ul className="remedy-list">
                                                    {resultData.remedy.map((item, index) => (
                                                        <li key={index} className="remedy-item">
                                                            {renderMarkdownWithLinks(item)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Recommended (Pathya) */}
                                        {resultData.recommended && resultData.recommended.length > 0 && (
                                            <div className="result-section">
                                                <h3 className="result-label">✅ Recommended (Pathya)</h3>
                                                <ul className="recommended-list">
                                                    {resultData.recommended.map((item, index) => (
                                                        <li key={index} className="recommended-item">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 inline mr-2" />
                                                            {renderMarkdownWithLinks(item)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Avoid (Apathya) */}
                                        {resultData.avoid && resultData.avoid.length > 0 && (
                                            <div className="result-section">
                                                <h3 className="result-label">🚫 Avoid (Apathya)</h3>
                                                <ul className="avoid-list">
                                                    {resultData.avoid.map((item, index) => (
                                                        <li key={index} className="avoid-item">
                                                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 inline mr-2" />
                                                            {renderMarkdownWithLinks(item)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Source */}
                                        {resultData.source && (
                                            <div className="result-section">
                                                <h3 className="result-label">📚 Source</h3>
                                                <p className="source-text">{renderMarkdownWithLinks(resultData.source)}</p>
                                            </div>
                                        )}

                                        {/* Logs */}
                                        {resultData.logs && (
                                            <details className="result-section logs-section">
                                                <summary className="result-label cursor-pointer">📋 Logs</summary>
                                                <pre className="logs-content">{resultData.logs}</pre>
                                            </details>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
