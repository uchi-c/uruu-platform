import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { ReportHeader, ReportFooter } from "./ReportHeader";

type IncidentReportData = {
  tenantName: string;
  generatedAt: Date;
  incidents: {
    title: string;
    status: string;
    threatTitle: string | null;
    createdAt: Date;
  }[];
};

export function IncidentReportDocument({ data }: { data: IncidentReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader
          title="Incident Timeline"
          subtitle="Chronological record of security incidents and linked threats"
          tenantName={data.tenantName}
          generatedAt={data.generatedAt}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incidents ({data.incidents.length})</Text>
          {data.incidents.length === 0 ? (
            <Text style={styles.emptyState}>No incidents recorded.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Incident</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Linked Threat</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.3 }]}>Opened</Text>
              </View>
              {data.incidents.map((inc, i) => (
                <View
                  key={i}
                  style={i === data.incidents.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}
                >
                  <Text style={[styles.tableCell, { flex: 2.5 }]}>{inc.title}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{inc.status}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{inc.threatTitle ?? "—"}</Text>
                  <Text style={[styles.tableCell, { flex: 1.3 }]}>
                    {inc.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
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
