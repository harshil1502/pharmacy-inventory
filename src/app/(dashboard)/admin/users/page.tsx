'use client';

import { useEffect, useState } from 'react';
import { Edit, User, Shield, Store as StoreIcon, Plus, Copy, Check, Key } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { UserProfile, Store, UserRole, canManageRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { cn, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const supabase = createClient();
  const { user: currentUser, stores } = useAppStore();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('regular');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Create user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('regular');
  const [newUserStoreId, setNewUserStoreId] = useState<string>('');
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; emailSent: boolean } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

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
    setShowEditDialog(true);
  };

  const openCreateDialog = () => {
    setNewUserEmail('');
    setNewUserName('');
    setNewUserRole('regular');
    setNewUserStoreId(currentUser?.role === 'admin' ? currentUser.store_id || '' : '');
    setError('');
    setShowCreateDialog(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
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

      setShowEditDialog(false);
      fetchUsers();
      toast.success('User updated successfully');
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newUserEmail || !newUserName) {
      setError('Email and name are required');
      return;
    }

    // Admins can only create users for their store
    if (currentUser?.role === 'admin' && newUserStoreId !== currentUser.store_id) {
      setError('You can only create users for your store');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          fullName: newUserName,
          role: newUserRole,
          storeId: newUserStoreId || null,
          createdBy: currentUser?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setShowCreateDialog(false);
      setCreatedCredentials({
        email: data.user.email,
        password: data.tempPassword,
        emailSent: data.emailSent,
      });
      setShowCredentialsDialog(true);
      fetchUsers();
      toast.success(data.emailSent 
        ? 'User created and welcome email sent!' 
        : 'User created (email not sent)');
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const copyPassword = () => {
    if (createdCredentials) {
      navigator.clipboard.writeText(createdCredentials.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
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
    if (filterStore !== 'all') {
      if (filterStore === 'unassigned' && user.store_id) return false;
      if (filterStore !== 'unassigned' && user.store_id !== filterStore) return false;
    }
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    return true;
  });

  // Get available stores for user (admins only see their store)
  const availableStores = currentUser?.role === 'associate' 
    ? stores 
    : stores.filter(s => s.id === currentUser?.store_id);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-1">
            Create and manage user accounts
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
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
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleEdit}>
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
                  onClick={() => setShowEditDialog(false)}
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

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account. A temporary password will be generated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
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
                  {newUserRole === 'associate' && 'Maximum access - multi-store oversight and broadcasts'}
                  {newUserRole === 'admin' && 'Store-level management, inventory CRUD, user setup'}
                  {newUserRole === 'regular' && 'Day-to-day operations, requests, personal tasks'}
                  {newUserRole === 'driver' && 'SMS notifications only for pickup alerts'}
                </p>
              </div>

              {/* Store Assignment */}
              <div className="space-y-2">
                <Label>Assigned Store</Label>
                <Select 
                  value={newUserStoreId || 'none'} 
                  onValueChange={(v) => setNewUserStoreId(v === 'none' ? '' : v)}
                  disabled={currentUser?.role === 'admin'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === 'associate' && (
                      <SelectItem value="none">No Store</SelectItem>
                    )}
                    {availableStores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} ({store.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentUser?.role === 'admin' && (
                  <p className="text-xs text-gray-500">
                    Admins can only create users for their own store
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
                onClick={() => setShowCreateDialog(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              User Created Successfully
            </DialogTitle>
            <DialogDescription>
              {createdCredentials?.emailSent 
                ? 'A welcome email with login credentials has been sent to the user.'
                : 'Share these credentials with the user. They will be required to change their password on first login.'}
            </DialogDescription>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-4 py-4">
              {/* Email Status */}
              {createdCredentials.emailSent ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Welcome email sent to {createdCredentials.email}
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
                  ⚠️ Email could not be sent. Please share credentials manually.
                </div>
              )}
              
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="font-mono text-sm">{createdCredentials.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Temporary Password</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm bg-yellow-100 px-2 py-1 rounded">
                      {createdCredentials.password}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={copyPassword}
                    >
                      {copiedPassword ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                💡 The user will be required to change their password when they first log in.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowCredentialsDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
