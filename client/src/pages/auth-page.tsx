import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { Trophy } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      role: "organizer" | "participant" as const,
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit((data) =>
                    loginMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...loginForm.register("username")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginForm.register("password")}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit((data) => {
                    console.log('Form data before submission:', data);
                    
                    // Ensure all required fields are present and properly formatted
                    const formData = {
                      username: data.username?.trim(),
                      password: data.password,
                      name: data.name?.trim(),
                      email: data.email?.trim(),
                      role: data.role || "participant"
                    };
                    
                    // Validate that all required fields are present
                    if (!formData.username || !formData.password || !formData.name || !formData.email || !formData.role) {
                      console.error('Missing required fields:', {
                        hasUsername: !!formData.username,
                        hasPassword: !!formData.password,
                        hasName: !!formData.name,
                        hasEmail: !!formData.email,
                        hasRole: !!formData.role
                      });
                      
                      // Set appropriate error messages
                      if (!formData.username) registerForm.setError("username", { message: "Username is required" });
                      if (!formData.password) registerForm.setError("password", { message: "Password is required" });
                      if (!formData.name) registerForm.setError("name", { message: "Name is required" });
                      if (!formData.email) registerForm.setError("email", { message: "Email is required" });
                      if (!formData.role) registerForm.setError("role", { message: "Role is required" });
                      
                      return;
                    }
                    
                    // Log validation state
                    console.log('Form validation state:', registerForm.formState);
                    console.log('Submitting registration with data:', { ...formData, password: '[REDACTED]' });
                    
                    registerMutation.mutate(formData, {
                      onError: (error) => {
                        console.error('Registration error:', error);
                        // Set the root error message from the server
                        registerForm.setError("root", {
                          type: "server",
                          message: error.message
                        });
                      }
                    });
                  })}
                  className="space-y-4"
                >
                  <div>
                    <Label>Account Type</Label>
                    <RadioGroup
                      defaultValue="participant"
                      value={registerForm.getValues("role")}
                      className="grid grid-cols-2 gap-4 mt-2"
                      onValueChange={(value) => {
                        registerForm.setValue("role", value as "organizer" | "participant", { shouldValidate: true });
                        console.log('Role selected:', value);
                      }}
                    >
                      <div>
                        <RadioGroupItem
                          value="participant"
                          id="participant"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="participant"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Participant</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="organizer"
                          id="organizer"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="organizer"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Organizer</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="register-name">Name</Label>
                    <Input
                      id="register-name"
                      {...registerForm.register("name")}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      {...registerForm.register("username")}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  {registerForm.formState.errors.root?.message && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.root.message}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-b from-primary to-accent text-primary-foreground">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-12 w-12 text-primary-foreground" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-foreground to-primary-foreground/80 text-transparent bg-clip-text drop-shadow-md">EventMaster</h1>
          </div>
          <p className="text-lg opacity-90">
            Your all-in-one platform for managing coding contests and hackathons.
            Create events, form teams, and track progress in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}