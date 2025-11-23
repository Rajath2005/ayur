import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { v4 as uuidv4 } from 'uuid';
import { VisualReportCard } from "./VisualReportCard";

interface DrishtiUploadProps {
    onAnalysisComplete?: (analysisId: string, report: any) => void;
}

export function DrishtiUpload({ onAnalysisComplete }: DrishtiUploadProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.type.startsWith('image/')) {
                toast({ title: "Invalid file", description: "Please upload an image", variant: "destructive" });
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleClear = () => {
        setFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);
        const clientRequestId = uuidv4();

        try {
            // 1. Start Upload - Reserve Credits
            const startRes = await apiRequest("POST", "/api/drishti/upload-start", {
                clientRequestId,
                fileMeta: { name: file.name, size: file.size, type: file.type }
            });

            if (!startRes.ok) {
                const err = await startRes.json();
                if (err.error === "INSUFFICIENT_CREDITS") {
                    throw new Error("Insufficient credits (10 required)");
                }
                throw new Error(err.message || "Failed to start upload");
            }

            const { analysisId, uploadUrl } = await startRes.json();

            // 2. Upload File (Simulated for now, normally would PUT to uploadUrl)
            // await fetch(uploadUrl, { method: 'PUT', body: file });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload

            // 3. Complete Upload
            setIsUploading(false);
            setIsAnalyzing(true);

            const completeRes = await apiRequest("POST", "/api/drishti/upload-complete", {
                analysisId,
                clientRequestId,
                storagePath: `drishti/${analysisId}/${file.name}` // Simulated path
            });

            if (!completeRes.ok) {
                throw new Error("Failed to complete upload");
            }

            // Poll for completion (Simulated long polling or just wait for the simulated delay in backend)
            // In real app, we might use WebSocket or polling. Backend simulates 2s delay.
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Fetch result (Simulated success)
            // In real implementation, we would poll status endpoint
            const result = {
                summary: "Analysis complete. Detected Vata imbalance indicators.",
                details: "Dry skin texture observed. Irregular patterns.",
                issues: ["Dryness", "Roughness"],
                recommendations: ["Hydrate frequently", "Use sesame oil massage"]
            };

            setAnalysisResult(result);
            queryClient.invalidateQueries({ queryKey: ["user", "credits"] });

            if (onAnalysisComplete) {
                onAnalysisComplete(analysisId, result);
            }

        } catch (err: any) {
            console.error("Drishti flow error:", err);
            setError(err.message);
            toast({
                title: "Analysis Failed",
                description: err.message + ". Credits have been refunded.",
                variant: "destructive"
            });
            // Credits are refunded by backend on failure
            queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
        } finally {
            setIsUploading(false);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            {!analysisResult ? (
                <Card className="border-dashed border-2">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                        {isUploading || isAnalyzing ? (
                            <div className="space-y-4">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                                    <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {isUploading ? "Uploading..." : "Analyzing..."}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isUploading ? "Sending image securely" : "Drishti AI is scanning for patterns"}
                                    </p>
                                    <p className="text-xs text-primary mt-2 font-medium">
                                        {isUploading ? "Credits Reserved" : "Analysis in progress"}
                                    </p>
                                </div>
                            </div>
                        ) : !file ? (
                            <div
                                className="space-y-4 cursor-pointer w-full h-full flex flex-col items-center justify-center"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Upload Image</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                        Upload a clear photo of your face, tongue, or skin for Ayurvedic analysis.
                                    </p>
                                </div>
                                <Button variant="outline" className="mt-4">
                                    Select Image (10 Credits)
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        ) : (
                            <div className="w-full space-y-4">
                                <div className="relative rounded-lg overflow-hidden max-h-[300px]">
                                    <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                        onClick={handleClear}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Button variant="outline" onClick={handleClear} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpload} className="flex-1">
                                        Analyze (10 Credits)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <VisualReportCard report={analysisResult} />
                    <div className="flex justify-center">
                        <Button onClick={handleClear} variant="outline">Analyze Another Image</Button>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
