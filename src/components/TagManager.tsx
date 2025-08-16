import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Tag, X, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface TagData {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface ExtractedData {
  id: string;
  text: string;
  tagId: string;
  timestamp: Date;
  confidence?: number;
}

interface TagManagerProps {
  onSaveExtraction?: (text: string, tagId: string) => void;
  extractedText?: string;
}

const DEFAULT_TAGS: TagData[] = [
  { id: 'name', name: 'Name', color: 'bg-blue-500', description: 'Person names' },
  { id: 'email', name: 'Email', color: 'bg-green-500', description: 'Email addresses' },
  { id: 'phone', name: 'Phone', color: 'bg-orange-500', description: 'Phone numbers' },
  { id: 'company', name: 'Company', color: 'bg-purple-500', description: 'Company names' },
  { id: 'address', name: 'Address', color: 'bg-red-500', description: 'Physical addresses' },
  { id: 'date', name: 'Date', color: 'bg-teal-500', description: 'Dates and timestamps' },
  { id: 'amount', name: 'Amount', color: 'bg-yellow-500', description: 'Monetary amounts' },
  { id: 'other', name: 'Other', color: 'bg-gray-500', description: 'Miscellaneous data' }
];

export const TagManager: React.FC<TagManagerProps> = ({
  onSaveExtraction,
  extractedText
}) => {
  const [tags, setTags] = useState<TagData[]>(DEFAULT_TAGS);
  const [extractions, setExtractions] = useState<ExtractedData[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    const newTag: TagData = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: `bg-${['blue', 'green', 'purple', 'orange', 'red', 'teal', 'yellow'][Math.floor(Math.random() * 7)]}-500`,
      description: newTagDescription.trim() || undefined
    };

    setTags(prev => [...prev, newTag]);
    setNewTagName('');
    setNewTagDescription('');
    setIsAddingTag(false);
    toast.success(`Tag "${newTag.name}" added`);
  };

  const handleRemoveTag = (tagId: string) => {
    if (DEFAULT_TAGS.some(tag => tag.id === tagId)) {
      toast.error('Cannot remove default tags');
      return;
    }
    
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    setExtractions(prev => prev.filter(ext => ext.tagId !== tagId));
    toast.success('Tag removed');
  };

  const handleSaveExtraction = () => {
    if (!extractedText?.trim()) {
      toast.error('No text to save');
      return;
    }

    if (!selectedTagId) {
      toast.error('Please select a tag');
      return;
    }

    const extraction: ExtractedData = {
      id: `ext-${Date.now()}`,
      text: extractedText.trim(),
      tagId: selectedTagId,
      timestamp: new Date(),
      confidence: Math.random() * 0.3 + 0.7 // Mock confidence score
    };

    setExtractions(prev => [...prev, extraction]);
    onSaveExtraction?.(extraction.text, selectedTagId);
    setSelectedTagId('');
    toast.success('Text saved to tag');
  };

  const getTagById = (tagId: string) => tags.find(tag => tag.id === tagId);

  const groupedExtractions = extractions.reduce((acc, ext) => {
    const tag = getTagById(ext.tagId);
    if (tag) {
      if (!acc[tag.name]) acc[tag.name] = [];
      acc[tag.name].push(ext);
    }
    return acc;
  }, {} as Record<string, ExtractedData[]>);

  return (
    <div className="space-y-6">
      {/* Save Extraction Section */}
      {extractedText && (
        <Card className="p-4 bg-accent-muted border-accent/20">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-accent-foreground">Extracted Text</Label>
              <div className="mt-1 p-3 bg-background rounded-md border text-sm">
                {extractedText}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tag-select" className="text-sm font-medium">Save to Tag</Label>
              <div className="flex gap-2">
                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSaveExtraction} disabled={!selectedTagId}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tag Management */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Tag Management
          </h3>
          <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tag-name">Tag Name</Label>
                  <Input
                    id="tag-name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name..."
                  />
                </div>
                <div>
                  <Label htmlFor="tag-description">Description (Optional)</Label>
                  <Input
                    id="tag-description"
                    value={newTagDescription}
                    onChange={(e) => setNewTagDescription(e.target.value)}
                    placeholder="Enter description..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddingTag(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTag}>
                    Add Tag
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="secondary" 
              className="flex items-center gap-2 py-1 px-2"
            >
              <div className={`w-2 h-2 rounded-full ${tag.color}`} />
              {tag.name}
              {!DEFAULT_TAGS.some(dt => dt.id === tag.id) && (
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemoveTag(tag.id)}
                />
              )}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Extracted Data Display */}
      {Object.keys(groupedExtractions).length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Extracted Data
          </h3>
          <div className="space-y-4">
            {Object.entries(groupedExtractions).map(([tagName, extractions]) => {
              const tag = tags.find(t => t.name === tagName);
              return (
                <div key={tagName} className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tag?.color}`} />
                    {tagName} ({extractions.length})
                  </h4>
                  <div className="space-y-1">
                    {extractions.map(ext => (
                      <div key={ext.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span className="flex-1">{ext.text}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {ext.confidence && (
                            <span className="text-xs">
                              {Math.round(ext.confidence * 100)}%
                            </span>
                          )}
                          <span className="text-xs">
                            {ext.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};