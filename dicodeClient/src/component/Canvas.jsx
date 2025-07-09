import React, { useCallback, useEffect, useState } from 'react';
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
import useSocket from '../provider/SocketProvider';

// Editable node component with null safety
function EditableNode({ data = {}, id }) {
  const [value, setValue] = useState(data?.label ?? '');

  useEffect(() => {
    setValue(data?.label ?? '');
  }, [data?.label]);

  const handleBlur = () => {
    if (value !== data?.label && typeof data?.onRename === 'function') {
      data?.onRename(id, value);
    }
  };

  return (
    <div className="bg-[#1e40af] border-2 border-cyan-500 text-white rounded-xl px-4 py-2 shadow-[0_0_10px_#22d3ee99] text-sm font-medium min-w-[100px] text-center">
      <Handle type="target" position={Position.Top} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
        className="bg-transparent border-none outline-none text-white text-center w-full cursor-text"
        disabled={!data?.canEdit}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { editable: EditableNode };

export default function Canvas({ role = '' }) {
  const { socket } = useSocket() ?? {}; // ensure object

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const isEditor = role === 'editor';

  // Rename handler with null safety
  const injectRenameHandler = useCallback(
    (node = {}) => ({
      ...node,
      data: {
        ...(node.data ?? {}),
        canEdit: isEditor,
        onRename: isEditor
          ? (id, newLabel) => {
              setNodes((nds = []) =>
                nds.map((n) =>
                  n.id === id
                    ? { ...n, data: { ...(n.data ?? {}), label: newLabel } }
                    : n
                )
              );
              socket?.emit?.('rename-node', { nodeId: id, label: newLabel });
            }
          : () => {},
      },
    }),
    [setNodes, socket, isEditor]
  );

  // Add initial node on mount (only if editor)
  useEffect(() => {
    if (isEditor) handleAddNode();
  }, [isEditor]);

  const handleAddNode = () => {
    const id = nanoid();
    const newNode = injectRenameHandler({
      id,
      type: 'editable',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: 'Node' },
    });

    setNodes((nds = []) => [...nds, newNode]);
    socket?.emit?.('add-node', { node: newNode });
  };

  // Connect nodes safely
  const onConnect = useCallback(
    (params) => {
      if (!isEditor) return;
      const newEdge = { ...params, type: 'smoothstep', animated: true, id: nanoid() };
      setEdges((eds = []) => addEdge(newEdge, eds));
      socket?.emit?.('connect-nodes', { edge: newEdge });
    },
    [setEdges, socket, isEditor]
  );

  // Handle delete key
  useEffect(() => {
    if (!isEditor) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        setNodes((nds = []) => {
          const selected = nds.filter((n) => n?.selected);
          selected.forEach((n) => socket?.emit?.('delete-node', { nodeId: n.id }));
          return nds.filter((n) => !n?.selected);
        });

        setEdges((eds = []) => {
          const selected = eds.filter((e) => e?.selected);
          selected.forEach((e) => socket?.emit?.('delete-edge', { edgeId: e.id }));
          return eds.filter((e) => !e?.selected);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setNodes, setEdges, socket, isEditor]);

  // Handle incoming socket events
  useEffect(() => {
    if (!socket) return;

    socket.on?.('node-added', ({ node }) => {
      const newNode = injectRenameHandler(node);
      setNodes((nds = []) => [...nds, newNode]);
    });

    socket.on?.('node-deleted', ({ nodeId }) => {
      setNodes((nds = []) => nds.filter((n) => n.id !== nodeId));
    });

    socket.on?.('node-renamed', ({ nodeId, label }) => {
      setNodes((nds = []) =>
        nds.map((n) =>
          n.id === nodeId ? injectRenameHandler({ ...n, data: { ...(n.data ?? {}), label } }) : n
        )
      );
    });

    socket.on?.('edge-connected', ({ edge }) => {
      setEdges((eds = []) => [...eds, edge]);
    });

    socket.on?.('edge-deleted', ({ edgeId }) => {
      setEdges((eds = []) => eds.filter((e) => e.id !== edgeId));
    });

    return () => {
      socket.off?.('node-added');
      socket.off?.('node-deleted');
      socket.off?.('node-renamed');
      socket.off?.('edge-connected');
      socket.off?.('edge-deleted');
    };
  }, [socket, injectRenameHandler]);

  return (
    <div className="relative w-full h-[80vh] bg-[#0a0a0a] rounded-lg overflow-hidden border border-cyan-700 shadow-2xl">
      {isEditor && (
        <button
          onClick={handleAddNode}
          className="absolute z-10 top-4 left-4 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg transition"
        >
          + Add Node
        </button>
      )}

      <ReactFlow
        nodes={nodes ?? []}
        edges={edges ?? []}
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
