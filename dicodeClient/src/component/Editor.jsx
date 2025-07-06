import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import useSocket from '../provider/SocketProvider';

function CodeEditor({ role = "viewer", roomId }) {
    const [code, setCode] = useState("");
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const isRemoteChangeRef = useRef(false);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleIncomingChanges = ({ changes }) => {

            const editor = editorRef.current;
            const monaco = monacoRef.current;

            if (!editor || !monaco) return;
            const model = editor.getModel();
            if (!model) return;

            isRemoteChangeRef.current = true;

            model.pushEditOperations(
                [],
                changes.map(change => ({
                    range: new monaco.Range(
                        change.range.startLineNumber,
                        change.range.startColumn,
                        change.range.endLineNumber,
                        change.range.endColumn
                    ),
                    text: change.text,
                    forceMoveMarkers: true
                })),
                () => null
            );

            isRemoteChangeRef.current = false;
        };

        socket.on("find-latest-code", ({ userId }) => {
            const editor = editorRef.current;
            if (!editor) return;

            const latestCode = editor.getValue();
            socket.emit("got-code", { code: latestCode, userId });
            setCode(latestCode);
        });


        socket.on("sent-latest-code", ({ code }) => {
            console.log("got code ",code );
            
            if (editorRef.current) {
                const editor = editorRef.current;

                const currentCode = editor.getValue();
                if (currentCode !== code) {
                    editor.setValue(code);
                }
            }

            setCode(code);
        });


        socket.on("incomming-code-change", handleIncomingChanges);

        return () => {
            socket.off("incomming-code-change", handleIncomingChanges);
        };
    }, [socket]);

    // When editor is mounted
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        editor.onDidChangeModelContent((event) => {
            if (isRemoteChangeRef.current) return;

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

            socket.emit("code-change", { changes });
        });
    };

    const handleEditorChange = (value) => {
        setCode(value);
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
