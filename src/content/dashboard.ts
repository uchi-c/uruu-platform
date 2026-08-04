export const DASHBOARD_CONTENT = {
  pageTitle: "Dashboard - URUU",
  heading: "Security Operations Dashboard",
  subheading: "Real-time overview of your security posture",
  
  metrics: {
    incidents: {
      title: "Open Incidents",
      description: "Incidents requiring attention",
      tooltip: "Total number of incidents that are Open or In Progress",
    },
    risks: {
      title: "Active Risks",
      description: "High & Critical risks",
      tooltip: "Risks rated as High or Critical severity",
    },
    controls: {
      title: "Implemented Controls",
      description: "Security controls in place",
      tooltip: "Total number of security controls currently implemented",
    },
    tasks: {
      title: "Pending Tasks",
      description: "Tasks awaiting completion",
      tooltip: "Tasks with status Pending or In Progress",
    },
    threats: {
      title: "Active Threats",
      description: "Threat vectors currently tracked",
      tooltip: "Total number of threats registered for this tenant",
    },
    compliance: {
      title: "Compliance Score",
      description: "Overall compliance rating",
      tooltip: "Percentage of compliant controls across all frameworks",
    },
  },
  
  charts: {
    incidentTrend: {
      title: "Incident Trend (30 Days)",
      description: "Daily incident count over the last month",
      noData: "No incidents in the last 30 days",
    },
    
    severityBreakdown: {
      title: "Incidents by Severity",
      description: "Distribution of incidents by severity level",
      noData: "No incidents to display",
    },
  },
  
  quickActions: {
    title: "Quick Actions",
    items: [
      {
        label: "Report Incident",
        description: "Create new security incident",
        icon: "alert-triangle",
      },
      {
        label: "Add Risk",
        description: "Register new risk",
        icon: "target",
      },
      {
        label: "Create Task",
        description: "Assign new task",
        icon: "check-square",
      },
      {
        label: "Generate Report",
        description: "Export security report",
        icon: "file-text",
      },
    ],
  },
};
