"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Wallet, DollarSign } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic",
    price: "$9.99",
    billingPeriod: "monthly",
    description: "Access to basic features and data",
    features: [
      "Player statistics and analytics",
      "Daily matchups and lineups",
      "Basic betting tools",
      "Community access",
    ],
    limitations: ["Limited historical data", "No premium betting tools", "No custom alerts"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99",
    billingPeriod: "monthly",
    description: "Enhanced features for serious sports bettors",
    features: [
      "All Basic features",
      "Advanced player and team analytics",
      "Premium betting tools and models",
      "Live odds comparison",
      "Custom alerts and notifications",
      "Historical data access",
    ],
    limitations: ["Limited API access", "No expert picks"],
    recommended: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "$39.99",
    billingPeriod: "monthly",
    description: "Ultimate package for professional bettors",
    features: [
      "All Pro features",
      "Expert picks and analysis",
      "Advanced betting models and algorithms",
      "Unlimited API access",
      "Priority customer support",
      "Early access to new features",
      "Exclusive content and webinars",
    ],
    limitations: [],
  },
]

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, updateUser } = useAuth()
  const router = useRouter()

  const handleSubscribe = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update user subscription
    if (user) {
      updateUser({
        subscriptionTier: selectedPlan,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      })
    }

    setIsProcessing(false)
    router.push("/account/subscription")
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Choose Your Subscription Plan</h1>
          <p className="text-muted-foreground">Unlock premium features and gain an edge with our subscription plans</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${plan.recommended ? "border-primary shadow-md" : ""}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  Recommended
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.billingPeriod}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Limitations:</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Choose your payment method and complete your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="card">Credit Card</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
                <TabsTrigger value="venmo">Venmo</TabsTrigger>
                <TabsTrigger value="cashapp">CashApp</TabsTrigger>
              </TabsList>
              <TabsContent value="card" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name on Card</Label>
                      <Input id="name" placeholder="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-month">Expiry Month</Label>
                      <Input id="expiry-month" placeholder="MM" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry-year">Expiry Year</Label>
                      <Input id="expiry-year" placeholder="YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paypal" className="mt-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <Wallet className="h-16 w-16 text-blue-500 mb-4" />
                  <p className="text-center mb-4">
                    You will be redirected to PayPal to complete your payment after clicking "Subscribe".
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="venmo" className="mt-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <Wallet className="h-16 w-16 text-purple-500 mb-4" />
                  <p className="text-center mb-4">
                    You will be redirected to Venmo to complete your payment after clicking "Subscribe".
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="cashapp" className="mt-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <DollarSign className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-center mb-4">
                    You will be redirected to CashApp to complete your payment after clicking "Subscribe".
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="text-sm font-medium">Selected Plan:</div>
                <div className="text-lg font-bold">
                  {subscriptionPlans.find((plan) => plan.id === selectedPlan)?.name} -
                  {subscriptionPlans.find((plan) => plan.id === selectedPlan)?.price}/month
                </div>
              </div>
              <Button onClick={handleSubscribe} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Subscribe Now"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription at
              any time.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
