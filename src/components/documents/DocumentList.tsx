'use client';

import { useState } from 'react';
import type { Document } from '@/types';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  proposal_contract: 'Proposal / Contract',
  core_principles: 'Core Principles',
  core_systems_field_guide: 'Core Systems Field Guide',
  contract_recommendations: 'Contract Recommendations',
  building_science: 'Building Science',
  environmental_testing: 'Environmental Testing',
  owners_manual_intro: "Owner's Manual Intro",
  hds_checklist: 'HDS Checklist',
  hds_trade_section: 'HDS Trade Section',
  custom: 'Custom',
};

const VISIBILITY_LABELS: Record<string, string> = {
  admin_only: 'Admin Only',
  client: 'Client',
  professional: 'Professional',
  all_participants: 'All Participants',
};

interface DocumentListProps {
  documents: Document[];
  isAdmin: boolean;
  onShare: (doc: Document) => void;
  onSign: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onDownload: (doc: Document) => void;
}

export default function DocumentList({
  documents,
  isAdmin,
  onShare,
  onSign,
  onEdit,
  onDelete,
  onDownload,
}: DocumentListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.keys(DOCUMENT_TYPE_LABELS))
  );

  // Group documents by type
  const grouped = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    const type = doc.documentType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  if (documents.length === 0) {
    return (
      <div className="bg-card-bg rounded-lg border border-border p-8 text-center">
        <p className="text-muted text-sm">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, docs]) => (
        <div key={type} className="bg-card-bg rounded-lg border border-border">
          <button
            onClick={() => toggleGroup(type)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-background/50 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                {DOCUMENT_TYPE_LABELS[type] || type}
              </h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {docs.length}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-muted transition-transform ${
                expandedGroups.has(type) ? 'rotate-180' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expandedGroups.has(type) && (
            <div className="border-t border-border">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {doc.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-border text-muted whitespace-nowrap">
                        {VISIBILITY_LABELS[doc.visibility] || doc.visibility}
                      </span>
                      {doc.sharedAt && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                          Shared
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {doc.fileName && (
                        <span className="text-xs text-muted">{doc.fileName}</span>
                      )}
                      {doc.description && (
                        <span className="text-xs text-muted truncate max-w-xs">
                          {doc.description}
                        </span>
                      )}
                    </div>
                    {/* Signature status */}
                    {doc.signatureRequired && (
                      <div className="mt-1">
                        {doc.signedAt ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Signed by {doc.signedByName} on{' '}
                            {new Date(doc.signedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Signature required
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {/* Sign button for documents needing signature */}
                    {doc.signatureRequired && !doc.signedAt && (
                      <button
                        onClick={() => onSign(doc)}
                        className="px-3 py-1 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                      >
                        Sign
                      </button>
                    )}
                    {/* Download button */}
                    {doc.storagePath && (
                      <button
                        onClick={() => onDownload(doc)}
                        className="px-3 py-1 text-xs border border-border text-foreground rounded-md hover:bg-background transition-colors"
                      >
                        Download
                      </button>
                    )}
                    {/* Edit & admin actions */}
                    <button
                      onClick={() => onEdit(doc)}
                      className="px-3 py-1 text-xs border border-border text-foreground rounded-md hover:bg-background transition-colors"
                    >
                      Edit
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onShare(doc)}
                          className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => onDelete(doc)}
                          className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
