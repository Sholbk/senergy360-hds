'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface ChecklistItem {
  id: string;
  label: string;
  notes: string | null;
  isChecked: boolean;
  checkedBy: string | null;
  checkedAt: string | null;
  sortOrder: number;
  categoryName: string;
}

interface ChecklistViewProps {
  items: ChecklistItem[];
  isAdmin: boolean;
  onToggle: (itemId: string, checked: boolean) => void;
  onAddItem: (categoryName: string, label: string) => void;
  onEditItem: (itemId: string, label: string, notes: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function ChecklistView({
  items,
  isAdmin,
  onToggle,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: ChecklistViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategory, setAddCategory] = useState('');
  const [addLabel, setAddLabel] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<ChecklistItem | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryItemLabel, setNewCategoryItemLabel] = useState('');

  // Group items by category
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    const cat = item.categoryName || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const inputClass =
    'w-full px-3 py-2 border border-border rounded-md text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary';

  const openAddModal = (category: string) => {
    setAddCategory(category);
    setAddLabel('');
    setShowAddModal(true);
  };

  const handleAdd = () => {
    if (!addLabel.trim()) return;
    onAddItem(addCategory, addLabel.trim());
    setShowAddModal(false);
  };

  const openEditModal = (item: ChecklistItem) => {
    setEditItem(item);
    setEditLabel(item.label);
    setEditNotes(item.notes || '');
    setShowEditModal(true);
  };

  const handleEdit = () => {
    if (!editItem || !editLabel.trim()) return;
    onEditItem(editItem.id, editLabel.trim(), editNotes.trim());
    setShowEditModal(false);
  };

  const confirmDelete = (itemId: string) => {
    setDeleteItemId(itemId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (!deleteItemId) return;
    onDeleteItem(deleteItemId);
    setShowDeleteConfirm(false);
    setDeleteItemId(null);
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim() || !newCategoryItemLabel.trim()) return;
    onAddItem(newCategoryName.trim(), newCategoryItemLabel.trim());
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryItemLabel('');
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowNewCategoryModal(true)}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Add New Category
          </button>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted italic">No checklist items yet.</p>
          {isAdmin && (
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="mt-3 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Add First Category
            </button>
          )}
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="bg-card-bg rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {category}
              </h3>
              {isAdmin && (
                <button
                  onClick={() => openAddModal(category)}
                  className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Add Item
                </button>
              )}
            </div>

            <div className="space-y-3">
              {grouped[category].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-md border border-border bg-background"
                >
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={(e) => onToggle(item.id, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        item.isChecked ? 'line-through text-muted' : 'text-foreground'
                      }`}
                    >
                      {item.label}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted mt-1">{item.notes}</p>
                    )}
                    {item.isChecked && item.checkedBy && (
                      <p className="text-xs text-muted mt-1">
                        Checked by {item.checkedBy}
                        {item.checkedAt &&
                          ` on ${new Date(item.checkedAt).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-2 py-1 text-xs border border-border text-muted rounded-md hover:bg-background transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add Item Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Add Item - ${addCategory}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Label</label>
            <input
              type="text"
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              maxLength={500}
              placeholder="Checklist item label..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!addLabel.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Add Item
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Item">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Label</label>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              maxLength={500}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Optional notes..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={!editLabel.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-sm text-foreground">Are you sure you want to delete this checklist item?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* New Category Modal */}
      <Modal isOpen={showNewCategoryModal} onClose={() => setShowNewCategoryModal(false)} title="Add New Category">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category Name</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              maxLength={200}
              placeholder="e.g., Plumbing, Electrical, HVAC..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">First Item Label</label>
            <input
              type="text"
              value={newCategoryItemLabel}
              onChange={(e) => setNewCategoryItemLabel(e.target.value)}
              maxLength={500}
              placeholder="First checklist item in this category..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewCategoryModal(false)}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewCategory}
              disabled={!newCategoryName.trim() || !newCategoryItemLabel.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Add Category
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
