'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Users, Building, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { UserProfile, Store, RecipientType, UserRole, canBroadcast } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  replyTo?: {
    userId: string;
    userName: string;
    subject?: string;
  };
}

export function ComposeMessageDialog({
  open,
  onOpenChange,
  onSuccess,
  replyTo,
}: ComposeMessageDialogProps) {
  const { user, stores } = useAppStore();
  const supabase = createClient();

  // Form state
  const [recipientType, setRecipientType] = useState<RecipientType>('user');
  const [recipientId, setRecipientId] = useState('');
  const [recipientRole, setRecipientRole] = useState<UserRole | ''>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isEmail, setIsEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Users and stores for selection
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const canSendBroadcast = user?.role ? canBroadcast(user.role) : false;
  const isAssociate = user?.role === 'associate';
  const isAdmin = user?.role === 'admin';

  // Initialize form for reply
  useEffect(() => {
    if (replyTo && open) {
      setRecipientType('user');
      setRecipientId(replyTo.userId);
      setSubject(replyTo.subject ? `Re: ${replyTo.subject}` : '');
    } else if (!open) {
      resetForm();
    }
  }, [replyTo, open]);

  // Fetch users for selection
  useEffect(() => {
    async function fetchUsers() {
      if (!open) return;

      setLoadingUsers(true);
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .neq('role', 'driver')
          .order('full_name');

        // Admins can only message their store users
        if (isAdmin && user?.store_id) {
          query = query.eq('store_id', user.store_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [open, isAdmin, user?.store_id, supabase]);

  const resetForm = () => {
    setRecipientType('user');
    setRecipientId('');
    setRecipientRole('');
    setSubject('');
    setBody('');
    setIsEmail(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user?.id) {
      setError('You must be logged in to send messages');
      return;
    }

    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (!body.trim()) {
      setError('Message body is required');
      return;
    }

    // Validate recipient selection
    if (recipientType === 'user' && !recipientId) {
      setError('Please select a recipient');
      return;
    }

    if (recipientType === 'store' && !recipientId) {
      setError('Please select a store');
      return;
    }

    if (recipientType === 'role' && !recipientRole) {
      setError('Please select a role');
      return;
    }

    // Check permissions for broadcast
    if (recipientType === 'broadcast' && !canSendBroadcast) {
      setError('You do not have permission to send broadcast messages');
      return;
    }

    setLoading(true);

    try {
      const messageData = {
        sender_id: user.id,
        recipient_type: recipientType,
        recipient_id: recipientType === 'user' || recipientType === 'store' ? recipientId : null,
        recipient_role: recipientType === 'role' ? recipientRole : null,
        subject: subject.trim(),
        body: body.trim(),
        is_email: isEmail,
        is_read: false,
      };

      const { error: insertError } = await supabase
        .from('messages')
        .insert(messageData);

      if (insertError) throw insertError;

      // Create notifications for recipients
      if (recipientType === 'user') {
        await supabase.from('notifications').insert({
          user_id: recipientId,
          type: 'message_received',
          title: 'New Message',
          message: `${user.full_name || user.email} sent you a message: ${subject}`,
          delivery_method: isEmail ? 'both' : 'popup',
        });
      }

      // TODO: Handle store, role, and broadcast notifications
      // These would need to fan out to multiple users

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Get recipient type options based on role
  const getRecipientTypeOptions = () => {
    const options: { value: RecipientType; label: string; icon: React.ElementType; description: string }[] = [
      { value: 'user', label: 'Specific User', icon: Users, description: 'Send to one person' },
    ];

    if (isAssociate || isAdmin) {
      options.push({
        value: 'store',
        label: 'Store Staff',
        icon: Building,
        description: isAssociate ? 'All staff at selected store' : 'All staff at your store',
      });
    }

    if (isAssociate) {
      options.push(
        { value: 'role', label: 'By Role', icon: Shield, description: 'All users with specific role' },
        { value: 'broadcast', label: 'Broadcast', icon: Mail, description: 'All users in the system' }
      );
    }

    return options;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {replyTo ? 'Reply to Message' : 'Compose Message'}
          </DialogTitle>
          <DialogDescription>
            Send a message to users in your organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Recipient Type */}
            <div className="space-y-2">
              <Label>Send To</Label>
              <div className="grid grid-cols-2 gap-2">
                {getRecipientTypeOptions().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setRecipientType(option.value);
                      setRecipientId('');
                      setRecipientRole('');
                    }}
                    className={cn(
                      'flex items-start space-x-3 rounded-lg border p-3 text-left transition-colors',
                      recipientType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <option.icon className={cn(
                      'h-5 w-5 mt-0.5',
                      recipientType === option.value ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <div>
                      <p className={cn(
                        'font-medium text-sm',
                        recipientType === option.value ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* User Selection */}
            {recipientType === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="recipient">Select Recipient</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? 'Loading...' : 'Select a user...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(u => u.id !== user?.id)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex items-center space-x-2">
                            <span>{u.full_name || u.email}</span>
                            <Badge className="text-xs bg-gray-100 text-gray-600">
                              {u.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Store Selection */}
            {recipientType === 'store' && (
              <div className="space-y-2">
                <Label htmlFor="store">Select Store</Label>
                <Select
                  value={isAdmin ? user?.store_id || '' : recipientId}
                  onValueChange={setRecipientId}
                  disabled={isAdmin}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} ({store.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAdmin && (
                  <p className="text-xs text-gray-500">
                    Message will be sent to all staff at your store
                  </p>
                )}
              </div>
            )}

            {/* Role Selection */}
            {recipientType === 'role' && (
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={recipientRole} onValueChange={(v) => setRecipientRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">All Admins</SelectItem>
                    <SelectItem value="regular">All Regular Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Broadcast Warning */}
            {recipientType === 'broadcast' && (
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                <p className="font-medium">Broadcast Message</p>
                <p className="text-xs mt-1">
                  This message will be sent to all users in the system.
                </p>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={6}
              />
            </div>

            {/* Send as Email */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Also send as email</p>
                  <p className="text-xs text-gray-500">
                    Recipients will receive an email notification
                  </p>
                </div>
              </div>
              <Switch
                checked={isEmail}
                onCheckedChange={setIsEmail}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
