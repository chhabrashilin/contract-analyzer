"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle, Loader2, FileUp } from "lucide-react";
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
            if (axios.isAxiosError(err) && err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to upload document. Please try again.");
            }
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
                "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer",
                "transition-all duration-200 ease-out",
                "flex flex-col items-center justify-center gap-4",
                "min-h-[200px]",
                isDragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                isUploading && "opacity-60 cursor-not-allowed pointer-events-none"
            )}
        >
            <input {...getInputProps()} />

            {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Processing document...</p>
                        <p className="text-xs text-muted-foreground">This may take a moment</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                        isDragActive ? "bg-primary/10" : "bg-muted"
                    )}>
                        {isDragActive ? (
                            <FileUp className="h-5 w-5 text-primary" />
                        ) : (
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium">
                            {isDragActive ? "Drop to upload" : "Upload a contract"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Drag and drop or click to browse
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded bg-muted">PDF</span>
                        <span className="px-2 py-0.5 rounded bg-muted">DOCX</span>
                        <span>Max 10MB</span>
                    </div>
                </>
            )}

            {error && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 text-destructive text-xs bg-destructive/10 py-2 px-3 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
