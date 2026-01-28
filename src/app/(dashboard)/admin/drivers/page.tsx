'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Truck,
  CheckCircle,
  XCircle,
  Circle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Driver, DriverShiftStatus, Store } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const SHIFT_STATUS_OPTIONS: { value: DriverShiftStatus; label: string; color: string }[] = [
  { value: 'on_duty', label: 'On Duty', color: 'bg-green-100 text-green-700' },
  { value: 'on_delivery', label: 'On Delivery', color: 'bg-blue-100 text-blue-700' },
  { value: 'off_duty', label: 'Off Duty', color: 'bg-gray-100 text-gray-700' },
];

export default function DriversPage() {
  const supabase = createClient();
  const { user, stores } = useAppStore();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    store_id: '',
    is_available: true,
    shift_status: 'off_duty' as DriverShiftStatus,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStore, setFilterStore] = useState<string>('all');

  // Get stores user can manage
  const managedStores = user?.role === 'associate'
    ? stores
    : stores.filter(s => s.id === user?.store_id);

  const fetchDrivers = async () => {
    try {
      let query = supabase
        .from('drivers')
        .select(`
          *,
          store:stores(id, name, code)
        `)
        .order('name');

      // Filter by store for non-associates
      if (user?.role === 'admin' && user?.store_id) {
        query = query.eq('store_id', user.store_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDrivers(data || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [user?.store_id, user?.role]);

  const openCreateDialog = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      store_id: user?.role === 'admin' ? user.store_id || '' : '',
      is_available: true,
      shift_status: 'off_duty',
    });
    setError('');
    setShowDialog(true);
  };

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      store_id: driver.store_id,
      is_available: driver.is_available,
      shift_status: driver.shift_status,
    });
    setError('');
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Driver name is required');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!formData.store_id) {
      setError('Store is required');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setSaving(true);

    try {
      const driverData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        store_id: formData.store_id,
        is_available: formData.is_available,
        shift_status: formData.shift_status,
      };

      if (editingDriver) {
        const { error } = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', editingDriver.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('drivers')
          .insert(driverData);

        if (error) throw error;
      }

      setShowDialog(false);
      fetchDrivers();
    } catch (err: unknown) {
      console.error('Error saving driver:', err);
      setError(err instanceof Error ? err.message : 'Failed to save driver');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Are you sure you want to remove ${driver.name} as a driver?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driver.id);

      if (error) throw error;
      fetchDrivers();
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert('Failed to delete driver');
    }
  };

  const toggleAvailability = async (driver: Driver) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_available: !driver.is_available })
        .eq('id', driver.id);

      if (error) throw error;
      fetchDrivers();
    } catch (err) {
      console.error('Error updating driver:', err);
    }
  };

  const updateShiftStatus = async (driver: Driver, status: DriverShiftStatus) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ shift_status: status })
        .eq('id', driver.id);

      if (error) throw error;
      fetchDrivers();
    } catch (err) {
      console.error('Error updating driver status:', err);
    }
  };

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    if (filterStore !== 'all' && driver.store_id !== filterStore) return false;
    return true;
  });

  // Check permissions
  if (user?.role !== 'admin' && user?.role !== 'associate') {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">You don't have permission to manage drivers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Drivers</h1>
          <p className="text-gray-600 mt-1">
            Add and manage delivery drivers for medication transfers
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Filters */}
      {user?.role === 'associate' && stores.length > 1 && (
        <div className="flex items-center gap-4">
          <Label className="text-sm text-gray-500">Filter by Store:</Label>
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Drivers Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading drivers...</p>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No drivers found</p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first driver
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className={cn(!driver.is_available && 'opacity-60')}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'rounded-full p-2',
                      driver.shift_status === 'on_duty' ? 'bg-green-100' :
                      driver.shift_status === 'on_delivery' ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      <Truck className={cn(
                        'h-5 w-5',
                        driver.shift_status === 'on_duty' ? 'text-green-600' :
                        driver.shift_status === 'on_delivery' ? 'text-blue-600' : 'text-gray-400'
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{driver.name}</CardTitle>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${driver.phone}`} className="hover:underline">
                          {driver.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(driver)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(driver)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Store */}
                  <div className="text-sm text-gray-600">
                    {driver.store?.name} ({driver.store?.code})
                  </div>

                  {/* Status and Availability */}
                  <div className="flex items-center justify-between">
                    <Select
                      value={driver.shift_status}
                      onValueChange={(v) => updateShiftStatus(driver, v as DriverShiftStatus)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={cn('text-xs', option.color)}>
                              {option.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Available</span>
                      <Switch
                        checked={driver.is_available}
                        onCheckedChange={() => toggleAvailability(driver)}
                      />
                    </div>
                  </div>

                  {/* Availability indicator */}
                  <div className="flex items-center space-x-2 text-xs">
                    {driver.is_available ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Available for assignments</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">Not available</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Driver Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="416-555-0123"
                />
                <p className="text-xs text-gray-500">
                  SMS notifications will be sent to this number
                </p>
              </div>

              {user?.role === 'associate' && (
                <div className="space-y-2">
                  <Label htmlFor="store">Assigned Store *</Label>
                  <Select
                    value={formData.store_id}
                    onValueChange={(v) => setFormData({ ...formData, store_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store..." />
                    </SelectTrigger>
                    <SelectContent>
                      {managedStores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} ({store.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="shiftStatus">Initial Status</Label>
                <Select
                  value={formData.shift_status}
                  onValueChange={(v) => setFormData({ ...formData, shift_status: v as DriverShiftStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <Badge className={cn('text-xs', option.color)}>
                          {option.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">Available for assignments</Label>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
