export const INCIDENTS_CONTENT = {
  pageTitle: "Incidents - URUU",
  heading: "Security Incidents",
  subheading: "Track and manage security incidents across your organization",
  
  actions: {
    createButton: "New Incident",
    exportButton: "Export",
    filterButton: "Filter",
    refreshButton: "Refresh",
  },
  
  filters: {
    state: {
      label: "Filter by State",
      options: [
        { value: "", label: "All States" },
        { value: "OPEN", label: "Open" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "RESOLVED", label: "Resolved" },
        { value: "CLOSED", label: "Closed" },
        { value: "FALSE_POSITIVE", label: "False Positive" },
      ],
    },
    
    severity: {
      label: "Filter by Severity",
      options: [
        { value: "", label: "All Severities" },
        { value: "CRITICAL", label: "Critical" },
        { value: "HIGH", label: "High" },
        { value: "MEDIUM", label: "Medium" },
        { value: "LOW", label: "Low" },
        { value: "INFO", label: "Info" },
      ],
    },
  },
  
  table: {
    headers: {
      title: "Title",
      severity: "Severity",
      state: "State",
      owner: "Assigned To",
      detected: "Detected",
      actions: "Actions",
    },
  },
};
