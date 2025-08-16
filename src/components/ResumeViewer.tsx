import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award,
  Calendar,
  Globe,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string[];
    skills: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface ResumeViewerProps {
  resumeData?: ResumeData;
  fileName?: string;
  onExport?: (format: 'json' | 'csv' | 'txt') => void;
}

// Mock resume data for demonstration
const mockResumeData: ResumeData = {
  personalInfo: {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedIn: "linkedin.com/in/johndoe",
    website: "johndoe.dev"
  },
  summary: "Experienced Software Engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      duration: "2022 - Present",
      description: [
        "Led development of microservices architecture serving 1M+ users",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
        "Mentored 3 junior developers and conducted code reviews"
      ],
      skills: ["React", "Node.js", "AWS", "Docker"]
    },
    {
      title: "Software Developer",
      company: "StartupXYZ",
      duration: "2020 - 2022",
      description: [
        "Built responsive web applications using React and TypeScript",
        "Designed RESTful APIs with 99.9% uptime",
        "Collaborated with UX team to improve user engagement by 40%"
      ],
      skills: ["React", "TypeScript", "Python", "PostgreSQL"]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      year: "2020",
      gpa: "3.8"
    }
  ],
  skills: {
    technical: ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker", "PostgreSQL", "MongoDB"],
    soft: ["Leadership", "Problem Solving", "Communication", "Team Collaboration"]
  },
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023"
    },
    {
      name: "Certified Scrum Master",
      issuer: "Scrum Alliance",
      date: "2022"
    }
  ]
};

export const ResumeViewer: React.FC<ResumeViewerProps> = ({ 
  resumeData = mockResumeData, 
  fileName = "resume.pdf",
  onExport 
}) => {
  const handleExport = (format: 'json' | 'csv' | 'txt') => {
    let content = '';
    let mimeType = '';
    let fileExtension = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(resumeData, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'csv':
        // Convert to CSV format
        const csvHeaders = ['Field', 'Value'];
        const csvRows = [
          ['Name', resumeData.personalInfo.name],
          ['Email', resumeData.personalInfo.email],
          ['Phone', resumeData.personalInfo.phone],
          ['Location', resumeData.personalInfo.location],
          ['Summary', resumeData.summary],
          ...resumeData.experience.flatMap((exp, i) => [
            [`Experience ${i + 1} - Title`, exp.title],
            [`Experience ${i + 1} - Company`, exp.company],
            [`Experience ${i + 1} - Duration`, exp.duration],
            [`Experience ${i + 1} - Description`, exp.description.join('; ')],
            [`Experience ${i + 1} - Skills`, exp.skills.join(', ')]
          ]),
          ...resumeData.education.map((edu, i) => [
            [`Education ${i + 1}`, `${edu.degree} from ${edu.institution} (${edu.year})`]
          ]),
          ['Technical Skills', resumeData.skills.technical.join(', ')],
          ['Soft Skills', resumeData.skills.soft.join(', ')],
          ...resumeData.certifications.map((cert, i) => [
            [`Certification ${i + 1}`, `${cert.name} - ${cert.issuer} (${cert.date})`]
          ])
        ];
        content = [csvHeaders, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'txt':
        content = `RESUME PARSING RESULTS
========================

PERSONAL INFORMATION
Name: ${resumeData.personalInfo.name}
Email: ${resumeData.personalInfo.email}
Phone: ${resumeData.personalInfo.phone}
Location: ${resumeData.personalInfo.location}
${resumeData.personalInfo.linkedIn ? `LinkedIn: ${resumeData.personalInfo.linkedIn}` : ''}
${resumeData.personalInfo.website ? `Website: ${resumeData.personalInfo.website}` : ''}

SUMMARY
${resumeData.summary}

EXPERIENCE
${resumeData.experience.map((exp, i) => `
${i + 1}. ${exp.title} at ${exp.company} (${exp.duration})
   ${exp.description.map(desc => `   • ${desc}`).join('\n')}
   Skills: ${exp.skills.join(', ')}`).join('\n')}

EDUCATION
${resumeData.education.map((edu, i) => `${i + 1}. ${edu.degree} from ${edu.institution} (${edu.year})${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}`).join('\n')}

SKILLS
Technical: ${resumeData.skills.technical.join(', ')}
Soft Skills: ${resumeData.skills.soft.join(', ')}

CERTIFICATIONS
${resumeData.certifications.map((cert, i) => `${i + 1}. ${cert.name} - ${cert.issuer} (${cert.date})`).join('\n')}`;
        mimeType = 'text/plain';
        fileExtension = 'txt';
        break;
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.split('.')[0]}_parsed.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Resume data exported as ${format.toUpperCase()}`);
    onExport?.(format);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Resume Parsing Results</h2>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('txt')}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExport('json')}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{resumeData.personalInfo.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{resumeData.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{resumeData.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{resumeData.personalInfo.location}</span>
              </div>
              {resumeData.personalInfo.linkedIn && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{resumeData.personalInfo.linkedIn}</span>
                </div>
              )}
              {resumeData.personalInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{resumeData.personalInfo.website}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Professional Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {resumeData.summary}
            </p>
          </Card>

          {/* Experience */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Work Experience</h3>
            </div>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{exp.title}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {exp.duration}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-primary mb-2">{exp.company}</p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                        {desc}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1">
                    {exp.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {index < resumeData.experience.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Education</h3>
            </div>
            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{edu.degree}</h4>
                    <p className="text-sm text-primary">{edu.institution}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{edu.year}</p>
                    {edu.gpa && (
                      <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Skills</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {resumeData.skills.technical.map((skill, i) => (
                    <Badge key={i} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Soft Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {resumeData.skills.soft.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Certifications</h3>
            </div>
            <div className="space-y-3">
              {resumeData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-primary">{cert.issuer}</p>
                  </div>
                  <p className="text-sm font-medium">{cert.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};