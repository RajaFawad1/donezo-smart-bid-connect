
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMessageFilter } from '@/hooks/useMessageFilter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState<string>("");
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);
  const [filteredText, setFilteredText] = useState<string>("");
  const { filterMessage } = useMessageFilter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Filter the message for off-platform communication attempts
    const { filteredText, containsFilteredContent, detectedPatterns: patterns } = filterMessage(message);
    
    if (containsFilteredContent) {
      setShowWarning(true);
      setDetectedPatterns(patterns);
      setFilteredText(filteredText);
    } else {
      // Message is clean, send it
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleSendFilteredMessage = () => {
    onSendMessage(filteredText);
    setMessage("");
    setShowWarning(false);
    
    toast({
      title: "Message filtered",
      description: "Your message was sent with sensitive content removed.",
    });
  };
  
  const handleEditMessage = () => {
    setShowWarning(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-2">
        <Textarea
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? "Sending..." : "Send Message"}
        </Button>
      </form>
      
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Off-platform communication detected</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                We've detected content that appears to be an attempt at off-platform communication.
                This violates our terms of service and could put you at risk.
              </p>
              <div className="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                <strong>Detected:</strong> {detectedPatterns.join(", ")}
              </div>
              <p className="mt-2 text-sm">
                For your protection, we recommend keeping all communication within the platform.
                Would you like to send your message with this content removed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleEditMessage}>Edit Message</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendFilteredMessage}>
              Send Filtered Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageInput;
