import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";

export function ReportHeader({
  title,
  subtitle,
  tenantName,
  generatedAt,
}: {
  title: string;
  subtitle: string;
  tenantName: string;
  generatedAt: Date;
}) {
  return (
    <View style={styles.headerBar}>
      <Text style={styles.brand}>URUU — FORTRESS AFRICA</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.meta}>
        {tenantName} · Generated {generatedAt.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}

export function ReportFooter({ tenantName }: { tenantName: string }) {
  return (
    <Text style={styles.footer} fixed>
      {tenantName} — URUU Confidential — Shadow Root Security Technologies
    </Text>
  );
}
