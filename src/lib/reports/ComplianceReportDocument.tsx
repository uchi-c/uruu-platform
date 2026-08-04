import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { ReportHeader, ReportFooter } from "./ReportHeader";

type ComplianceReportData = {
  tenantName: string;
  generatedAt: Date;
  assessments: {
    frameworkName: string;
    jurisdiction: string;
    status: string;
    score: number;
    responseCount: number;
    updatedAt: Date;
  }[];
};

export function ComplianceReportDocument({ data }: { data: ComplianceReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader
          title="Compliance Audit"
          subtitle="Regulatory framework alignment and assessment status"
          tenantName={data.tenantName}
          generatedAt={data.generatedAt}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessments</Text>
          {data.assessments.length === 0 ? (
            <Text style={styles.emptyState}>No compliance assessments have been started yet.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Framework</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Jurisdiction</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Status</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Score</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Requirements</Text>
              </View>
              {data.assessments.map((a, i) => (
                <View
                  key={i}
                  style={i === data.assessments.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}
                >
                  <Text style={[styles.tableCell, { flex: 2.5 }]}>{a.frameworkName}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{a.jurisdiction}</Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>{a.status.replace(/_/g, " ")}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{a.score}%</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{a.responseCount}</Text>
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
