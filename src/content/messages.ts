export const SUCCESS_MESSAGES = {
  incidents: {
    created: "Incident created successfully",
    updated: "Incident updated successfully",
    deleted: "Incident deleted successfully",
  },
  risks: {
    created: "Risk added to register",
    updated: "Risk updated successfully",
    deleted: "Risk removed from register",
  },
  settings: {
    profileUpdated: "Profile updated successfully",
    settingsSaved: "Settings saved successfully",
  },
};

export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: "Invalid email or password. Please try again.",
    sessionExpired: "Your session has expired. Please log in again.",
  },
  validation: {
    required: (field: string) => `${field} is required`,
    email: "Please enter a valid email address",
  },
};
