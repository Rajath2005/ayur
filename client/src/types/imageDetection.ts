/**
 * Type definitions for Image Detection API
 */

export interface ImageDetectionResult {
    dosha_prediction?: string;
    disease_prediction?: string;
    confidence?: number;
    extracted_features?: Record<string, any>;
    markdown?: string;
}

export interface ImageDetectionResponse {
    success?: boolean;
    data?: ImageDetectionResult;
    error?: string;
}

export interface ParsedResult {
    disease: string;
    remedy?: string[];
    recommended?: string[];
    avoid?: string[];
    source?: string;
    logs?: string;
    rawText?: string;
}
