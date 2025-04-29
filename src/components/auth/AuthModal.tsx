
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PrimaryButton from '../buttons/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialView = 'login' }: AuthModalProps) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize the navigate function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (view === 'login') {
        await signIn(email, password);
        toast({
          title: "Login successful",
          description: "Welcome back to Donezo!",
        });
        navigate('/dashboard'); // Redirect to dashboard after login
      } else {
        await signUp(email, password, name, userType);
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
        navigate('/onboarding'); // Redirect to onboarding after signup
      }
      onClose();
    } catch (error: any) {
      toast({
        title: view === 'login' ? "Login failed" : "Signup failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {view === 'login' ? 'Welcome back!' : 'Join Donezo'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {view === 'login' ? 'Log in to access your account' : 'Sign up to start using our services'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'login' | 'signup')} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-donezo-blue hover:underline">
                  Forgot password?
                </a>
              </div>
              <PrimaryButton type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </PrimaryButton>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>I am a:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-3 cursor-pointer text-center transition-colors ${
                      userType === 'customer'
                        ? 'bg-donezo-blue text-white border-donezo-blue'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-donezo-blue'
                    }`}
                    onClick={() => !loading && setUserType('customer')}
                  >
                    Customer
                  </div>
                  <div
                    className={`border rounded-lg p-3 cursor-pointer text-center transition-colors ${
                      userType === 'provider'
                        ? 'bg-donezo-teal text-white border-donezo-teal'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-donezo-teal'
                    }`}
                    onClick={() => !loading && setUserType('provider')}
                  >
                    Service Provider
                  </div>
                </div>
              </div>
              <PrimaryButton type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </PrimaryButton>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to Donezo's{' '}
          <a href="/terms-of-service" className="text-donezo-blue hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy-policy" className="text-donezo-blue hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
