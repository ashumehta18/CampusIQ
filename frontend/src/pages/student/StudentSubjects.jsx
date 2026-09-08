import useFetch from '../../hooks/useFetch';
import enrollmentService from '../../services/enrollmentService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const StudentSubjects = () => {
  const { data: enrollments, loading, error } = useFetch(enrollmentService.getAll);

  return (
    <div>
      <PageHeader title="My Subjects" subtitle="Subjects you are currently enrolled in" />

      {loading ? <Spinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : !enrollments?.length ? (
        <EmptyState icon="📚" title="No subjects enrolled" description="Contact your admin to enroll in subjects" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((en) => {
            const sub = en.subject;
            return (
              <Card key={en._id}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{sub?.name}</h3>
                  <Badge label={sub?.code} variant="blue" />
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>Department: {sub?.department?.name}</p>
                  <p>Faculty: {sub?.faculty?.user?.name || 'Not assigned'}</p>
                  <p>Semester: {sub?.semester} &nbsp;|&nbsp; Credits: {sub?.credits}</p>
                  <p>Academic Year: {en.academicYear}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSubjects;
