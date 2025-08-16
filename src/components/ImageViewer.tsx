import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCcw, Move, Square, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
}

interface ImageViewerProps {
  imageUrl?: string;
  onBoundingBoxSelect?: (box: BoundingBox) => void;
  onOCRExtract?: (box: BoundingBox) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  onBoundingBoxSelect,
  onOCRExtract
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<BoundingBox | null>(null);
  const [mode, setMode] = useState<'pan' | 'select'>('pan');

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setBoundingBoxes([]);
    setSelectedBox(null);
    setMode('pan');
    toast.success('View reset');
  };

  const getImageCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current.getBoundingClientRect();
    
    const x = (clientX - image.left) / scale;
    const y = (clientY - image.top) / scale;
    
    return { x, y };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const coords = getImageCoordinates(e.clientX, e.clientY);
    
    if (mode === 'select') {
      setIsSelecting(true);
      setSelectionStart(coords);
      setCurrentSelection({
        id: `temp-${Date.now()}`,
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        isSelected: false
      });
    } else {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [mode, scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSelecting && selectionStart && currentSelection) {
      const coords = getImageCoordinates(e.clientX, e.clientY);
      const width = Math.abs(coords.x - selectionStart.x);
      const height = Math.abs(coords.y - selectionStart.y);
      const x = Math.min(coords.x, selectionStart.x);
      const y = Math.min(coords.y, selectionStart.y);
      
      setCurrentSelection(prev => prev ? {
        ...prev,
        x,
        y,
        width,
        height
      } : null);
    } else if (isDragging) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [isSelecting, isDragging, selectionStart, currentSelection]);

  const handleMouseUp = useCallback(() => {
    if (isSelecting && currentSelection && currentSelection.width > 10 && currentSelection.height > 10) {
      const newBox: BoundingBox = {
        ...currentSelection,
        id: `box-${Date.now()}`,
        isSelected: true
      };
      
      setBoundingBoxes(prev => [...prev, newBox]);
      setSelectedBox(newBox.id);
      onBoundingBoxSelect?.(newBox);
      toast.success('Region selected for OCR');
    }
    
    setIsSelecting(false);
    setIsDragging(false);
    setSelectionStart(null);
    setCurrentSelection(null);
  }, [isSelecting, currentSelection, onBoundingBoxSelect]);

  const handleBoxSelect = (boxId: string) => {
    setBoundingBoxes(prev => prev.map(box => ({
      ...box,
      isSelected: box.id === boxId
    })));
    setSelectedBox(boxId);
    
    const box = boundingBoxes.find(b => b.id === boxId);
    if (box) {
      onBoundingBoxSelect?.(box);
    }
  };

  const handleOCRExtract = () => {
    if (selectedBox) {
      const box = boundingBoxes.find(b => b.id === selectedBox);
      if (box) {
        onOCRExtract?.(box);
        toast.success('OCR extraction started');
      }
    }
  };

  const selectedBoxData = boundingBoxes.find(box => box.id === selectedBox);

  return (
    <Card className="flex flex-col h-full bg-gradient-secondary border-0 shadow-medium">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'pan' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('pan')}
            className="gap-2"
          >
            <Move className="w-4 h-4" />
            Pan
          </Button>
          <Button
            variant={mode === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('select')}
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            Select
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOCRExtract}
          disabled={!selectedBoxData}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Extract OCR
        </Button>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden bg-muted relative cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imageUrl ? (
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center',
              transition: isDragging || isSelecting ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Document"
              className="max-w-full max-h-full object-contain shadow-soft"
              draggable={false}
            />
            
            {/* Bounding Boxes */}
            {boundingBoxes.map(box => (
              <div
                key={box.id}
                className={`absolute border-2 cursor-pointer ${
                  box.isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-accent bg-accent/5 hover:border-accent/70'
                }`}
                style={{
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                  transform: `scale(${1/scale})`
                }}
                onClick={() => handleBoxSelect(box.id)}
              />
            ))}
            
            {/* Current Selection */}
            {currentSelection && currentSelection.width > 0 && currentSelection.height > 0 && (
              <div
                className="absolute border-2 border-dashed border-primary bg-primary/20"
                style={{
                  left: currentSelection.x,
                  top: currentSelection.y,
                  width: currentSelection.width,
                  height: currentSelection.height,
                  transform: `scale(${1/scale})`
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No image loaded</p>
              <p className="text-sm">Upload an image to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {selectedBoxData && (
        <div className="p-3 border-t border-border bg-primary-muted text-sm">
          <span className="font-medium">Selected Region:</span> {Math.round(selectedBoxData.width)}×{Math.round(selectedBoxData.height)}px 
          at ({Math.round(selectedBoxData.x)}, {Math.round(selectedBoxData.y)})
        </div>
      )}
    </Card>
  );
};