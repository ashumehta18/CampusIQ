import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import facultyService from '../../services/facultyService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const FacultyProfile = () => {
  const { data: profile, loading, error, refetch } = useFetch(facultyService.getMyProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => {
    setForm({
      phone: profile?.phone || '',
      designation: profile?.designation || '',
      specialization: profile?.specialization || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await facultyService.updateMyProfile(form);
      toast.success('Profile updated');
      setEditing(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;
  if (!profile) return (
    <div className="text-gray-500 text-sm">
      Profile not set up yet. Ask your admin to create your faculty profile.
    </div>
  );

  const { user, department } = profile;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and update your professional information"
        action={
          !editing ? (
            <button
              onClick={startEdit}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Edit Profile
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-3">
            👨‍🏫
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">{user?.name}</h3>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="mt-3">
            <Badge label={profile.designation || 'Faculty'} variant="green" />
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Professional Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <InfoRow label="Employee ID" value={profile.employeeId} />
            <InfoRow label="Department" value={`${department?.name} (${department?.code})`} />
          </div>

          <h3 className="font-semibold text-gray-700 mb-4">Contact & Details</h3>
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Phone', name: 'phone' },
                { label: 'Designation', name: 'designation' },
                { label: 'Specialization', name: 'specialization' },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              <div className="col-span-2 flex gap-3 mt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Phone" value={profile.phone || '—'} />
              <InfoRow label="Designation" value={profile.designation || '—'} />
              <InfoRow label="Specialization" value={profile.specialization || '—'} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
    <p className="text-gray-800 font-medium mt-0.5">{value}</p>
  </div>
);

export default FacultyProfile;
