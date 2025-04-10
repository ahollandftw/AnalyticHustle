"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, CreditCard, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Calculate days remaining in subscription
  const daysRemaining = user?.subscriptionExpiry
    ? Math.ceil((new Date(user.subscriptionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

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
    },
  ]

  const currentPlan = subscriptionPlans.find((plan) => plan.id === user?.subscriptionTier) || {
    id: "free",
    name: "Free",
    price: "$0.00",
    billingPeriod: "forever",
    description: "Limited access to basic features",
    features: ["Limited player statistics", "Basic game information", "Community access (read-only)"],
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    // In a real app, this would update the user's subscription status
    alert("Your subscription has been canceled. You will have access until the end of your billing period.")
  }

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>Manage your subscription and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    Current Plan: {currentPlan.name}
                    {user?.subscriptionTier && (
                      <Badge className="ml-2" variant="outline">
                        Active
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{currentPlan.price}</div>
                  <div className="text-sm text-muted-foreground">per {currentPlan.billingPeriod}</div>
                </div>
              </div>

              {user?.subscriptionTier && user?.subscriptionExpiry && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Subscription Period</span>
                    <span className="text-sm font-medium">{daysRemaining} days remaining</span>
                  </div>
                  <Progress value={(daysRemaining / 30) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Your subscription will {daysRemaining > 0 ? "renew" : "expire"} on{" "}
                    {new Date(user.subscriptionExpiry).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Features:</h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {user?.subscriptionTier ? (
                  <>
                    <Button asChild>
                      <Link href="/subscribe">Upgrade Plan</Link>
                    </Button>
                    <Button variant="outline" onClick={handleCancelSubscription} disabled={isLoading}>
                      {isLoading ? "Processing..." : "Cancel Subscription"}
                    </Button>
                  </>
                ) : (
                  <Button asChild>
                    <Link href="/subscribe">Subscribe Now</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Payment Information</h3>
              {user?.subscriptionTier ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-xs text-muted-foreground">Expires 12/25</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  <span>No payment method on file</span>
                </div>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Billing History</h3>
              {user?.subscriptionTier ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{currentPlan.name} Plan - Monthly</div>
                      <div className="text-xs text-muted-foreground">Oct 15, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{currentPlan.price}</div>
                      <div className="text-xs text-green-500">Paid</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{currentPlan.name} Plan - Monthly</div>
                      <div className="text-xs text-muted-foreground">Sep 15, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{currentPlan.price}</div>
                      <div className="text-xs text-green-500">Paid</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No billing history available</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col text-xs text-muted-foreground">
            <p>
              Need help with your subscription? Contact our support team at{" "}
              <a href="mailto:support@absoluteheaters.com" className="text-primary hover:underline">
                support@absoluteheaters.com
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
