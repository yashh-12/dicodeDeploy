import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ role = "viewer", roomId }) {
    const [code, setCode] = useState("// Start typing your code here...");
    const editorRef = useRef(null); // for accessing the Monaco editor instance

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Listen for content changes and log only diffs (deltas)
        editor.onDidChangeModelContent((event) => {
            const changes = event.changes.map(change => ({
                range: {
                    startLineNumber: change.range.startLineNumber,
                    startColumn: change.range.startColumn,
                    endLineNumber: change.range.endLineNumber,
                    endColumn: change.range.endColumn,
                },
                text: change.text,
                rangeLength: change.rangeLength,
            }));

            console.log("🔄 Code delta changes:", changes);
        });
    };

    const handleEditorChange = (value) => {
        setCode(value); // update full code state if needed
    };

    return (
        <div className="w-full h-[75vh] bg-[#1e1e2e] rounded-lg overflow-hidden">
            <Editor
                height="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    readOnly: role === "viewer",
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontLigatures: true,
                    automaticLayout: true,
                    scrollbar: {
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                    },
                }}
            />
        </div>
    );
}

export default CodeEditor;
