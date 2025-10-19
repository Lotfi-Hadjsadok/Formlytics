export interface Tier {
    name: string;
    id: 'basic' | 'pro' | 'advanced';
    description: string;
    features: string[];
    featured: boolean;
    priceId: { month: string; year: string };
    pricing: { monthly: number; yearly: number };
    icon: string;
    colors: {
        background: string;
        border: string;
        icon: string;
    };
  }
  
  export const PricingTier: Tier[] = [
    {
      name: 'Basic',
      id: 'basic',
      description: 'Ideal for individuals who want to get started with Formlytics.',
      features: ['1 workspace', 'Limited collaboration', 'Export to PNG and SVG', 'Basic analytics'],
      featured: false,
      priceId: { month: 'pri_01k7vcd6d6rjb1pt8dnpvc0n71', year: 'pri_01k7vce0jmqqh11zvfn81cfm55	' },
      pricing: { monthly: 10, yearly: 100 },
      icon: 'CheckCircle',
      colors: {
        background: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
      },
    },
    {
      name: 'Pro',
      id: 'pro',
      description: 'Perfect for growing teams and businesses.',
      features: ['5 workspaces', 'Advanced collaboration', 'Export to PNG, SVG, PDF', 'Advanced analytics', 'Custom branding', 'Priority support'],
      featured: true,
      priceId: { month: 'pri_01k7wxn0bjyejrcxseb2rd28sy', year: 'pri_01k7wxnn2teqwd25vx7k25fb7y' },
      pricing: { monthly: 15, yearly: 150 },
      icon: 'Star',
      colors: {
        background: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
      },
    },
    {
      name: 'Advanced',
      id: 'advanced',
      description: 'For enterprise teams with advanced needs.',
      features: ['Unlimited workspaces', 'Full collaboration suite', 'All export formats', 'Enterprise analytics', 'White-label solution', '24/7 dedicated support', 'Custom integrations', 'SSO'],
      featured: false,
      priceId: { month: 'pri_01k7wxppvyxhy6r7fthnq72t3m	', year: 'pri_01k7wxr0f9p9z06n36dv9vnpq9' },
      pricing: { monthly: 19, yearly: 190 },
      icon: 'Zap',
      colors: {
        background: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
      },
    },
  ];