import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailAuthDialogProps {
  open: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  onSendOtp: (email: string) => void;
  error: string;
  message: string;
}

const EmailAuthDialog: React.FC<EmailAuthDialogProps> = ({ open, onClose, onVerify, onSendOtp, error, message }) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    onSendOtp(email);
    setOtpSent(true);
  };

  const handleVerify = () => {
    onVerify(verificationCode);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {otpSent ? 'Enter the verification code sent to your email.' : 'Enter your email address to receive a verification code.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {!otpSent ? (
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          ) : (
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
            />
          )}
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}
        </div>
        <DialogFooter>
          {!otpSent ? (
            <Button onClick={handleSendOtp}>Send Code</Button>
          ) : (
            <Button onClick={handleVerify}>Verify</Button>
          )}
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailAuthDialog;
