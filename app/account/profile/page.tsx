"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.name?.toLowerCase().replace(/\s+/g, "") || "",
    bio: "Sports betting enthusiast with a focus on MLB player props and home runs.",
  })

  // Mock betting stats
  const bettingStats = {
    totalBets: 156,
    wonBets: 87,
    lostBets: 69,
    winRate: "55.8%",
    roi: "+12.4%",
    avgOdds: "+245",
    favoriteMarket: "Home Runs",
    favoriteSport: "MLB",
  }

  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    betReminders: true,
    gameAlerts: true,
    lineMovements: true,
    specialOffers: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile in the database
    if (user) {
      updateUser({ name: formData.name, email: formData.email })
    }
    setIsEditing(false)
  }

  const handleToggleNotification = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  return (
    <div className="container py-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <CardTitle>{user?.name || "User"}</CardTitle>
                <CardDescription>@{formData.username}</CardDescription>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline">
                    {user?.subscriptionTier
                      ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)
                      : "Free"}{" "}
                    Member
                  </Badge>
                  <Badge variant="outline">Joined 2023</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {activeTab === "profile"
                    ? "Profile Information"
                    : activeTab === "stats"
                      ? "Betting Statistics"
                      : "Account Settings"}
                </CardTitle>
                {activeTab === "profile" && (
                  <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="profile" className="mt-0">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" value={formData.username} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input id="bio" name="bio" value={formData.bio} onChange={handleInputChange} />
                    </div>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p>{formData.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p>{formData.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                        <p>@{formData.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Subscription</h3>
                        <p>
                          {user?.subscriptionTier
                            ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)
                            : "Free"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                      <p>{formData.bio}</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-2xl font-bold">{bettingStats.totalBets}</div>
                      <div className="text-xs text-muted-foreground">Total Bets</div>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-2xl font-bold">{bettingStats.winRate}</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-2xl font-bold">{bettingStats.roi}</div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-2xl font-bold">{bettingStats.avgOdds}</div>
                      <div className="text-xs text-muted-foreground">Avg Odds</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Betting Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Won</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(bettingStats.wonBets / bettingStats.totalBets) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{bettingStats.wonBets}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Lost</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${(bettingStats.lostBets / bettingStats.totalBets) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{bettingStats.lostBets}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Favorite Markets</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Home Runs</span>
                          <span className="text-sm">65%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Moneyline</span>
                          <span className="text-sm">20%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Over/Under</span>
                          <span className="text-sm">15%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Favorite Sports</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">MLB</span>
                          <span className="text-sm">70%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">NBA</span>
                          <span className="text-sm">20%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">NFL</span>
                          <span className="text-sm">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications" className="font-normal">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications for important updates
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={() => handleToggleNotification("emailNotifications")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications" className="font-normal">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={() => handleToggleNotification("pushNotifications")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="bet-reminders" className="font-normal">
                            Bet Reminders
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Get reminders about upcoming games you've bet on
                          </p>
                        </div>
                        <Switch
                          id="bet-reminders"
                          checked={notificationSettings.betReminders}
                          onCheckedChange={() => handleToggleNotification("betReminders")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="game-alerts" className="font-normal">
                            Game Alerts
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive alerts for home runs, touchdowns, and other key events
                          </p>
                        </div>
                        <Switch
                          id="game-alerts"
                          checked={notificationSettings.gameAlerts}
                          onCheckedChange={() => handleToggleNotification("gameAlerts")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="line-movements" className="font-normal">
                            Line Movements
                          </Label>
                          <p className="text-sm text-muted-foreground">Get notified when odds change significantly</p>
                        </div>
                        <Switch
                          id="line-movements"
                          checked={notificationSettings.lineMovements}
                          onCheckedChange={() => handleToggleNotification("lineMovements")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="special-offers" className="font-normal">
                            Special Offers
                          </Label>
                          <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                        </div>
                        <Switch
                          id="special-offers"
                          checked={notificationSettings.specialOffers}
                          onCheckedChange={() => handleToggleNotification("specialOffers")}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Connect Social Accounts
                      </Button>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
