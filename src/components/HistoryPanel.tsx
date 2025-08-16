import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, FileText, Eye, Download, Filter, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HistoryEntry {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'docx';
  processedAt: Date;
  extractedData: Array<{
    tagName: string;
    text: string;
    confidence: number;
  }>;
  extractionCount: number;
  status: 'completed' | 'processing' | 'error';
}

interface HistoryPanelProps {
  onViewDocument?: (entry: HistoryEntry) => void;
  onExportData?: (entry: HistoryEntry) => void;
}

// Mock data for demonstration
const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 'hist-1',
    fileName: 'resume-john-doe.pdf',
    fileType: 'pdf',
    processedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    extractedData: [
      { tagName: 'Name', text: 'John Doe', confidence: 0.95 },
      { tagName: 'Email', text: 'john.doe@email.com', confidence: 0.92 },
      { tagName: 'Phone', text: '+1 (555) 123-4567', confidence: 0.88 },
      { tagName: 'Company', text: 'Tech Solutions Inc.', confidence: 0.91 }
    ],
    extractionCount: 4,
    status: 'completed'
  },
  {
    id: 'hist-2',
    fileName: 'invoice-march-2024.pdf',
    fileType: 'pdf',
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    extractedData: [
      { tagName: 'Company', text: 'ABC Corporation', confidence: 0.96 },
      { tagName: 'Amount', text: '$1,250.00', confidence: 0.94 },
      { tagName: 'Date', text: '2024-03-15', confidence: 0.93 },
      { tagName: 'Address', text: '123 Business St, City, State 12345', confidence: 0.87 }
    ],
    extractionCount: 4,
    status: 'completed'
  },
  {
    id: 'hist-3',
    fileName: 'contract-scan.jpg',
    fileType: 'image',
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    extractedData: [
      { tagName: 'Name', text: 'Sarah Wilson', confidence: 0.89 },
      { tagName: 'Company', text: 'Wilson & Associates', confidence: 0.85 },
      { tagName: 'Date', text: '2024-03-10', confidence: 0.82 }
    ],
    extractionCount: 3,
    status: 'completed'
  },
  {
    id: 'hist-4',
    fileName: 'business-card.jpg',
    fileType: 'image',
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    extractedData: [],
    extractionCount: 0,
    status: 'processing'
  }
];

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  onViewDocument,
  onExportData
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFileType, setFilterFileType] = useState<string>('all');

  const filteredHistory = history.filter(entry => {
    const statusMatch = filterStatus === 'all' || entry.status === filterStatus;
    const typeMatch = filterFileType === 'all' || entry.fileType === filterFileType;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: HistoryEntry['status']) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'processing': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getFileTypeIcon = (fileType: HistoryEntry['fileType']) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'docx': return '📃';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Processing History
          </h3>
          <Badge variant="secondary" className="text-xs">
            {filteredHistory.length} documents
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterFileType} onValueChange={setFilterFileType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm">Process some documents to see history</p>
            </div>
          ) : (
            filteredHistory.map((entry, index) => (
              <div key={entry.id}>
                <Card className="p-4 hover:shadow-soft transition-shadow">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{getFileTypeIcon(entry.fileType)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{entry.fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={`text-xs ${getStatusColor(entry.status)}`}
                            >
                              {entry.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatTimeAgo(entry.processedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDocument?.(entry)}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {entry.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExportData?.(entry)}
                            className="h-7 w-7 p-0"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Extracted Data Summary */}
                    {entry.extractedData.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Extracted:</span>
                          <Badge variant="outline" className="text-xs">
                            {entry.extractionCount} items
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          {entry.extractedData.slice(0, 3).map((data, idx) => (
                            <div key={idx} className="text-xs bg-muted p-2 rounded">
                              <span className="font-medium text-primary">{data.tagName}:</span>{' '}
                              <span className="text-muted-foreground">{data.text}</span>
                              <span className="float-right text-success">
                                {Math.round(data.confidence * 100)}%
                              </span>
                            </div>
                          ))}
                          {entry.extractedData.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center py-1">
                              +{entry.extractedData.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {entry.status === 'processing' && (
                      <div className="text-xs text-warning">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                          Processing document...
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
                {index < filteredHistory.length - 1 && <Separator className="my-2" />}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};