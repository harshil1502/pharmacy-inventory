'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Phone, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Store } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminStoresPage() {
  const supabase = createClient();
  const { user, setStores } = useAppStore();

  const [stores, setLocalStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setLocalStores(data || []);
      setStores(data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openCreateDialog = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
    });
    setError('');
    setShowDialog(true);
  };

  const openEditDialog = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      code: store.code,
      address: store.address || '',
      phone: store.phone || '',
    });
    setError('');
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Name and code are required');
      return;
    }

    setSaving(true);

    try {
      if (editingStore) {
        // Update
        const { error } = await supabase
          .from('stores')
          .update({
            name: formData.name.trim(),
            code: formData.code.trim(),
            address: formData.address.trim() || null,
            phone: formData.phone.trim() || null,
          })
          .eq('id', editingStore.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('stores')
          .insert({
            name: formData.name.trim(),
            code: formData.code.trim(),
            address: formData.address.trim() || null,
            phone: formData.phone.trim() || null,
          });

        if (error) throw error;
      }

      setShowDialog(false);
      fetchStores();
    } catch (err: any) {
      console.error('Error saving store:', err);
      setError(err.message || 'Failed to save store');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (store: Store) => {
    if (!confirm(`Are you sure you want to delete "${store.name}"? This will also delete all inventory and requests for this store.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', store.id);

      if (error) throw error;
      
      fetchStores();
    } catch (err) {
      console.error('Error deleting store:', err);
      alert('Failed to delete store');
    }
  };

  // Only associates can manage stores
  if (user?.role !== 'associate') {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">You don't have permission to view this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Stores</h1>
          <p className="text-gray-600 mt-1">
            Add and manage pharmacy store locations
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No stores found</p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <p className="text-sm text-gray-500 font-mono">Code: {store.code}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(store)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(store)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {store.address && (
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
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
              {editingStore ? 'Edit Store' : 'Add New Store'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Store Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Pharmacy Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Store Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="1021"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, Toronto, ON"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="416-555-0100"
                />
              </div>

              <p className="text-xs text-gray-500 pt-2">
                Drivers can be managed separately in the Driver Management section.
              </p>

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
                {saving ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
