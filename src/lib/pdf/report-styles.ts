import { StyleSheet } from '@react-pdf/renderer';

const GOLD = '#C5A55A';
const DARK = '#1a1a1a';
const GRAY = '#666666';
const LIGHT_GRAY = '#f5f5f0';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: DARK },
  coverPage: { padding: 40, fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center' },
  goldBar: { width: '100%', height: 4, backgroundColor: GOLD, marginVertical: 20 },
  coverTitle: { fontSize: 28, fontWeight: 'bold', color: DARK, textAlign: 'center', marginBottom: 8 },
  coverSubtitle: { fontSize: 14, color: GRAY, textAlign: 'center', marginBottom: 4 },
  coverDetail: { fontSize: 11, color: GRAY, textAlign: 'center', marginTop: 8 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: DARK, marginBottom: 12, marginTop: 20, borderBottomWidth: 2, borderBottomColor: GOLD, paddingBottom: 6 },
  subHeader: { fontSize: 12, fontWeight: 'bold', color: DARK, marginBottom: 8, marginTop: 12 },
  text: { fontSize: 10, color: DARK, marginBottom: 4, lineHeight: 1.5 },
  textMuted: { fontSize: 9, color: GRAY, marginBottom: 2 },
  textSmall: { fontSize: 8, color: GRAY },

  // Tables
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingVertical: 6 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: GOLD, paddingBottom: 6, marginBottom: 4 },
  tableHeaderCell: { fontSize: 9, fontWeight: 'bold', color: GRAY, textTransform: 'uppercase' },
  tableCell: { fontSize: 10, color: DARK },

  // Checklist
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  checkboxChecked: { width: 12, height: 12, borderWidth: 1, borderColor: GOLD, backgroundColor: GOLD, borderRadius: 2, marginRight: 8 },
  checkboxUnchecked: { width: 12, height: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 2, marginRight: 8 },

  // Photo grid
  photoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  photoContainer: { width: '48%' },
  photo: { width: '100%', height: 200, objectFit: 'cover', borderRadius: 4 },
  photoCaption: { fontSize: 8, color: GRAY, marginTop: 4, textAlign: 'center' },

  // Team directory
  teamCard: { backgroundColor: LIGHT_GRAY, borderRadius: 4, padding: 10, marginBottom: 8 },
  teamRole: { fontSize: 8, color: GOLD, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  teamName: { fontSize: 11, fontWeight: 'bold', color: DARK, marginBottom: 2 },
  teamContact: { fontSize: 9, color: GRAY },

  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 8 },
  footerText: { fontSize: 7, color: GRAY },

  // Summary stat boxes
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statBox: { width: '30%', backgroundColor: LIGHT_GRAY, borderRadius: 4, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: GOLD },
  statLabel: { fontSize: 8, color: GRAY, marginTop: 4 },
});

export default styles;
export { GOLD, DARK, GRAY, LIGHT_GRAY, WHITE };
