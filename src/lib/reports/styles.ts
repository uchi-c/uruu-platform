import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  headerBar: {
    borderBottomWidth: 2,
    borderBottomColor: "#6C00FF",
    paddingBottom: 12,
    marginBottom: 20,
  },
  brand: {
    fontSize: 9,
    color: "#6C00FF",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    color: "#666666",
  },
  meta: {
    fontSize: 8,
    color: "#888888",
    marginTop: 6,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  statRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 10,
    marginRight: 8,
  },
  statBoxLast: {
    marginRight: 0,
  },
  statLabel: {
    fontSize: 7,
    color: "#888888",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f5f3ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#6C00FF",
    textTransform: "uppercase",
  },
  tableCell: {
    fontSize: 8,
    color: "#333333",
  },
  emptyState: {
    fontSize: 9,
    color: "#888888",
    padding: 12,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#999999",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
  },
});
