'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  MessageSquare,
  Clock,
  ArrowRight,
  Package,
  Phone,
  Truck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { MedicationRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  formatNumber,
  formatDateTime,
  getStatusColor,
  cn,
} from '@/lib/utils';

interface RequestCardProps {
  request: MedicationRequest;
  type: 'incoming' | 'outgoing';
  onUpdate?: () => void;
}

export function RequestCard({ request, type, onUpdate }: RequestCardProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const supabase = createClient();
  
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseType, setResponseType] = useState<'accept' | 'decline' | 'counter'>('accept');
  const [counterQuantity, setCounterQuantity] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isIncoming = type === 'incoming';
  const canRespond = isIncoming && request.status === 'pending';
  const canComplete = isIncoming && request.status === 'accepted';

  const handleResponse = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let newStatus: string;
      let notificationType: string;
      let notificationTitle: string;
      let notificationMessage: string;

      switch (responseType) {
        case 'accept':
          newStatus = 'accepted';
          notificationType = 'request_accepted';
          notificationTitle = 'Request Accepted';
          notificationMessage = `${request.to_store?.name} has accepted your request for ${request.medication_name} (DIN: ${request.din_number})`;
          break;
        case 'decline':
          newStatus = 'declined';
          notificationType = 'request_declined';
          notificationTitle = 'Request Declined';
          notificationMessage = `${request.to_store?.name} has declined your request for ${request.medication_name} (DIN: ${request.din_number})`;
          break;
        case 'counter':
          newStatus = 'counter_offer';
          notificationType = 'counter_offer';
          notificationTitle = 'Counter Offer Received';
          notificationMessage = `${request.to_store?.name} has made a counter offer of ${counterQuantity} units for ${request.medication_name}`;
          break;
        default:
          return;
      }

      // Update the request
      const { error: updateError } = await supabase
        .from('medication_requests')
        .update({
          status: newStatus,
          offered_quantity: responseType === 'counter' ? parseInt(counterQuantity) : 
                           responseType === 'accept' ? request.requested_quantity : null,
          response_message: responseMessage.trim() || null,
          responded_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Create notification for the requesting store
      await supabase.from('notifications').insert({
        store_id: request.from_store_id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        related_request_id: request.id,
      });

      // If accepted, notify the driver via SMS to pick up medication
      if (responseType === 'accept') {
        try {
          const smsRes = await fetch('/api/notify-driver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: request.id }),
          });
          const smsData = await smsRes.json();
          if (smsRes.ok) {
            console.log(`Driver ${smsData.driverName} notified via SMS`);
          } else {
            console.warn('Driver notification failed:', smsData.error);
          }
        } catch (smsErr) {
          console.warn('Could not notify driver:', smsErr);
          // Don't fail the accept flow if SMS fails
        }
      }

      setShowResponseDialog(false);
      onUpdate?.();
      router.refresh();
    } catch (err) {
      console.error('Error responding to request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Mark request as completed
      const { error } = await supabase
        .from('medication_requests')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        store_id: request.from_store_id,
        type: 'request_completed',
        title: 'Transfer Completed',
        message: `Your medication request for ${request.medication_name} (DIN: ${request.din_number}) has been completed`,
        related_request_id: request.id,
      });

      onUpdate?.();
      router.refresh();
    } catch (err) {
      console.error('Error completing request:', err);
    } finally {
      setLoading(false);
    }
  };

  const openResponseDialog = (type: 'accept' | 'decline' | 'counter') => {
    setResponseType(type);
    setResponseMessage('');
    setCounterQuantity(request.requested_quantity.toString());
    setShowResponseDialog(true);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'rounded-lg p-2',
                isIncoming ? 'bg-blue-100' : 'bg-green-100'
              )}>
                <Package className={cn(
                  'h-5 w-5',
                  isIncoming ? 'text-blue-600' : 'text-green-600'
                )} />
              </div>
              <div>
                <CardTitle className="text-base">
                  {request.medication_name}
                </CardTitle>
                <p className="text-sm text-gray-500 font-mono">
                  DIN: {request.din_number}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Store Transfer Info */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="text-sm">
              <p className="text-gray-500">From</p>
              <p className="font-medium">{request.from_store?.name}</p>
              <p className="text-xs text-gray-400">{request.from_store?.code}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="text-sm text-right">
              <p className="text-gray-500">To</p>
              <p className="font-medium">{request.to_store?.name}</p>
              <p className="text-xs text-gray-400">{request.to_store?.code}</p>
            </div>
          </div>

          {/* Quantity Info */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Requested Qty</p>
              <p className="text-lg font-semibold">
                {formatNumber(request.requested_quantity)}
              </p>
            </div>
            {request.offered_quantity && request.offered_quantity !== request.requested_quantity && (
              <div>
                <p className="text-xs text-gray-500">Offered Qty</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatNumber(request.offered_quantity)}
                </p>
              </div>
            )}
          </div>

          {/* Messages */}
          {(request.message || request.response_message) && (
            <div className="py-3 border-b border-gray-100 space-y-2">
              {request.message && (
                <div className="flex items-start space-x-2">
                  <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Request Note</p>
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                </div>
              )}
              {request.response_message && (
                <div className="flex items-start space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Response</p>
                    <p className="text-sm text-gray-700">{request.response_message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Driver Info (shown when accepted and driver assigned) */}
          {request.status === 'accepted' && isIncoming && request.driver && (
            <div className="py-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Driver:</span>
                <span className="font-medium">{request.driver.name}</span>
                <a
                  href={`tel:${request.driver.phone}`}
                  className="flex items-center space-x-1 text-blue-600 hover:underline ml-2"
                >
                  <Phone className="h-3 w-3" />
                  <span>{request.driver.phone}</span>
                </a>
              </div>
            </div>
          )}

          {/* Urgency indicator */}
          {request.urgency && request.urgency !== 'low' && (
            <div className="py-2">
              <Badge
                className={cn(
                  request.urgency === 'critical' && 'bg-red-100 text-red-700',
                  request.urgency === 'high' && 'bg-orange-100 text-orange-700',
                  request.urgency === 'medium' && 'bg-yellow-100 text-yellow-700'
                )}
              >
                {request.urgency.toUpperCase()} URGENCY
              </Badge>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center space-x-1 py-3 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatDateTime(request.created_at)}</span>
          </div>

          {/* Actions */}
          {canRespond && (
            <div className="flex items-center space-x-2 pt-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => openResponseDialog('accept')}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={() => openResponseDialog('counter')}
                disabled={loading}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Counter
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openResponseDialog('decline')}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          )}

          {canComplete && (
            <div className="pt-2">
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark as Completed
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseType === 'accept' && 'Accept Request'}
              {responseType === 'decline' && 'Decline Request'}
              {responseType === 'counter' && 'Make Counter Offer'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Show medication info */}
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-medium">{request.medication_name}</p>
              <p className="text-sm text-gray-500">DIN: {request.din_number}</p>
            </div>

            {responseType === 'counter' && (
              <div className="space-y-2">
                <Label htmlFor="counterQuantity">Offered Quantity</Label>
                <Input
                  id="counterQuantity"
                  type="number"
                  min="1"
                  value={counterQuantity}
                  onChange={(e) => setCounterQuantity(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Originally requested: {formatNumber(request.requested_quantity)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="responseMessage">Message (Optional)</Label>
              <Textarea
                id="responseMessage"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  responseType === 'decline'
                    ? 'Explain why you are declining...'
                    : 'Add any notes...'
                }
                rows={3}
              />
            </div>

            {responseType === 'accept' && (
              <div className="rounded-lg bg-green-50 p-3 text-sm">
                <div className="flex items-center space-x-2 text-green-800">
                  <Truck className="h-4 w-4" />
                  <span>An available driver will be automatically notified via text to pick up the medication.</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResponseDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResponse}
              disabled={loading}
              variant={responseType === 'decline' ? 'destructive' : 'default'}
            >
              {loading ? 'Sending...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
