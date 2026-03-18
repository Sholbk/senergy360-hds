'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChecklistItemData {
  id: string;
  label: string;
  isChecked: boolean;
  checkedBy: string | null;
  notes: string | null;
  mainCategoryId: string | null;
  subCategoryId: string | null;
}

interface MaterialData {
  materialName: string;
  manufacturer: string | null;
  primaryUse: string | null;
  assignedTo: string;
  mainCategoryId: string;
}

interface Principle {
  id: string;
  numeral: number;
  name: string;
  description: string | null;
}

interface HdsWorkflowViewProps {
  principles: Principle[];
  checklistItems: ChecklistItemData[];
  projectMaterials: MaterialData[];
  isAdmin: boolean;
  initialized: boolean;
  onToggleItem: (itemId: string, checked: boolean) => void;
  onAddItem: (mainCategoryId: string, label: string) => void;
  onInitialize: () => void;
  initializing: boolean;
}

function getProgressColor(pct: number): string {
  if (pct === 0) return 'bg-gray-200';
  if (pct <= 25) return 'bg-red-400';
  if (pct <= 50) return 'bg-orange-400';
  if (pct <= 75) return 'bg-yellow-400';
  return 'bg-green-500';
}

function getProgressTextColor(pct: number): string {
  if (pct === 0) return 'text-muted';
  if (pct <= 25) return 'text-red-600';
  if (pct <= 50) return 'text-orange-600';
  if (pct <= 75) return 'text-yellow-600';
  return 'text-green-600';
}

export default function HdsWorkflowView({
  principles,
  checklistItems,
  projectMaterials,
  isAdmin,
  initialized,
  onToggleItem,
  onAddItem,
  onInitialize,
  initializing,
}: HdsWorkflowViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(principles.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleAddItem = (mainCategoryId: string) => {
    if (!newItemLabel.trim()) return;
    onAddItem(mainCategoryId, newItemLabel.trim());
    setNewItemLabel('');
    setAddingTo(null);
  };

  // Calculate overall progress
  const totalItems = checklistItems.length;
  const checkedItems = checklistItems.filter((i) => i.isChecked).length;
  const overallPct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  if (!initialized) {
    return (
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-2">Initialize HDS Specifications</h3>
          <p className="text-sm text-muted mb-6">
            Set up the 12 Core Principles checklist for this project. This will create verification items
            for each building system based on the SENERGY360 Healthy Design Specifications framework.
          </p>
          <button
            onClick={onInitialize}
            disabled={initializing}
            className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {initializing ? 'Initializing...' : 'Initialize HDS Checklist'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Overall Progress */}
      <div className="bg-card-bg rounded-lg border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Overall HDS Progress</h3>
            <p className="text-xs text-muted mt-0.5">{checkedItems} of {totalItems} items verified</p>
          </div>
          <span className={cn('text-2xl font-bold', getProgressTextColor(overallPct))}>
            {overallPct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={cn('h-3 rounded-full transition-all', getProgressColor(overallPct))}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            Expand All
          </button>
          <span className="text-xs text-muted">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Principle Cards */}
      <div className="space-y-3">
        {principles.map((principle) => {
          const items = checklistItems.filter((i) => i.mainCategoryId === principle.id);
          const materials = projectMaterials.filter((m) => m.mainCategoryId === principle.id);
          const checked = items.filter((i) => i.isChecked).length;
          const total = items.length;
          const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
          const isExpanded = expandedIds.has(principle.id);

          return (
            <div key={principle.id} className="bg-card-bg rounded-lg border border-border overflow-hidden">
              {/* Header */}
              <button
                onClick={() => toggleExpanded(principle.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-primary-bg/30 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                  {principle.numeral}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{principle.name}</h4>
                  {total > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[200px]">
                        <div
                          className={cn('h-1.5 rounded-full transition-all', getProgressColor(pct))}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn('text-xs font-medium', getProgressTextColor(pct))}>
                        {checked}/{total}
                      </span>
                    </div>
                  )}
                </div>
                <svg
                  className={cn('w-4 h-4 text-muted transition-transform', isExpanded && 'rotate-180')}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4">
                  {principle.description && (
                    <p className="text-xs text-muted mt-3 mb-3">{principle.description}</p>
                  )}

                  {/* Checklist Items */}
                  {items.length > 0 ? (
                    <div className="space-y-1 mt-3">
                      <h5 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                        Verification Checklist
                      </h5>
                      {items.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-start gap-2.5 py-1.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            onChange={(e) => onToggleItem(item.id, e.target.checked)}
                            className="mt-0.5 accent-primary"
                          />
                          <span
                            className={cn(
                              'text-sm transition-colors',
                              item.isChecked
                                ? 'text-muted line-through'
                                : 'text-foreground group-hover:text-primary'
                            )}
                          >
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted italic mt-3">No checklist items yet.</p>
                  )}

                  {/* Add Item */}
                  {isAdmin && (
                    <div className="mt-3">
                      {addingTo === principle.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newItemLabel}
                            onChange={(e) => setNewItemLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddItem(principle.id);
                              if (e.key === 'Escape') { setAddingTo(null); setNewItemLabel(''); }
                            }}
                            placeholder="Item label..."
                            className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddItem(principle.id)}
                            className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => { setAddingTo(null); setNewItemLabel(''); }}
                            className="px-2 py-1 text-xs text-muted hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTo(principle.id)}
                          className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                        >
                          <span>+</span> Add checklist item
                        </button>
                      )}
                    </div>
                  )}

                  {/* Approved Materials */}
                  {materials.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                        Approved Materials
                      </h5>
                      <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-background text-xs text-muted">
                              <th className="text-left px-3 py-2 font-medium">Material</th>
                              <th className="text-left px-3 py-2 font-medium">Manufacturer</th>
                              <th className="text-left px-3 py-2 font-medium">Use</th>
                              <th className="text-left px-3 py-2 font-medium">Assigned To</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {materials.map((mat, i) => (
                              <tr key={i} className="hover:bg-primary-bg/20">
                                <td className="px-3 py-2 text-foreground">{mat.materialName}</td>
                                <td className="px-3 py-2 text-muted">{mat.manufacturer || '—'}</td>
                                <td className="px-3 py-2 text-muted">{mat.primaryUse || '—'}</td>
                                <td className="px-3 py-2 text-muted">{mat.assignedTo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
