import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PDFUpload } from '@/components/admin/pdf-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminUploadPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, store_id')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    redirect('/dashboard');
  }

  // Get stores (admins see all, managers see only their store)
  let storesQuery = supabase.from('stores').select('*').order('name');
  
  if (profile.role === 'manager') {
    storesQuery = storesQuery.eq('id', profile.store_id);
  }

  const { data: stores } = await storesQuery;

  // Get recent uploads
  let uploadsQuery = supabase
    .from('report_uploads')
    .select(`
      *,
      store:stores(name, code),
      uploaded_by_user:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (profile.role === 'manager') {
    uploadsQuery = uploadsQuery.eq('store_id', profile.store_id);
  }

  const { data: recentUploads } = await uploadsQuery;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Reports</h1>
        <p className="text-gray-600 mt-1">
          Upload inventory reports to update store data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <PDFUpload stores={stores || []} />

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUploads && recentUploads.length > 0 ? (
              <div className="space-y-3">
                {recentUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {upload.store?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {upload.file_name} • {formatDateTime(upload.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        By: {upload.uploaded_by_user?.full_name || upload.uploaded_by_user?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(upload.items_count)} items
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(upload.total_value)}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          upload.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : upload.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {upload.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent uploads</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
