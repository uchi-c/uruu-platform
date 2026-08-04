export const LOGIN_CONTENT = {
  pageTitle: "Sign In - URUU",
  heading: "Sign in to your account",
  
  form: {
    emailLabel: "Email address",
    emailPlaceholder: "admin@yourcompany.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    submitButton: "Sign In",
    forgotPassword: "Forgot password?",
  },
  
  footer: {
    noAccount: "Don't have an account?",
    registerLink: "Register here",
    needHelp: "Need help?",
    contactSupport: "Contact support",
  },
  
  demoCredentials: {
    heading: "Demo Credentials",
    accounts: [
      {
        role: "Super Admin",
        email: "admin@fortressafrica.com",
        password: "FortressAdmin123!",
      },
      {
        role: "Security Analyst",
        email: "analyst@fortressafrica.com",
        password: "Analyst123!",
      },
      {
        role: "Viewer",
        email: "viewer@securebank.ng",
        password: "Viewer123!",
      },
    ],
  },
};

export const REGISTER_CONTENT = {
  pageTitle: "Register - URUU",
  heading: "Create your URUU account",
  subheading: "Start protecting your organization in minutes",
  
  form: {
    nameLabel: "Full Name",
    namePlaceholder: "John Doe",
    emailLabel: "Work Email",
    emailPlaceholder: "john@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Minimum 12 characters",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    
    orgSectionHeading: "Organization Details",
    orgNameLabel: "Company Name",
    orgNamePlaceholder: "Acme Corporation",
    sectorLabel: "Industry Sector",
    sectorOptions: [
      "Financial Services",
      "Technology",
      "Healthcare",
      "Government",
      "Telecommunications",
      "Education",
      "Retail",
      "Manufacturing",
      "Other",
    ],
    countrylabel: "Country",
    countryOptions: [
      "Nigeria",
      "Kenya",
      "South Africa",
      "Zambia",
      "Ghana",
      "Tanzania",
      "Uganda",
      "Rwanda",
      "Other",
    ],
    
    termsText: "I agree to the Terms of Service and Privacy Policy",
    newsletterText: "Send me security updates and product news",
    
    submitButton: "Create Account",
  },
  
  footer: {
    haveAccount: "Already have an account?",
    loginLink: "Sign in",
  },
};
