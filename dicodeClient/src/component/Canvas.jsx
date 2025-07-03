import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import '@xyflow/react/dist/style.css';

// Editable node component
function EditableNode({ data, id }) {
  const [value, setValue] = React.useState(data.label);

  const handleBlur = () => {
    data.onRename(id, value);
  };

  return (
    <div className="bg-[#1e40af] border-2 border-cyan-500 text-white rounded-xl px-4 py-2 shadow-[0_0_10px_#22d3ee99] text-sm font-medium min-w-[100px] text-center">
      <Handle type="target" position={Position.Top} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.target.blur();
        }}
        autoFocus={false}
        className="bg-transparent border-none outline-none text-white text-center w-full cursor-text"
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { editable: EditableNode };

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Add initial node on mount
  useEffect(() => {
    handleAddNode();
  }, []);

  const handleAddNode = () => {
    const id = nanoid();
    const newNode = {
      id,
      type: 'editable',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: 'Node',
        onRename: (id, newLabel) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === id
                ? {
                    ...n,
                    data: { ...n.data, label: newLabel, onRename: n.data.onRename },
                  }
                : n
            )
          );
        },
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'smoothstep', animated: true }, eds)
      ),
    [setEdges]
  );

  // Delete selected nodes and edges via Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' ) {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setNodes, setEdges]);

  return (
    <div className="relative w-full h-[80vh] bg-[#0a0a0a] rounded-lg overflow-hidden border border-cyan-700 shadow-2xl">
      <button
        onClick={handleAddNode}
        className="absolute z-10 top-4 left-4 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg transition"
      >
        + Add Node
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background variant="dots" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
