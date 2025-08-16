import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Image, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'docx';
  uploadProgress: number;
}

interface FileUploadProps {
  onFileSelect?: (file: UploadedFile) => void;
  onFileRemove?: (fileId: string) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = ['image/*', '.pdf', '.docx'],
  maxFiles = 5
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const getFileType = (file: File): 'image' | 'pdf' | 'docx' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    return 'image'; // fallback
  };

  const getFileIcon = (type: 'image' | 'pdf' | 'docx') => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-primary" />;
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'docx': return <File className="w-8 h-8 text-blue-500" />;
    }
  };

  const simulateUpload = (file: UploadedFile): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve({ ...file, uploadProgress: 100 });
        }
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id ? { ...f, uploadProgress: progress } : f
          )
        );
      }, 200);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of acceptedFiles) {
      const fileType = getFileType(file);
      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        file,
        type: fileType,
        uploadProgress: 0,
        preview: fileType === 'image' ? URL.createObjectURL(file) : undefined
      };

      setUploadedFiles(prev => [...prev, newFile]);
      
      try {
        const uploadedFile = await simulateUpload(newFile);
        onFileSelect?.(uploadedFile);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        setUploadedFiles(prev => prev.filter(f => f.id !== newFile.id));
      }
    }
  }, [uploadedFiles.length, maxFiles, onFileSelect]);

  const handleRemoveFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemove?.(fileId);
    toast.success('File removed');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    disabled: uploadedFiles.length >= maxFiles
  });

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragActive 
            ? 'border-primary bg-primary-muted' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        } ${uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="p-8 text-center">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          {isDragActive ? (
            <p className="text-lg font-medium text-primary">Drop files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                {uploadedFiles.length >= maxFiles ? 'Maximum files reached' : 'Upload your documents'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: Images, PDF, DOCX • Max {maxFiles} files
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          
          {uploadedFiles.map(file => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.toUpperCase()}
                  </p>
                  
                  {/* Progress Bar */}
                  {file.uploadProgress < 100 && (
                    <div className="mt-2">
                      <Progress value={file.uploadProgress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading... {Math.round(file.uploadProgress)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {file.uploadProgress === 100 && file.type === 'image' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onFileSelect?.(file)}
                    >
                      View
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};