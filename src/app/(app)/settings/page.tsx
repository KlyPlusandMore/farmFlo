
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from "lucide-react";

const formSchema = z.object({
  farmName: z.string().min(1, "Farm name is required"),
  farmAddress: z.string().min(1, "Farm address is required"),
  notifications: z.object({
    lowStock: z.boolean(),
    healthAlerts: z.boolean(),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState("light");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmName: "KPM Farm",
      farmAddress: "123 Farm Road, Countryside",
      notifications: {
        lowStock: true,
        healthAlerts: true,
      },
    },
  });

  const onSubmit = (data: FormData) => {
    toast({
      title: "Settings Saved",
      description: "Your new settings have been successfully saved.",
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your application settings and preferences." className="hidden md:flex" />
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Farm Profile</CardTitle>
                <CardDescription>Update your farm's public information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="farmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="farmAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Theme</FormLabel>
                        <CardDescription>Select between light and dark mode.</CardDescription>
                    </div>
                    <FormControl>
                        <div className="flex items-center gap-2">
                             <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => handleThemeChange('light')}>
                                <Sun className="h-5 w-5" />
                             </Button>
                             <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => handleThemeChange('dark')}>
                                <Moon className="h-5 w-5" />
                             </Button>
                        </div>
                    </FormControl>
                </FormItem>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose which alerts you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notifications.lowStock"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Low Stock Alerts</FormLabel>
                            <CardDescription>Receive a notification when inventory items are running low.</CardDescription>
                        </div>
                         <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                         </FormControl>
                     </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="notifications.healthAlerts"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Animal Health Alerts</FormLabel>
                            <CardDescription>Receive a notification for AI-detected health risks.</CardDescription>
                        </div>
                         <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                         </FormControl>
                     </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export your data for backup or external use.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Button variant="outline" type="button">Export Animal Data</Button>
                 <Button variant="outline" type="button">Export Financial Records</Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
