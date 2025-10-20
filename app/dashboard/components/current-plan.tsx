import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getActiveSubscription } from "@/lib/auth";
import { CheckCircle, Star, Zap } from "lucide-react";

const iconMap = {
  CheckCircle,
  Star,
  Zap,
};

export default async function CurrentPlan() {
  const activeSubscription = await getActiveSubscription();

  if (!activeSubscription) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500 text-sm">?</span>
            </div>
            No Active Plan
          </CardTitle>
          <CardDescription>
            You don't have an active subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Upgrade to unlock premium features
            </p>
            <Badge variant="secondary" className="w-fit">
              Free Plan
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = iconMap[activeSubscription.icon as keyof typeof iconMap] || CheckCircle;

  // Determine pricing and billing period based on subscription type
  const price = activeSubscription.isYearly ? activeSubscription.pricing.yearly : activeSubscription.pricing.monthly;
  const billingPeriod = activeSubscription.isYearly ? '/year' : '/month';

  return (
    <Card className={`w-full max-w-md ${activeSubscription.colors.background} ${activeSubscription.colors.border} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeSubscription.colors.background}`}>
            <IconComponent className={`w-5 h-5 ${activeSubscription.colors.icon}`} />
          </div>
          {activeSubscription.name}
          {activeSubscription.featured && (
            <Badge variant="default" className="ml-auto">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {activeSubscription.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              ${price}
            </span>
            <span className="text-sm text-gray-600">{billingPeriod}</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">What's included:</h4>
            <ul className="space-y-1">
              {activeSubscription.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Badge 
            variant="outline" 
            className={`w-fit ${activeSubscription.colors.border} ${activeSubscription.colors.icon}`}
          >
            Active Plan
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
