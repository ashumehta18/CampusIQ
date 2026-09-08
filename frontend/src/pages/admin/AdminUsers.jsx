import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const roleBadge = { student: 'blue', faculty: 'green', admin: 'purple' };

const AdminUsers = () => {
  const [roleFilter, setRoleFilter] = useState('');
  const { data: users, loading, error, refetch } = useFetch(
    () => adminService.getAllUsers(roleFilter ? { role: roleFilter } : {}),
    [roleFilter]
  );

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await adminService.deactivateUser(id);
      toast.success(`${name} deactivated`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="View and manage all platform users" />

      <Card>
        {/* Filter bar */}
        <div className="flex gap-2 mb-5">
          {['', 'student', 'faculty', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                roleFilter === r
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : !users?.length ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-3 pr-4">
                      <Badge label={u.role} variant={roleBadge[u.role]} />
                    </td>
                    <td className="py-3 pr-4">
                      <Badge label={u.isActive ? 'Active' : 'Inactive'} variant={u.isActive ? 'green' : 'red'} />
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      {u.isActive && (
                        <button
                          onClick={() => handleDeactivate(u._id, u.name)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;
