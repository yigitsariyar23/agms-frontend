import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// It's recommended to have a centralized Student interface, 
// for example, in your src/lib/types/student.ts or user.ts
export interface StudentInfoProps {
  student: {
    name: string;
    number: string;
    email: string;
    department: string;
    advisor: string;
    gpa?: number;
    curriculum?: string;
    credits?: number;
    semester?: number;
    files?: string[]; // Or a more specific type for files
    // Comments - these can be extended based on which dashboard is using this component
    advisorComment?: string;
    secretaryComment?: string;
    deanComment?: string;
    declineReason?: string;
    // Graduation status fields specific to Student Affairs dashboard view
    graduationStatus?: string; 
    graduationComment?: string;
  };
}

export function ViewStudentInfo({ student }: StudentInfoProps) {
  if (!student) {
    return <p>No student information available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pt-4">
            <div className="text-2xl font-bold mb-2">{student.name}</div>
            <p className="mb-1">
              <strong>Student Number:</strong> {student.number}
            </p>
            <p className="mb-1">
              <strong>Email:</strong> {student.email}
            </p>
            <p className="mb-1">
              <strong>Department:</strong> {student.department}
            </p>
            <p className="mb-1">
              <strong>Advisor:</strong> {student.advisor}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Academic Status</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof student.gpa === 'number' && (
              <p className="mb-1">
                <strong>GPA:</strong> {student.gpa}
              </p>
            )}
            {student.curriculum && (
              <p className="mb-1">
                <strong>Curriculum:</strong> {student.curriculum}
              </p>
            )}
            {typeof student.credits === 'number' && (
              <p className="mb-1">
                <strong>Credits:</strong> {student.credits}
              </p>
            )}
            {typeof student.semester === 'number' && (
              <p className="mb-1">
                <strong>Semester:</strong> {student.semester}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attached Files</CardTitle>
          </CardHeader>
          <CardContent>
            {/* This section can be enhanced to list actual files with download links */}
            {student.files && student.files.length > 0 ? (
              <ul>
                {student.files.map((file, index) => (
                  <li key={index}>{file}</li> // Replace with actual file display/link
                ))}
              </ul>
            ) : (
              <div>No files attached</div>
            )}
            {/* <Button className="mt-2">Attach Files</Button> */}
            {/* Attach files functionality would be specific to the calling dashboard context */}
          </CardContent>
        </Card>
      </div>

      {/* Review Information Section - Conditionally render comments */}
      {(student.advisorComment || student.secretaryComment || student.deanComment || student.declineReason || student.graduationComment) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Review & Processing Information</CardTitle>
          </CardHeader>
          <CardContent>
            {student.advisorComment && (
              <div className="mb-2">
                <h4 className="font-semibold">Advisor's Comment:</h4>
                <p className="mt-1 text-sm text-muted-foreground">{student.advisorComment}</p>
              </div>
            )}
            {student.secretaryComment && (
              <div className="mb-2">
                <h4 className="font-semibold">Department Secretary's Comment:</h4>
                <p className="mt-1 text-sm text-muted-foreground">{student.secretaryComment}</p>
              </div>
            )}
            {student.deanComment && (
              <div className="mb-2">
                <h4 className="font-semibold">Dean's Office Comment:</h4>
                <p className="mt-1 text-sm text-muted-foreground">{student.deanComment}</p>
              </div>
            )}
            {student.declineReason && (
              <div className="mb-2">
                <h4 className="font-semibold">Decline Reason:</h4>
                <p className="mt-1 text-sm text-muted-foreground">{student.declineReason}</p>
              </div>
            )}
             {student.graduationStatus && (
              <div className="mb-2">
                <h4 className="font-semibold">Student Affairs - Graduation Status:</h4>
                <p className="mt-1 text-sm text-muted-foreground">{student.graduationStatus}</p>
              </div>
            )}
            {student.graduationComment && (
              <div className="mb-2">
                <h4 className="font-semibold">Student Affairs - Comment:</h4>
                <p className="mt-1 text-sm text-muted-foreground">{student.graduationComment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ViewStudentInfo; 