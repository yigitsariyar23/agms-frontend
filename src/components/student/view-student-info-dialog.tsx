"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Mail,
  Hash,
  Building2,
  UserCheck,
  GraduationCap,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Paperclip,
  XCircle
} from "lucide-react"
import { getToken } from "@/lib/utils/jwt"
import { StudentData } from "@/lib/types/student-data" 
import { AdvisorDetails } from "@/lib/types/advisor-details"
import FileUploadCard from "@/components/student/file-upload-card"
import { AdvisorStudent } from "@/lib/contexts/advisor-context" 

interface ViewStudentInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentNumber: string 
  initialStudentData?: AdvisorStudent 
}

function useStudentDetailsByNumber(studentNumber?: string, open?: boolean) {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!studentNumber || !open) {
      setStudentData(null) 
      return
    }

    const fetchStudentData = async () => {
      setLoading(true)
      try {
        const token = getToken()
        if (!token) {
          setStudentData(null)
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/${studentNumber}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setStudentData(data)
        } else {
          console.error(`❌ Failed to fetch student data from /api/students/${studentNumber}:`, response.status, await response.text())
          setStudentData(null) 
        }

      } catch (error) {
        console.error(`❌ Error fetching student data from /api/students/${studentNumber}:`, error)
        setStudentData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [studentNumber, open])

  return { studentData, loading }
}

export function ViewStudentInfoDialog({ open, onOpenChange, studentNumber, initialStudentData }: ViewStudentInfoDialogProps) {
  const { studentData, loading } = useStudentDetailsByNumber(studentNumber, open)
  const [showCourses, setShowCourses] = useState(false)

  console.log(studentData)
  const hasCompletedCurriculum = studentData?.curriculumCompleted ?? false

  const getAdvisorName = () => {
    if (loading) return 'Loading...';
    if (studentData?.advisor) {
      const advisor = studentData.advisor as AdvisorDetails;
      const fullName = `${advisor.firstName || ''} ${advisor.lastName || ''}`.trim()
      return fullName || 'Not assigned'
    }
    return 'Not assigned'
  }

  const getGPA = () => {
    if (loading && !initialStudentData?.gpa) return 0;
    return studentData?.gpa ?? initialStudentData?.gpa ?? 0
  }

  const getTotalCredits = () => {
    if (loading && !(initialStudentData?.credits || initialStudentData?.totalCredits)) return 0;
    return studentData?.totalCredit ?? initialStudentData?.credits ?? initialStudentData?.totalCredits ?? 0
  }

  const getCourses = () => {
    if (loading && !studentData?.courses) return [];
    return studentData?.courses || []
  }

  const getCurriculumStatusText = (): "Completed" | "Not Completed" | "Loading..." => {
    if (loading && studentData?.curriculumCompleted === undefined) return 'Loading...';
    if (studentData?.curriculumCompleted !== undefined) {
        return studentData.curriculumCompleted ? "Completed" : "Not Completed";
    }
    return "Not Completed"; 
}


  const getStudentName = () => {
    if (loading && !initialStudentData?.name) return 'Loading...';
    if (initialStudentData?.name && !studentData) return initialStudentData.name;
    if (studentData?.firstName && studentData?.lastName) return `${studentData.firstName} ${studentData.lastName}`;
    return initialStudentData?.name || studentNumber || 'Not available' 
  }

  const getStudentEmail = () => {
    if (loading && !initialStudentData?.email) return 'Loading...';
    return studentData?.email ?? initialStudentData?.email ?? 'Not available'
  }

  const getStudentNumberToDisplay = () => {
    if (loading && !studentData?.studentNumber && !initialStudentData?.studentNumber) return 'Loading...';
    return studentData?.studentNumber || initialStudentData?.studentNumber || studentNumber || 'Not available' 
  }

  const getDepartment = () => {
    if (loading && !initialStudentData?.department) return 'Loading...';
    return studentData?.department ?? initialStudentData?.department ?? 'Not available'
  }

  const getSemester = () => {
    if (loading && !initialStudentData?.semester && !studentData?.semester) return null;
    return studentData?.semester ?? initialStudentData?.semester ?? null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Information</DialogTitle>
          <DialogDescription>
            Detailed student profile, graduation status, and attached files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {loading && !(studentData || initialStudentData) ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : studentData || initialStudentData ? (
            <>
              {/* Student Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Student Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {getStudentName()} 
                      </h3>
                      <p className="text-sm text-muted-foreground">Student</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Student Number</p>
                          <p className="text-base font-medium">{getStudentNumberToDisplay()}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                          <p className="text-base font-medium">{getStudentEmail()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Department</p>
                          <p className="text-base font-medium">{getDepartment()}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <UserCheck className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Academic Advisor</p>
                          <p className="text-base font-medium">{getAdvisorName()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Academic Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading && !studentData ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Move Semester to Top */}
                        {studentData?.semester && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Semester:</span>
                            <span className="font-medium">{studentData.semester}</span>
                          </div>
                        )}
                        {/* GPA Line with Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">GPA:</span>
                          <span className="font-medium flex items-center gap-2">
                            {getGPA().toFixed(2)}
                            {getGPA() < 2.0 ? (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-900 font-semibold">
                                  GPA is not enough
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-900 font-semibold">
                                  GPA is sufficient
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        {/* Credits Line with Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Credits:</span>
                          <span className="font-medium flex items-center gap-2">
                            {getTotalCredits()}
                            {getTotalCredits() < 23 ? (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-900 font-semibold">
                                  Credits are not enough
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-900 font-semibold">
                                  Credits are sufficient
                                </span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Clickable Curriculum Status */}
                        <div
                          className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                          onClick={() => setShowCourses(!showCourses)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Curriculum:</span>
                            {showCourses ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {hasCompletedCurriculum ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            )}
                            <Badge variant={hasCompletedCurriculum ? "default" : "secondary"}>
                              {getCurriculumStatusText()}
                            </Badge>
                          </div>
                        </div>

                        {/* Expandable Courses List */}
                        {showCourses && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-2 mb-3">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Courses Taken</span>
                            </div>
                            { getCourses().length === 0 ? (
                              <div className="text-center py-4">
                                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  {loading && !studentData?.courses ? 'Loading courses...' : 'No courses found or not loaded yet.'}
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {getCourses().map((course, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs p-2 bg-background rounded border">
                                      <div className="flex-1">
                                        <div className="font-medium">{course.code || 'N/A'}</div>
                                        <div className="text-muted-foreground truncate" title={course.name || 'Course name not available'}>{course.name || 'Course name not available'}</div>
                                      </div>
                                      <div className="text-right ml-2">
                                        <div className="font-medium">{course.grade || 'N/A'}</div>
                                        <div className="text-muted-foreground">{course.credit || 0} credits</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Attached Files Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="w-5 h-5" />
                      Attached Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploadCard /> 
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
             <div className="text-center py-10">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Student Data Not Available</p>
                <p className="text-sm text-muted-foreground">
                  Could not load student information. The student number might be invalid,
                  data is not yet available, or there was an error.
                </p>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
