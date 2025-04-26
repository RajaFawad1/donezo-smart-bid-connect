
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PrimaryButton from '../buttons/PrimaryButton';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to authentication service in a real implementation
    console.log('Auth submission:', { view, email, password, name, userType });
    
    // Mock successful auth for demo purposes
    alert(`${view === 'login' ? 'Login' : 'Signup'} successful! This would connect to a real auth system.`);
    onClose();
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
                  required
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-donezo-blue hover:underline">
                  Forgot password?
                </a>
              </div>
              <PrimaryButton type="submit" className="w-full">
                Login
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
                    onClick={() => setUserType('customer')}
                  >
                    Customer
                  </div>
                  <div
                    className={`border rounded-lg p-3 cursor-pointer text-center transition-colors ${
                      userType === 'provider'
                        ? 'bg-donezo-teal text-white border-donezo-teal'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-donezo-teal'
                    }`}
                    onClick={() => setUserType('provider')}
                  >
                    Service Provider
                  </div>
                </div>
              </div>
              <PrimaryButton type="submit" className="w-full">
                Create Account
              </PrimaryButton>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to Donezo's{' '}
          <a href="#" className="text-donezo-blue hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-donezo-blue hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
