import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { ReportHeader, ReportFooter } from "./ReportHeader";

type ExecutiveReportData = {
  tenantName: string;
  generatedAt: Date;
  openIncidents: number;
  activeThreats: number;
  complianceScore: number | null;
  systemHealth: string;
  recentIncidents: { title: string; status: string; updatedAt: Date }[];
};

export function ExecutiveReportDocument({ data }: { data: ExecutiveReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader
          title="Executive Briefing"
          subtitle="High-level threat matrix, compliance health, and security posture overview"
          tenantName={data.tenantName}
          generatedAt={data.generatedAt}
        />

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Open Incidents</Text>
            <Text style={styles.statValue}>{data.openIncidents}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Threats</Text>
            <Text style={styles.statValue}>{data.activeThreats}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Compliance Score</Text>
            <Text style={styles.statValue}>
              {data.complianceScore === null ? "No data" : `${data.complianceScore}%`}
            </Text>
          </View>
          <View style={[styles.statBox, styles.statBoxLast]}>
            <Text style={styles.statLabel}>System Health</Text>
            <Text style={styles.statValue}>{data.systemHealth}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          {data.recentIncidents.length === 0 ? (
            <Text style={styles.emptyState}>No incidents recorded.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Incident</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Last Updated</Text>
              </View>
              {data.recentIncidents.map((inc, i) => (
                <View
                  key={i}
                  style={i === data.recentIncidents.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}
                >
                  <Text style={[styles.tableCell, { flex: 3 }]}>{inc.title}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{inc.status}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {inc.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <ReportFooter tenantName={data.tenantName} />
      </Page>
    </Document>
  );
}
