'use client'
import { PricingTier } from "@/constatnts/paddle-prices";
import { usePaddle } from "@/hooks/usePaddle";
import { Customers, User } from "@/generated/prisma";
import { Tier } from "@/constatnts/paddle-prices";
import { createPaddleCustomer } from "./actions";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


export default function PlansTable({ user }: { user: User & { customer: Customers } }) {
    const { paddle,loading } = usePaddle(user.customer?.customerId); 
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [isYearly, setIsYearly] = useState(false);  
    const handleCheckout = async (tier: Tier) => {
      setCheckoutLoading(true);
      const paddleCustomerId = await createPaddleCustomer(user);

      const priceId = isYearly ? tier.priceId.year : tier.priceId.month;

      paddle?.Checkout.open({
        settings:{
          allowLogout: true,
          successUrl: `${window.location.origin}/success`,
        },
        customData:{
          userId: user.id,
        },
        customer:{
          id: paddleCustomerId,
        },
        items: [{
          priceId: priceId,
          quantity: 1
        }],
      })
      setCheckoutLoading(false);
    }


  return (
    <div className="max-w-6xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4 bg-muted p-1 rounded-lg">
          <Label htmlFor="billing-toggle" className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </Label>
        </div>
        {isYearly && (
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          PricingTier.map((tier) => {
            const price = isYearly ? tier.pricing.yearly : tier.pricing.monthly;
            const monthlyEquivalent = isYearly ? Math.round(tier.pricing.yearly / 12) : tier.pricing.monthly;
            
            return (
              <Card 
                key={tier.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  tier.featured ? 'border-primary shadow-md scale-105' : 'border-border'
                }`}
              >
                {tier.featured && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">${price}</div>
                    <div className="text-sm text-muted-foreground">
                      {isYearly ? 'per year' : 'per month'}
                    </div>
                    {isYearly && (
                      <div className="text-xs text-green-600 font-medium">
                        ${monthlyEquivalent}/month
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={checkoutLoading}
                    onClick={() => handleCheckout(tier)}
                    variant={tier.featured ? "default" : "outline"}
                  >
                    {checkoutLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  )
}
