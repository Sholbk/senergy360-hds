import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import styles, { GOLD } from './report-styles';

export interface ReportPhoto {
  buffer: Buffer;
  caption?: string;
  category?: string;
}

export interface ChecklistSection {
  categoryName: string;
  items: {
    label: string;
    isChecked: boolean;
    notes?: string;
    checkedBy?: string;
    checkedAt?: string;
  }[];
}

export interface ParticipantSection {
  orgName: string;
  role: string;
  contactName: string;
  email?: string;
  phone?: string;
  materials: { name: string; manufacturer?: string; primaryUse?: string; notes?: string }[];
}

export interface ReportData {
  projectName: string;
  projectType: string;
  description?: string;
  buildingPlanSummary?: string;
  siteAddress: string;
  reportDate: string;
  preparedFor: string;
  preparedBy: string;
  checklistSections: ChecklistSection[];
  totalItems: number;
  checkedItems: number;
  photos: ReportPhoto[];
  participants: ParticipantSection[];
}

export default function ReportTemplate({ data }: { data: ReportData }) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.goldBar} />
        <Text style={styles.coverTitle}>Healthy Design Specifications</Text>
        <Text style={styles.coverTitle}>Report</Text>
        <View style={styles.goldBar} />
        <Text style={{ fontSize: 18, color: '#1a1a1a', marginTop: 30, fontWeight: 'bold' }}>{data.projectName}</Text>
        <Text style={styles.coverDetail}>{data.siteAddress}</Text>
        <Text style={{ ...styles.coverDetail, marginTop: 40 }}>Prepared for: {data.preparedFor}</Text>
        <Text style={styles.coverDetail}>Prepared by: {data.preparedBy}</Text>
        <Text style={styles.coverDetail}>{data.reportDate}</Text>
        <View style={{ ...styles.goldBar, position: 'absolute', bottom: 60, left: 40, right: 40 }} />
        <Text style={{ ...styles.textSmall, position: 'absolute', bottom: 40, textAlign: 'center' }}>CORE Framework — Construction Project Management</Text>
      </Page>

      {/* Executive Summary */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionHeader}>Executive Summary</Text>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.checkedItems}/{data.totalItems}</Text>
            <Text style={styles.statLabel}>Checklist Complete</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.photos.length}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.participants.length}</Text>
            <Text style={styles.statLabel}>Team Members</Text>
          </View>
        </View>

        <Text style={styles.subHeader}>Project Type</Text>
        <Text style={styles.text}>{data.projectType}</Text>

        {data.description && (
          <>
            <Text style={styles.subHeader}>Description</Text>
            <Text style={styles.text}>{data.description}</Text>
          </>
        )}

        {data.buildingPlanSummary && (
          <>
            <Text style={styles.subHeader}>Building Plan Summary</Text>
            <Text style={styles.text}>{data.buildingPlanSummary}</Text>
          </>
        )}

        <PageFooter />
      </Page>

      {/* Checklist Sections */}
      {data.checklistSections.length > 0 && (
        <Page size="LETTER" style={styles.page} wrap>
          <Text style={styles.sectionHeader}>Inspection Checklist</Text>
          {data.checklistSections.map((section, sIdx) => (
            <View key={sIdx} wrap={false} style={{ marginBottom: 16 }}>
              <Text style={styles.subHeader}>{section.categoryName}</Text>
              {section.items.map((item, iIdx) => (
                <View key={iIdx} style={styles.checklistItem}>
                  <View style={item.isChecked ? styles.checkboxChecked : styles.checkboxUnchecked} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.text}>{item.label}</Text>
                    {item.notes && <Text style={styles.textMuted}>Note: {item.notes}</Text>}
                  </View>
                </View>
              ))}
            </View>
          ))}
          <PageFooter />
        </Page>
      )}

      {/* Photo Documentation */}
      {data.photos.length > 0 && (
        <Page size="LETTER" style={styles.page} wrap>
          <Text style={styles.sectionHeader}>Photo Documentation</Text>
          {/* Render photos in pairs */}
          {Array.from({ length: Math.ceil(data.photos.length / 2) }).map((_, rowIdx) => {
            const left = data.photos[rowIdx * 2];
            const right = data.photos[rowIdx * 2 + 1];
            return (
              <View key={rowIdx} style={styles.photoRow} wrap={false}>
                <View style={styles.photoContainer}>
                  <Image src={{ data: left.buffer, format: 'png' }} style={styles.photo} />
                  {left.caption && <Text style={styles.photoCaption}>{left.caption}</Text>}
                </View>
                {right && (
                  <View style={styles.photoContainer}>
                    <Image src={{ data: right.buffer, format: 'png' }} style={styles.photo} />
                    {right.caption && <Text style={styles.photoCaption}>{right.caption}</Text>}
                  </View>
                )}
              </View>
            );
          })}
          <PageFooter />
        </Page>
      )}

      {/* Materials & Recommendations */}
      {data.participants.some(p => p.materials.length > 0) && (
        <Page size="LETTER" style={styles.page} wrap>
          <Text style={styles.sectionHeader}>Materials & Recommendations</Text>
          {data.participants.filter(p => p.materials.length > 0).map((participant, pIdx) => (
            <View key={pIdx} style={{ marginBottom: 16 }} wrap={false}>
              <Text style={styles.subHeader}>{participant.orgName} ({participant.role})</Text>
              <View style={styles.tableHeaderRow}>
                <Text style={{ ...styles.tableHeaderCell, width: '35%' }}>Material</Text>
                <Text style={{ ...styles.tableHeaderCell, width: '25%' }}>Manufacturer</Text>
                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Primary Use</Text>
                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Notes</Text>
              </View>
              {participant.materials.map((mat, mIdx) => (
                <View key={mIdx} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, width: '35%' }}>{mat.name}</Text>
                  <Text style={{ ...styles.tableCell, width: '25%' }}>{mat.manufacturer || '-'}</Text>
                  <Text style={{ ...styles.tableCell, width: '20%' }}>{mat.primaryUse || '-'}</Text>
                  <Text style={{ ...styles.tableCell, width: '20%' }}>{mat.notes || '-'}</Text>
                </View>
              ))}
            </View>
          ))}
          <PageFooter />
        </Page>
      )}

      {/* Team Directory */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionHeader}>Project Team</Text>
        {data.participants.map((p, idx) => (
          <View key={idx} style={styles.teamCard}>
            <Text style={styles.teamRole}>{p.role}</Text>
            <Text style={styles.teamName}>{p.orgName}</Text>
            <Text style={styles.teamContact}>{p.contactName}</Text>
            {p.email && <Text style={styles.teamContact}>{p.email}</Text>}
            {p.phone && <Text style={styles.teamContact}>{p.phone}</Text>}
          </View>
        ))}

        <View style={{ ...styles.goldBar, marginTop: 30 }} />
        <Text style={{ ...styles.textSmall, textAlign: 'center', marginTop: 8 }}>
          This report was generated by CORE Framework construction project management platform.
        </Text>
        <Text style={{ ...styles.textSmall, textAlign: 'center' }}>
          For questions, contact CORE Framework at info@coreframework.app
        </Text>
        <PageFooter />
      </Page>
    </Document>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>CORE Framework — Construction Project Management</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}
