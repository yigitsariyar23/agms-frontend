"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Hash, 
  Building2, 
  UserCheck, 
  GraduationCap, 
  FileText,
  Upload,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  BookOpen
} from "lucide-react"
import { useStudent } from "@/lib/contexts/student-context"

interface ViewStudentInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewStudentInfoDialog({ open, onOpenChange }: ViewStudentInfoDialogProps) {
  const { studentProfile, studentData, loading, loadingDetailedInfo, hasCompletedCurriculum, getCurriculumStatus } = useStudent()
  const [showCourses, setShowCourses] = useState(false)

  const getAdvisorName = () => {
    // Handle detailed advisor data from studentData
    if (studentData?.advisor) {
      const firstName = studentData.advisor.firstName || ''
      const lastName = studentData.advisor.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim()
      return fullName || 'Not assigned'
    }
    
    // Handle advisor from studentProfile (could be string or object)
    if (studentProfile?.advisor) {
      // If advisor is a string, return it directly
      if (typeof studentProfile.advisor === 'string') {
        return studentProfile.advisor
      }
      
      // If advisor is an object, extract the name properties
      if (typeof studentProfile.advisor === 'object' && studentProfile.advisor !== null) {
        const advisorObj = studentProfile.advisor as any
        const firstName = advisorObj.firstName || ''
        const lastName = advisorObj.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim()
        return fullName || 'Not assigned'
      }
    }
    
    return 'Not assigned'
  }

  const getGPA = () => {
    return studentData?.gpa || studentProfile?.gpa || 0
  }

  const getTotalCredits = () => {
    return studentData?.totalCredit || studentProfile?.totalCredits || 0
  }

  const getCourses = () => {
    return studentData?.courses || []
  }

  const getTotalCompletedCredits = () => {
    const courses = getCourses()
    return courses.reduce((total, course) => total + (course.credit || 0), 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Information
          </DialogTitle>
          <DialogDescription>
            Complete student profile and academic information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {/* Student Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {studentProfile ? `${studentProfile.firstname} ${studentProfile.lastname}` : 'Not available'}
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
                          <p className="text-base font-medium">{studentProfile?.studentNumber || 'Not available'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                          <p className="text-base font-medium">{studentProfile?.email || 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Department</p>
                          <p className="text-base font-medium">{studentData?.department || studentProfile?.department || 'Not available'}</p>
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
                {/* Graduation Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Graduation Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingDetailedInfo ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">GPA:</span>
                          <span className="font-medium">{getGPA().toFixed(2)}</span>
                        </div>
                                                
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Credits:</span>
                          <span className="font-medium">{getTotalCredits()}</span>
                        </div>

                        {studentData?.semester && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Semester:</span>
                            <span className="font-medium">{studentData.semester}</span>
                          </div>
                        )}

                        
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
                              {getCurriculumStatus()}
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
                            {loadingDetailedInfo ? (
                              <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                              </div>
                            ) : getCourses().length === 0 ? (
                              <div className="text-center py-4">
                                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No courses found</p>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {getCourses().map((course, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs p-2 bg-background rounded border">
                                      <div className="flex-1">
                                        <div className="font-medium">{course.code || 'N/A'}</div>
                                        <div className="text-muted-foreground truncate">{course.name || 'Course name not available'}</div>
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
                      <FileText className="w-5 h-5" />
                      Attached Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-6">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No files attached</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full bg-gray-800 text-white hover:bg-gray-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Attach Files
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
