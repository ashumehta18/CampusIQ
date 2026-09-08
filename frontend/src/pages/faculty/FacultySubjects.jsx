import useFetch from '../../hooks/useFetch';
import subjectService from '../../services/subjectService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const FacultySubjects = () => {
  const { data: subjects, loading, error } = useFetch(subjectService.getMySubjects);

  return (
    <div>
      <PageHeader title="My Subjects" subtitle="Subjects assigned to you this semester" />

      {loading ? <Spinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : !subjects?.length ? (
        <EmptyState icon="📚" title="No subjects assigned" description="Contact admin to assign subjects to you" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <Card key={sub._id}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{sub.name}</h3>
                <Badge label={sub.code} variant="green" />
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Department: {sub.department?.name}</p>
                <p>Semester: {sub.semester} &nbsp;|&nbsp; Credits: {sub.credits}</p>
                {sub.description && <p className="text-gray-400 line-clamp-2">{sub.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultySubjects;
