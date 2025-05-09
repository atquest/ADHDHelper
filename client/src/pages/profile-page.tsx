import { useState } from "react";
import { useTokenAuth } from "@/hooks/use-token-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";
import { techniques } from "@/data/adhd-data";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationFormSchema = z.object({
  emailNewTechniques: z.boolean().default(true),
  emailWeekly: z.boolean().default(true),
  emailUpdates: z.boolean().default(false),
});

export default function ProfilePage() {
  const { user, logout } = useTokenAuth();
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNewTechniques: true,
      emailWeekly: true,
      emailUpdates: false,
    },
  });

  // Simulated saved techniques for the user
  const [savedTechniques, setSavedTechniques] = useState([
    techniques[0],
    techniques[3],
  ]);

  function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    // Simulate password change
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    });
    passwordForm.reset();
  }

  function onNotificationsSubmit(values: z.infer<typeof notificationFormSchema>) {
    // Simulate notification preferences update
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated",
    });
  }

  function removeSavedTechnique(techniqueId: number) {
    setSavedTechniques(savedTechniques.filter(t => t.id !== techniqueId));
    toast({
      title: "Technique removed",
      description: "Technique has been removed from your saved list",
    });
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-[#6D28D9]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="mt-2 text-xl text-white opacity-90">Manage your account and personal settings</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details and preferences</CardDescription>
            </div>
            <Button onClick={() => setEditMode(!editMode)}>
              {editMode ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>
          
          <CardContent>
            <dl>
              <div className="bg-muted/40 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-md">
                <dt className="text-sm font-medium text-muted-foreground">Username</dt>
                <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  {user?.username || "Username not available"}
                </dd>
              </div>
              
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-muted-foreground">Member since</dt>
                <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  {new Date().toLocaleDateString()}
                </dd>
              </div>
              
              <div className="bg-muted/40 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-md">
                <dt className="text-sm font-medium text-muted-foreground">Areas of interest</dt>
                <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Focus & Concentration
                    </Badge>
                    <Badge className="bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9]/20">
                      Organization & Planning
                    </Badge>
                    <Badge className="bg-[#FBBF24]/10 text-[#FBBF24] hover:bg-[#FBBF24]/20">
                      Emotional Regulation
                    </Badge>
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {/* Saved Techniques */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Saved Techniques</h2>
          
          <Card>
            {savedTechniques.length > 0 ? (
              <ul className="divide-y divide-border">
                {savedTechniques.map((technique) => (
                  <li key={technique.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-muted/40 rounded-md">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary truncate">{technique.title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Badge variant={technique.difficulty === 'easy' ? "success" : technique.difficulty === 'medium' ? "warning" : "destructive"}>
                            {technique.difficulty.charAt(0).toUpperCase() + technique.difficulty.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-muted-foreground">
                            {technique.mainCategory}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground sm:mt-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => removeSavedTechnique(technique.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">You haven't saved any techniques yet</p>
                <Button variant="outline" className="mt-4">Browse techniques</Button>
              </CardContent>
            )}
          </Card>
        </div>
        
        {/* Account Settings */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Change Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Decide which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="emailNewTechniques"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>New Techniques</FormLabel>
                          <FormDescription>
                            Receive an email when new techniques are added
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="emailWeekly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Weekly Summary</FormLabel>
                          <FormDescription>
                            Receive a weekly summary with useful tips
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="emailUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Platform Updates</FormLabel>
                          <FormDescription>
                            Receive updates about new features and improvements to the platform
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Preferences</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                When you delete your account, all your data will be permanently erased. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
