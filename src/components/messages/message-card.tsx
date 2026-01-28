'use client';

import { useState } from 'react';
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
  Clock,
  User,
  Building,
  Users,
} from 'lucide-react';
import { Message, UserProfile, Store } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn, formatDateTime } from '@/lib/utils';

interface MessageCardProps {
  message: Message & {
    sender?: UserProfile;
  };
  currentUserId: string;
  onMarkRead: (messageId: string) => void;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
}

export function MessageCard({
  message,
  currentUserId,
  onMarkRead,
  onReply,
  onDelete,
}: MessageCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isSentByMe = message.sender_id === currentUserId;
  const isUnread = !message.is_read && !isSentByMe;

  const getRecipientLabel = () => {
    switch (message.recipient_type) {
      case 'user':
        return 'Direct Message';
      case 'store':
        return 'Store Message';
      case 'role':
        return `To All ${message.recipient_role}s`;
      case 'broadcast':
        return 'Broadcast';
      default:
        return '';
    }
  };

  const getRecipientIcon = () => {
    switch (message.recipient_type) {
      case 'user':
        return User;
      case 'store':
        return Building;
      case 'role':
      case 'broadcast':
        return Users;
      default:
        return User;
    }
  };

  const handleClick = () => {
    setExpanded(!expanded);
    if (isUnread) {
      onMarkRead(message.id);
    }
  };

  const RecipientIcon = getRecipientIcon();

  return (
    <Card
      className={cn(
        'transition-all cursor-pointer hover:shadow-md',
        isUnread && 'border-blue-200 bg-blue-50/50',
        expanded && 'ring-2 ring-blue-200'
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Read/Unread Icon */}
            <div className={cn(
              'rounded-full p-2',
              isUnread ? 'bg-blue-100' : 'bg-gray-100'
            )}>
              {isUnread ? (
                <Mail className="h-4 w-4 text-blue-600" />
              ) : (
                <MailOpen className="h-4 w-4 text-gray-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Sender Info */}
              <div className="flex items-center space-x-2">
                <span className={cn(
                  'text-sm',
                  isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                )}>
                  {isSentByMe ? 'You' : (message.sender?.full_name || message.sender?.email || 'Unknown')}
                </span>
                {message.is_email && (
                  <Badge className="text-xs bg-purple-100 text-purple-700">
                    Email
                  </Badge>
                )}
              </div>

              {/* Subject */}
              <h3 className={cn(
                'text-base mt-1',
                isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
              )}>
                {message.subject}
              </h3>

              {/* Preview */}
              {!expanded && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {message.body}
                </p>
              )}
            </div>
          </div>

          {/* Timestamp and Type */}
          <div className="text-right shrink-0">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(message.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <RecipientIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{getRecipientLabel()}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {expanded && (
        <CardContent className="pt-0">
          <div className="border-t border-gray-100 pt-4 mt-2">
            {/* Full Message Body */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{message.body}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
              {!isSentByMe && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(message);
                  }}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this message?')) {
                    onDelete(message.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
