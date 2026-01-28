'use client';

import { useEffect, useState } from 'react';
import { Edit, User, Shield, Store as StoreIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { UserProfile, Store, UserRole, canManageRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { cn, formatDateTime } from '@/lib/utils';

export default function AdminUsersPage() {
  const supabase = createClient();
  const { user: currentUser, stores } = useAppStore();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('regular');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          store:stores(*)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedStoreId(user.store_id || '');
    setError('');
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!editingUser) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: selectedRole,
          store_id: selectedStoreId || null,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      setShowDialog(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'associate':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'regular':
        return 'bg-green-100 text-green-700';
      case 'driver':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    if (filterStore !== 'all' && user.store_id !== filterStore) return false;
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    return true;
  });

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'associate') {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">You don't have permission to view this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-600 mt-1">
          Assign roles and stores to users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Filter by Store</Label>
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Filter by Role</Label>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="associate">Associate</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1" />
        <span className="text-sm text-gray-500">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'rounded-full p-2',
                      user.role === 'associate' ? 'bg-purple-100' :
                      user.role === 'admin' ? 'bg-red-100' :
                      user.role === 'driver' ? 'bg-blue-100' : 'bg-green-100'
                    )}>
                      {user.role === 'admin' || user.role === 'associate' ? (
                        <Shield className={cn(
                          'h-5 w-5',
                          user.role === 'associate' ? 'text-purple-600' :
                          user.role === 'admin' ? 'text-red-600' : 'text-gray-400'
                        )} />
                      ) : (
                        <User className={cn(
                          'h-5 w-5',
                          user.role === 'driver' ? 'text-blue-600' : 'text-green-600'
                        )} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {user.full_name || 'Unnamed User'}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                  {user.store ? (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <StoreIcon className="h-4 w-4" />
                      <span>{user.store.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-orange-600">No store assigned</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Joined {formatDateTime(user.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* User Info (Read-only) */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">
                    {editingUser.full_name || 'Unnamed User'}
                  </p>
                  <p className="text-sm text-gray-500">{editingUser.email}</p>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUser?.role === 'associate' && (
                        <SelectItem value="associate">Associate</SelectItem>
                      )}
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="regular">Regular User</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {selectedRole === 'associate' && 'Maximum access - multi-store oversight and broadcasts'}
                    {selectedRole === 'admin' && 'Store-level management, inventory CRUD, user setup'}
                    {selectedRole === 'regular' && 'Day-to-day operations, requests, personal tasks'}
                    {selectedRole === 'driver' && 'SMS notifications only for pickup alerts'}
                  </p>
                </div>

                {/* Store Assignment */}
                <div className="space-y-2">
                  <Label>Assigned Store</Label>
                  <Select value={selectedStoreId || 'none'} onValueChange={(v) => setSelectedStoreId(v === 'none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Store</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} ({store.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRole !== 'associate' && !selectedStoreId && (
                    <p className="text-xs text-orange-600">
                      User needs a store assignment to access inventory
                    </p>
                  )}
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
                  {saving ? 'Saving...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
