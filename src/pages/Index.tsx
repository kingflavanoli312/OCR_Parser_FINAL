import React, { useState } from 'react';
import { ImageViewer } from '@/components/ImageViewer';
import { TagManager } from '@/components/TagManager';
import { FileUpload } from '@/components/FileUpload';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ResumeViewer } from '@/components/ResumeViewer';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileImage, Tags, History, Upload, FileUser } from 'lucide-react';
import { toast } from 'sonner';

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'docx';
  uploadProgress: number;
}

const Index = () => {
  const [currentImage, setCurrentImage] = useState<string | undefined>();
  const [selectedBoundingBox, setSelectedBoundingBox] = useState<BoundingBox | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [activeTab, setActiveTab] = useState('upload');
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const handleFileSelect = (file: UploadedFile) => {
    if (file.type === 'image' && file.preview) {
      setCurrentImage(file.preview);
      setActiveTab('viewer');
      toast.success('Image loaded successfully');
    } else if (file.type === 'pdf' || file.type === 'docx') {
      setCurrentFileName(file.file.name);
      setShowResumeViewer(true);
      setActiveTab('resume');
      toast.success(`${file.type.toUpperCase()} processed successfully`);
    }
  };

  const handleBoundingBoxSelect = (box: BoundingBox) => {
    setSelectedBoundingBox(box);
  };

  const handleOCRExtract = (box: BoundingBox) => {
    // Simulate OCR extraction
    const mockTexts = [
      'John Doe\nSoftware Engineer\njohn.doe@email.com\n+1 (555) 123-4567',
      'ABC Corporation\n123 Business Street\nCity, State 12345\nPhone: (555) 987-6543',
      'Invoice #INV-2024-001\nDate: March 15, 2024\nAmount: $1,250.00\nDue Date: April 15, 2024',
      'Sarah Wilson\nProject Manager\nWilson & Associates\nsarah.wilson@company.com'
    ];
    
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    setExtractedText(randomText);
    setActiveTab('tags');
    
    setTimeout(() => {
      toast.success('OCR extraction completed');
    }, 1500);
  };

  const handleSaveExtraction = (text: string, tagId: string) => {
    console.log('Saved extraction:', { text, tagId });
    setExtractedText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                DocuVision Pro
              </h1>
              <p className="text-sm text-muted-foreground">
                Intelligent Document Processing & OCR Extraction
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Settings
              </Button>
              <Button variant="primary" size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Panel - Navigation & Controls */}
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="tags" className="gap-2">
                  <Tags className="w-4 h-4" />
                  Tags
                </TabsTrigger>
                <TabsTrigger value="resume" className="gap-2">
                  <FileUser className="w-4 h-4" />
                  Resume
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <div className="h-[calc(100%-4rem)]">
                <TabsContent value="upload" className="h-full m-0">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    maxFiles={10}
                  />
                </TabsContent>

                <TabsContent value="tags" className="h-full m-0">
                  <TagManager
                    extractedText={extractedText}
                    onSaveExtraction={handleSaveExtraction}
                  />
                </TabsContent>

                <TabsContent value="resume" className="h-full m-0">
                  {showResumeViewer ? (
                    <ResumeViewer 
                      fileName={currentFileName}
                      onExport={(format) => {
                        console.log(`Exported resume data as ${format}`);
                      }}
                    />
                  ) : (
                    <Card className="p-8 text-center h-full flex items-center justify-center">
                      <div>
                        <FileUser className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No Resume Processed</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload a PDF or DOCX file to view parsed resume data
                        </p>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="history" className="h-full m-0">
                  <HistoryPanel
                    onViewDocument={(entry) => {
                      toast.info(`Viewing ${entry.fileName}`);
                    }}
                    onExportData={(entry) => {
                      toast.success(`Exporting data from ${entry.fileName}`);
                    }}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - Content Viewer */}
          <div className="lg:col-span-3">
            {activeTab === 'resume' && showResumeViewer ? (
              <Card className="h-full">
                <ResumeViewer 
                  fileName={currentFileName}
                  onExport={(format) => {
                    console.log(`Exported resume data as ${format}`);
                  }}
                />
              </Card>
            ) : (
              <ImageViewer
                imageUrl={currentImage}
                onBoundingBoxSelect={handleBoundingBoxSelect}
                onOCRExtract={handleOCRExtract}
              />
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>Documents Processed: 42</span>
              <span>OCR Extractions: 156</span>
              <span>Tags Created: 12</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>System Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;