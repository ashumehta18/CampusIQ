import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import studentService from '../../services/studentService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const StudentProfile = () => {
  const { data: profile, loading, error, refetch } = useFetch(studentService.getMyProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => {
    setForm({
      phone: profile?.phone || '',
      address: profile?.address || '',
      gender: profile?.gender || '',
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentService.updateMyProfile(form);
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
      Profile not set up yet. Ask your admin to create your student profile.
    </div>
  );

  const { user, department } = profile;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and update your personal information"
        action={
          !editing ? (
            <button
              onClick={startEdit}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Identity card */}
        <Card className="md:col-span-1 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-3">
            🎓
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">{user?.name}</h3>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="mt-3 space-y-1">
            <Badge label={`Semester ${profile.semester}`} variant="blue" />
            <div className="mt-1">
              <Badge label={profile.batch} variant="gray" />
            </div>
          </div>
        </Card>

        {/* Details card */}
        <Card className="md:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Academic Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <InfoRow label="Enrollment No." value={profile.enrollmentNumber} />
            <InfoRow label="Department" value={`${department?.name} (${department?.code})`} />
            <InfoRow label="Semester" value={profile.semester} />
            <InfoRow label="Batch" value={profile.batch} />
          </div>

          <h3 className="font-semibold text-gray-700 mb-4">Personal Information</h3>
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" name="phone" value={form.phone} onChange={setForm} form={form} />
              <Field label="Gender" name="gender" value={form.gender} onChange={setForm} form={form} type="select" options={['', 'male', 'female', 'other']} />
              <Field label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={setForm} form={form} type="date" />
              <Field label="Address" name="address" value={form.address} onChange={setForm} form={form} />
              <div className="col-span-2 flex gap-3 mt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
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
              <InfoRow label="Gender" value={profile.gender || '—'} />
              <InfoRow label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'} />
              <InfoRow label="Address" value={profile.address || '—'} />
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

const Field = ({ label, name, value, onChange, form, type = 'text', options }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={(e) => onChange({ ...form, [name]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => <option key={o} value={o}>{o || 'Select'}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange({ ...form, [name]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    )}
  </div>
);

export default StudentProfile;
