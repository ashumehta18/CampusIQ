import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import enrollmentService from '../../services/enrollmentService';
import assessmentService from '../../services/assessmentService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const typeVariant = {
  Quiz: 'blue', Assignment: 'gray', Midterm: 'yellow',
  Internal: 'purple', Practical: 'green', Final: 'red',
};

const StudentAssessments = () => {
  const { data: enrollments } = useFetch(enrollmentService.getAll);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSubject) { setAssessments([]); return; }
    const load = async () => {
      setLoading(true);
      try {
        const res = await assessmentService.getBySubject(selectedSubject);
        setAssessments(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedSubject]);

  return (
    <div>
      <PageHeader title="Assessments" subtitle="View all assessments for your enrolled subjects" />

      <Card className="mb-6">
        <label className="block text-sm text-gray-600 mb-1">Select Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select subject</option>
          {enrollments?.map((en) => (
            <option key={en.subject._id} value={en.subject._id}>
              {en.subject.name} ({en.subject.code})
            </option>
          ))}
        </select>
      </Card>

      {!selectedSubject ? (
        <EmptyState icon="📝" title="Select a subject to view assessments" />
      ) : loading ? (
        <Spinner />
      ) : assessments.length === 0 ? (
        <EmptyState icon="📝" title="No assessments scheduled yet" />
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <Card key={a._id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Badge label={a.type} variant={typeVariant[a.type] || 'gray'} />
                  <div>
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Max: {a.maxMarks} marks &nbsp;·&nbsp;
                      {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {a.weightage > 0 && ` · Weightage: ${a.weightage}%`}
                    </p>
                  </div>
                </div>
              </div>
              {a.description && <p className="text-sm text-gray-400 mt-2">{a.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssessments;
