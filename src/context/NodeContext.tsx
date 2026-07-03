import { createContext, h } from 'preact';
import { ReactNode } from 'preact/compat';
import { useState, useContext } from 'preact/hooks';

interface SceneNodeInfo {
  name: string;
  id: string;
}

interface NodeContextProps {
  nodes: SceneNodeInfo[];
  setNodes: (nodes: SceneNodeInfo[]) => void;
}

const NodeContext = createContext<NodeContextProps | null>(null);

export function NodeProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<SceneNodeInfo[]>([]);

  return (
    <NodeContext.Provider value={{ nodes, setNodes }}>
      {children}
    </NodeContext.Provider>
  );
}

export function useNodes() {
  const context = useContext(NodeContext);
  if (!context) throw new Error("useNodes must be used within a NodeProvider");
  return context;
}