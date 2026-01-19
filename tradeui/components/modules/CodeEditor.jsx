'use client';

import { Editor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Save } from 'lucide-react';
import { useState } from 'react';

export function CodeEditor({ 
  initialCode = '', 
  onSave, 
  onRun,
  isLoading = false,
  language = 'cpp'
}) {
  const [code, setCode] = useState(initialCode);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEditorChange = (value) => {
    setCode(value || '');
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(code);
    setHasChanges(false);
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Code Editor</CardTitle>
        <div className="flex gap-2">
          {onRun && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRun}
              disabled={isLoading}
            >
              <Play className="w-4 h-4" />
              Test Run
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Submission'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Editor
          height="100%"
          defaultLanguage={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
          }}
        />
      </CardContent>
    </Card>
  );
}
