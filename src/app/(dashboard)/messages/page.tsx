'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Inbox, Send as SendIcon, Mail, MailOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Message, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCard } from '@/components/messages/message-card';
import { ComposeMessageDialog } from '@/components/messages/compose-message-dialog';

type MessageWithSender = Message & {
  sender?: UserProfile;
};

export default function MessagesPage() {
  const { user } = useAppStore();
  const supabase = createClient();

  const [inboxMessages, setInboxMessages] = useState<MessageWithSender[]>([]);
  const [sentMessages, setSentMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [replyTo, setReplyTo] = useState<{ userId: string; userName: string; subject?: string } | undefined>();

  // Count unread messages
  const unreadCount = inboxMessages.filter(m => !m.is_read).length;

  const fetchMessages = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch inbox (received messages)
      const { data: inbox, error: inboxError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, full_name, role)
        `)
        .or(`recipient_id.eq.${user.id},recipient_type.eq.broadcast,and(recipient_type.eq.role,recipient_role.eq.${user.role})`)
        .neq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (inboxError) throw inboxError;
      setInboxMessages(inbox || []);

      // Fetch sent messages
      const { data: sent, error: sentError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, full_name, role)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;
      setSentMessages(sent || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, fetchMessages]);

  const handleMarkRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setInboxMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      userId: message.sender_id,
      userName: (message as MessageWithSender).sender?.full_name || (message as MessageWithSender).sender?.email || 'Unknown',
      subject: message.subject,
    });
    setShowComposeDialog(true);
  };

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setInboxMessages(prev => prev.filter(m => m.id !== messageId));
      setSentMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleComposeClose = (open: boolean) => {
    setShowComposeDialog(open);
    if (!open) {
      setReplyTo(undefined);
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  // Drivers don't have access to messaging
  if (user.role === 'driver') {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">You don't have access to messaging</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">
            Communicate with your team
          </p>
        </div>
        <Button onClick={() => setShowComposeDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Inbox className="h-4 w-4 mr-2 text-gray-400" />
              Inbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inboxMessages.length}</p>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600">{unreadCount} unread</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <SendIcon className="h-4 w-4 mr-2 text-gray-400" />
              Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sentMessages.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox" className="flex items-center space-x-2">
            <Inbox className="h-4 w-4" />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center space-x-2">
            <SendIcon className="h-4 w-4" />
            <span>Sent</span>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading messages...</p>
          </div>
        ) : (
          <>
            <TabsContent value="inbox" className="mt-4">
              {inboxMessages.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MailOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages in your inbox</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {inboxMessages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      currentUserId={user.id}
                      onMarkRead={handleMarkRead}
                      onReply={handleReply}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              {sentMessages.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <SendIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No sent messages</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowComposeDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Send your first message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sentMessages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      currentUserId={user.id}
                      onMarkRead={handleMarkRead}
                      onReply={handleReply}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Compose Dialog */}
      <ComposeMessageDialog
        open={showComposeDialog}
        onOpenChange={handleComposeClose}
        onSuccess={fetchMessages}
        replyTo={replyTo}
      />
    </div>
  );
}
