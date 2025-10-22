// Form field types
export type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'multiselect' | 'multi-dropdown' | 'checkbox' | 'radio' | 'number' | 'date'

export type FieldWidth = 'full' | 'half' | 'third' | 'two-thirds'

export type StepUI = 'numbers' | 'letters' | 'percentage' | 'bar'

// Form field styling interface
export interface FieldStyling {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  fontSize?: string
  padding?: string
}

// Form field interface
export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  width: FieldWidth
  styling?: FieldStyling
}

// Form step interface
export interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

// Form settings interface
export interface FormSettings {
  allowMultipleSubmissions: boolean
  showProgressBar: boolean
  stepUI?: StepUI
  submitButtonText: string
}

// Form styling interface
export interface FormStyling {
  backgroundColor: string
  textColor: string
  primaryColor: string
  fontFamily: string
  borderRadius: string
}

// Thank you page interface
export interface ThankYouPage {
  icon?: string
  title?: string
  text?: string
}

// Error page interface
export interface ErrorPage {
  icon?: string
  title?: string
  text?: string
}

// Main form interface
export interface Form {
  id: string
  title: string
  description?: string | null
  fields?: FormField[]
  steps?: FormStep[]
  isMultistep?: boolean
  settings: FormSettings
  styling: FormStyling
  thankYouPage?: ThankYouPage
  errorPage?: ErrorPage
  embedding?: EmbeddingSettings
  _count: {
    entries: number
  }
}

// Form data interface for form builder
export interface FormData {
  title: string
  description: string
  fields: FormField[]
  steps: FormStep[]
  isMultistep: boolean
  formTypeSelected: boolean
  settings: FormSettings
  styling: FormStyling
  thankYouPage: ThankYouPage
  errorPage: ErrorPage
}

// Form renderer props interface
export interface FormRendererProps {
  form: Form
  onSubmit: (formData: Record<string, any>) => Promise<void>
  submitting?: boolean
  showHeader?: boolean
  className?: string
  onError?: (error: string) => void
}

// Form builder props interface
export interface FormBuilderProps {
  formId?: string
  initialData?: FormData
}

// Single step form builder props interface
export interface SingleStepFormBuilderProps {
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
}

// Multi step form builder props interface
export interface MultiStepFormBuilderProps {
  steps: FormStep[]
  onStepsChange: (steps: FormStep[]) => void
}

// Sortable field props interface
export interface SortableFieldProps {
  field: FormField
  index: number
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  removeField: (fieldId: string) => void
  addOption: (fieldId: string) => void
  updateOption: (fieldId: string, optionIndex: number, value: string) => void
  removeOption: (fieldId: string, optionIndex: number) => void
}

// Sortable step field props interface
export interface SortableStepFieldProps {
  field: FormField
  stepId: string
  index: number
  updateField: (stepId: string, fieldId: string, updates: Partial<FormField>) => void
  removeField: (stepId: string, fieldId: string) => void
  addOption: (stepId: string, fieldId: string) => void
  updateOption: (stepId: string, fieldId: string, optionIndex: number, value: string) => void
  removeOption: (stepId: string, fieldId: string, optionIndex: number) => void
}

// Form preview props interface
export interface FormPreviewProps {
  formData: FormData
}

// Form styling settings props interface
export interface FormStylingSettingsProps {
  styling: FormStyling
  onStylingChange: (styling: FormStyling) => void
}

// Embedding settings interface
export interface EmbeddingSettings {
  allowedOrigins?: string[]
  requireOrigin?: boolean
  width?: string
  height?: string
}

// Field type options for dropdowns
export const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'multiselect', label: 'Multiselect', icon: '☑️' },
  { value: 'multi-dropdown', label: 'Multi Dropdown', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio Button', icon: '🔘' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
] as const

// Width options for field configuration
export const widthOptions = [
  { value: 'full', label: 'Full Width', icon: '100%' },
  { value: 'half', label: 'Half Width', icon: '50%' },
  { value: 'third', label: 'One Third', icon: '33%' },
  { value: 'two-thirds', label: 'Two Thirds', icon: '67%' },
] as const

// Form preset interface
export interface FormPreset {
  id: string
  name: string
  description: string
  icon: string
  category: 'single-step' | 'multi-step'
  isMultistep: boolean
  title: string
  formDescription: string
  fields?: FormField[]
  steps?: FormStep[]
  settings: FormSettings
  styling: FormStyling
  thankYouPage: ThankYouPage
}

