


import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button, Skeleton, EmptyState, Badge } from '@/components/ui';
import { PersonNode, NodeDetailsSheet, AddRelativeDialog, RequestsInbox } from '@/components/genealogy';
import { useFamilyGraph, usePendingRequests } from '@/lib/hooks/useGenealogy';
import { usePageDetail } from '@/lib/hooks/usePages';
import type { GraphNode } from '@/lib/api/genealogy';

const nodeTypes = {
  person: PersonNode,
};

const relationTypeLabels: Record<string, string> = {
  mother: 'мать',
  father: 'отец',
  brother: 'брат',
  sister: 'сестра',
  spouse: 'супруг',
  son: 'сын',
  daughter: 'дочь',
  child: 'ребёнок',
  parent: 'родитель',
  sibling: 'брат/сестра',
};

export function FamilyTreePage() {
  const { id: pageId } = useParams<{ id: string }>();
  const [depth, setDepth] = useState(3);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddRelative, setShowAddRelative] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [addRelativeSource, setAddRelativeSource] = useState<GraphNode | null>(null);

  const { data: page, isLoading: pageLoading } = usePageDetail(pageId);
  const personId = page?.person?.id;

  const { data: graphData, isLoading: graphLoading, isError, refetch } = useFamilyGraph(personId, depth);
  const { data: pendingData } = usePendingRequests();
  const pendingCount = pendingData?.items?.length ?? 0;

  const [nodes, setNodes, onNodesChange] = useNodesState([] as any[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as any[]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setShowDetails(true);
  }, []);

  const handleAddRelative = useCallback((node: GraphNode) => {
    setAddRelativeSource(node);
    setShowAddRelative(true);
    setShowDetails(false);
  }, []);

  const handleCreatePerson = useCallback((_data: { full_name: string; life_status: string; gender: string }): Promise<string> => {

    return Promise.reject(new Error('Person creation not implemented yet'));
  }, []);


  useEffect(() => {
    if (!graphData) return;

    const { nodes: graphNodes, edges: graphEdges, root_person_id } = graphData;


    const nodeMap = new Map<string, GraphNode>();
    graphNodes.forEach((n) => nodeMap.set(n.id, n));


    const children = new Map<string, string[]>();
    graphEdges.forEach((e) => {
      const list = children.get(e.from) ?? [];
      list.push(e.to);
      children.set(e.from, list);
    });


    const levels = new Map<string, number>();
    const queue: string[] = [root_person_id];
    levels.set(root_person_id, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = levels.get(current) ?? 0;
      const childList = children.get(current) ?? [];
      childList.forEach((child) => {
        if (!levels.has(child)) {
          levels.set(child, currentLevel + 1);
          queue.push(child);
        }
      });
    }


    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, nodeId) => {
      const group = levelGroups.get(level) ?? [];
      group.push(nodeId);
      levelGroups.set(level, group);
    });


    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 100;
    const HORIZONTAL_GAP = 50;
    const VERTICAL_GAP = 120;

    const flowNodes = graphNodes.map((gn) => {
      const level = levels.get(gn.id) ?? 0;
      const levelNodes = levelGroups.get(level) ?? [];
      const indexInLevel = levelNodes.indexOf(gn.id);
      const levelWidth = levelNodes.length * (NODE_WIDTH + HORIZONTAL_GAP);

      return {
        id: gn.id,
        type: 'person',
        position: {
          x: indexInLevel * (NODE_WIDTH + HORIZONTAL_GAP) - levelWidth / 2 + NODE_WIDTH / 2,
          y: level * (NODE_HEIGHT + VERTICAL_GAP),
        },
        data: {
          ...gn,
          isRoot: gn.id === root_person_id,
          isSelected: selectedNode?.id === gn.id,
          onClick: handleNodeClick,
        },
      };
    });

    const flowEdges = graphEdges.map((ge) => ({
      id: ge.id,
      source: ge.from,
      target: ge.to,
      label: relationTypeLabels[ge.relation_type] ?? ge.relation_type,
      labelStyle: { fill: '#a1a1aa', fontSize: 10 },
      labelBgStyle: { fill: '#18181b', fillOpacity: 0.8 },
      labelBgPadding: [4, 2] as [number, number],
      style: { stroke: '#f97316', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
      animated: false,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, selectedNode, handleNodeClick, setNodes, setEdges]);

  const isLoading = pageLoading || graphLoading;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-64 h-64 rounded-xl mx-auto" />
          <Skeleton className="w-48 h-6 mx-auto" />
          <p className="text-zinc-400">Загрузка дерева...</p>
        </div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <EmptyState
        icon="Warning"
        title="Ошибка загрузки"
        description="Не удалось загрузить семейное дерево"
        action={<Button onClick={() => void refetch()}>Повторить</Button>}
      />
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <EmptyState
          icon="Tree"
          title="Дерево пусто"
          description="Добавьте первых родственников, чтобы построить семейное дерево"
          action={
            <Button onClick={() => {
              if (graphData?.nodes[0]) {
                handleAddRelative(graphData.nodes[0]);
              }
            }}>
              Добавить родственника
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">

      <div className="flex items-center justify-between p-4 border-b border-surface-200">
        <div className="flex items-center gap-4">
          <Link to={`/app/pages/${pageId}`} className="text-zinc-400 hover:text-white transition-colors">
            <- Назад
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Семейное дерево</h1>
            <p className="text-sm text-zinc-400">{page.person?.full_name ?? 'Неизвестно'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-100 rounded-lg px-3 py-1.5">
            <span className="text-sm text-zinc-400">Глубина:</span>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
            >
              {[2, 3, 4, 5].map((d) => (
                <option key={d} value={d} className="bg-surface-200">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRequests(true)}
            className="relative"
          >
            Запросы
            {pendingCount > 0 && (
              <Badge variant="warning" size="sm" className="absolute -top-1 -right-1">
                {pendingCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const rootNode = graphData.nodes.find((n) => n.id === graphData.root_person_id);
              if (rootNode) handleAddRelative(rootNode);
            }}
          >
            + Добавить
          </Button>
        </div>
      </div>


      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="bg-surface-200"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
          <Controls
            className="!bg-surface-100 !border-surface-300 !rounded-xl !shadow-lg"
            showInteractive={false}
          />
        </ReactFlow>


        <div className="absolute bottom-4 right-4 flex flex-col gap-2 md:hidden">
          <Button
            variant="primary"
            size="sm"
            className="rounded-full w-12 h-12 p-0"
            onClick={() => {
              const rootNode = graphData.nodes.find((n) => n.id === graphData.root_person_id);
              if (rootNode) handleAddRelative(rootNode);
            }}
          >
            +
          </Button>
        </div>
      </div>


      <NodeDetailsSheet
        node={selectedNode}
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedNode(null);
        }}
        onAddRelative={handleAddRelative}
        canEdit={true}
      />


      <AddRelativeDialog
        isOpen={showAddRelative}
        onClose={() => {
          setShowAddRelative(false);
          setAddRelativeSource(null);
        }}
        sourceNode={addRelativeSource}
        onCreatePerson={handleCreatePerson}
      />


      {showRequests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRequests(false)} />
          <div className="relative bg-surface-100 rounded-2xl border border-surface-200 shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface-100 p-4 border-b border-surface-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Запросы</h2>
              <button
                onClick={() => setShowRequests(false)}
                className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                X
              </button>
            </div>
            <div className="p-4">
              <RequestsInbox onClose={() => setShowRequests(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
