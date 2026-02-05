"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onUploadComplete?: (contractId: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                onUploadComplete?.(response.data.contractId);
            }
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxFiles: 1,
        disabled: isUploading,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 bg-muted/5",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                isUploading && "opacity-50 cursor-not-allowed",
                "h-64"
            )}
        >
            <input {...getInputProps()} />

            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading and analyzing...</p>
                </div>
            ) : (
                <>
                    <div className="p-4 rounded-full bg-primary/10">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">
                            {isDragActive ? "Drop the contract here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PDF or DOCX (Max 10MB)
                        </p>
                    </div>
                </>
            )}

            {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