// Form presets
export const formPresets: FormPreset[] = [
  // Single-step presets
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Simple contact form for inquiries and feedback',
    icon: '📞',
    category: 'single-step',
    isMultistep: false,
    title: 'Contact Us',
    formDescription: 'Get in touch with us',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        width: 'half'
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        width: 'half'
      },
      {
        id: 'subject',
        type: 'text',
        label: 'Subject',
        placeholder: 'What is this about?',
        required: true,
        width: 'full'
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Tell us more...',
        required: true,
        width: 'full'
      }
    ],
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: true,
      submitButtonText: 'Send Message'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryColor: '#3b82f6',
      fontFamily: 'var(--font-inter)',
      borderRadius: '12px'
    },
    thankYouPage: {
      icon: '✅',
      title: 'Message Sent!',
      text: 'Thank you for reaching out. We\'ll get back to you within 24 hours.'
    }
  },
  {
    id: 'survey-form',
    name: 'Customer Survey',
    description: 'Comprehensive customer feedback survey',
    icon: '📊',
    category: 'single-step',
    isMultistep: false,
    title: 'Customer Satisfaction Survey',
    formDescription: 'Help us improve by sharing your experience',
    fields: [
      {
        id: 'satisfaction',
        type: 'radio',
        label: 'How satisfied are you with our service?',
        required: true,
        width: 'full',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
      },
      {
        id: 'recommend',
        type: 'radio',
        label: 'Would you recommend us to others?',
        required: true,
        width: 'full',
        options: ['Definitely', 'Probably', 'Maybe', 'Probably Not', 'Definitely Not']
      },
      {
        id: 'improvements',
        type: 'multiselect',
        label: 'What could we improve?',
        required: false,
        width: 'full',
        options: ['Customer Service', 'Product Quality', 'Website Experience', 'Pricing', 'Delivery Speed', 'Communication']
      },
      {
        id: 'comments',
        type: 'textarea',
        label: 'Additional Comments',
        placeholder: 'Any other feedback?',
        required: false,
        width: 'full'
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      submitButtonText: 'Submit Survey'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryColor: '#10b981',
      fontFamily: 'var(--font-inter)',
      borderRadius: '12px'
    },
    thankYouPage: {
      icon: '🎉',
      title: 'Survey Complete!',
      text: 'Thank you for your valuable feedback. Your input helps us serve you better.'
    }
  },
  {
    id: 'registration-form',
    name: 'Event Registration',
    description: 'Complete event registration with personal details',
    icon: '🎫',
    category: 'single-step',
    isMultistep: false,
    title: 'Event Registration',
    formDescription: 'Register for our upcoming event',
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
        width: 'half'
      },
      {
        id: 'lastName',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true,
        width: 'half'
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        width: 'full'
      },
      {
        id: 'phone',
        type: 'text',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: true,
        width: 'half'
      },
      {
        id: 'company',
        type: 'text',
        label: 'Company/Organization',
        placeholder: 'Enter your company name',
        required: false,
        width: 'half'
      },
      {
        id: 'dietary',
        type: 'select',
        label: 'Dietary Requirements',
        required: false,
        width: 'full',
        options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Other']
      },
      {
        id: 'emergency',
        type: 'text',
        label: 'Emergency Contact',
        placeholder: 'Name and phone number',
        required: true,
        width: 'full'
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      submitButtonText: 'Register Now'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryColor: '#8b5cf6',
      fontFamily: 'var(--font-inter)',
      borderRadius: '12px'
    },
    thankYouPage: {
      icon: '🎉',
      title: 'Registration Confirmed!',
      text: 'You\'re all set! We\'ll send you event details via email closer to the date.'
    }
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'Simple newsletter subscription form',
    icon: '📧',
    category: 'single-step',
    isMultistep: false,
    title: 'Stay Updated',
    formDescription: 'Subscribe to our newsletter for the latest updates',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        required: true,
        width: 'full'
      },
      {
        id: 'name',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: false,
        width: 'half'
      },
      {
        id: 'interests',
        type: 'multiselect',
        label: 'What are you interested in?',
        required: false,
        width: 'half',
        options: ['Product Updates', 'Industry News', 'Tips & Tutorials', 'Special Offers', 'Events']
      }
    ],
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: true,
      submitButtonText: 'Subscribe'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryColor: '#ef4444',
      fontFamily: 'var(--font-inter)',
      borderRadius: '12px'
    },
    thankYouPage: {
      icon: '🎉',
      title: 'Welcome Aboard!',
      text: 'You\'re now subscribed to our newsletter. Check your email for a confirmation message.'
    }
  },

  // Multi-step presets
  {
    id: 'onboarding-form',
    name: 'User Onboarding',
    description: 'Multi-step user onboarding process',
    icon: '🚀',
    category: 'multi-step',
    isMultistep: true,
    title: 'Welcome! Let\'s Get Started',
    formDescription: 'Help us personalize your experience',
    steps: [
      {
        id: 'step1',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        fields: [
          {
            id: 'firstName',
            type: 'text',
            label: 'First Name',
            placeholder: 'Enter your first name',
            required: true,
            width: 'half'
          },
          {
            id: 'lastName',
            type: 'text',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            required: true,
            width: 'half'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email',
            required: true,
            width: 'full'
          },
          {
            id: 'phone',
            type: 'text',
            label: 'Phone Number',
            placeholder: 'Enter your phone number',
            required: false,
            width: 'full'
          }
        ]
      },
      {
        id: 'step2',
        title: 'Preferences',
        description: 'Help us customize your experience',
        fields: [
          {
            id: 'role',
            type: 'select',
            label: 'What\'s your role?',
            required: true,
            width: 'full',
            options: ['Developer', 'Designer', 'Product Manager', 'Marketing', 'Sales', 'Other']
          },
          {
            id: 'companySize',
            type: 'radio',
            label: 'Company Size',
            required: true,
            width: 'full',
            options: ['1-10 employees', '11-50 employees', '51-200 employees', '201-1000 employees', '1000+ employees']
          },
          {
            id: 'interests',
            type: 'multiselect',
            label: 'What are you interested in?',
            required: false,
            width: 'full',
            options: ['Analytics', 'Automation', 'Integration', 'Reporting', 'Mobile', 'API']
          }
        ]
      },
      {
        id: 'step3',
        title: 'Goals',
        description: 'What do you want to achieve?',
        fields: [
          {
            id: 'primaryGoal',
            type: 'select',
            label: 'Primary Goal',
            required: true,
            width: 'full',
            options: ['Increase Productivity', 'Improve Analytics', 'Automate Processes', 'Better Reporting', 'Team Collaboration']
          },
          {
            id: 'timeline',
            type: 'radio',
            label: 'When do you want to achieve this?',
            required: true,
            width: 'full',
            options: ['Within 1 month', 'Within 3 months', 'Within 6 months', 'Within 1 year', 'No specific timeline']
          },
          {
            id: 'additionalInfo',
            type: 'textarea',
            label: 'Anything else we should know?',
            placeholder: 'Share any additional context...',
            required: false,
            width: 'full'
          }
        ]
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      stepUI: 'numbers',
      submitButtonText: 'Complete Setup'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryColor: '#3b82f6',
      fontFamily: 'var(--font-inter)',
      borderRadius: '12px'
    },
    thankYouPage: {
      icon: '🎉',
      title: 'Setup Complete!',
      text: 'Welcome to the team! We\'re excited to help you achieve your goals.'
    }
  },
  {
    id: 'application-form',
    name: 'Job Application',
    description: 'Comprehensive job application process',
    icon: '💼',
    category: 'multi-step',
    isMultistep: true,
    title: 'Job Application',
    formDescription: 'Apply for your dream position',
    steps: [
      {
        id: 'step1',
        title: 'Personal Details',
        description: 'Basic information about yourself',
        fields: [
          {
            id: 'firstName',
            type: 'text',
            label: 'First Name',
            placeholder: 'Enter your first name',
            required: true,
            width: 'half'
          },
          {
            id: 'lastName',
            type: 'text',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            required: true,
            width: 'half'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email',
            required: true,
            width: 'half'
          },
          {
            id: 'phone',
            type: 'text',
            label: 'Phone Number',
            placeholder: 'Enter your phone number',
            required: true,
            width: 'half'
          },
          {
            id: 'address',
            type: 'textarea',
            label: 'Address',
            placeholder: 'Enter your full address',
            required: true,
            width: 'full'
          }
        ]
      },
      {
        id: 'step2',
        title: 'Professional Experience',
        description: 'Tell us about your work experience',
        fields: [
          {
            id: 'currentPosition',
            type: 'text',
            label: 'Current Position',
            placeholder: 'Your current job title',
            required: true,
            width: 'full'
          },
          {
            id: 'currentCompany',
            type: 'text',
            label: 'Current Company',
            placeholder: 'Your current company',
            required: true,
            width: 'full'
          },
          {
            id: 'experience',
            type: 'select',
            label: 'Years of Experience',
            required: true,
            width: 'half',
            options: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
          },
          {
            id: 'skills',
            type: 'multiselect',
            label: 'Technical Skills',
            required: true,
            width: 'half',
            options: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'TypeScript', 'MongoDB']
          },
          {
            id: 'resume',
            type: 'textarea',
            label: 'Resume Summary',
            placeholder: 'Brief summary of your experience and achievements',
            required: true,
            width: 'full'
          }
        ]
      },
      {
        id: 'step3',
        title: 'Additional Information',
        description: 'Help us get to know you better',
        fields: [
          {
            id: 'availability',
            type: 'radio',
            label: 'Availability',
            required: true,
            width: 'full',
            options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 3 months', 'Flexible']
          },
          {
            id: 'salary',
            type: 'select',
            label: 'Expected Salary Range',
            required: false,
            width: 'half',
            options: ['$30k-$50k', '$50k-$70k', '$70k-$90k', '$90k-$120k', '$120k+', 'Negotiable']
          },
          {
            id: 'remote',
            type: 'radio',
            label: 'Work Preference',
            required: true,
            width: 'half',
            options: ['Remote', 'On-site', 'Hybrid', 'Flexible']
          },
          {
            id: 'coverLetter',
            type: 'textarea',
            label: 'Cover Letter',
            placeholder: 'Tell us why you\'re interested in this position',
            required: true,
            width: 'full'
          }
        ]
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      stepUI: 'numbers',
      submitButtonText: 'Submit Application'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryColor: '#059669',
      fontFamily: 'var(--font-inter)',
      borderRadius: '12px'
    },
    thankYouPage: {
      icon: '✅',
      title: 'Application Submitted!',
      text: 'Thank you for your application. We\'ll review it and get back to you within 5-7 business days.'
    }
  }
]
