import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function LayersPanel({ elements, onUpdateElement, onDeleteElement, onReorder, onSelectElement, selectedElement }) {
  
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  }

  return (
    <Card className="shadow-none h-full flex flex-col bg-transparent border-0">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-bold hebrew-font">שכבות</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="layers">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {elements.map((el, index) => (
                  <Draggable key={el.id} draggableId={String(el.id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onSelectElement(el)}
                        className={`p-2 border rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${selectedElement?.id === el.id ? 'bg-blue-100 border-blue-400 shadow-sm' : 'bg-white hover:bg-gray-50'}`}
                      >
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <span className="flex-1 text-sm truncate hebrew-font">{el.content || 'אלמנט טקסט'}</span>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { visible: !el.visible }); }}>
                          {el.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); onDeleteElement(el.id); }}>
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}