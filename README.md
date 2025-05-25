## API Documentation

### Authentication
All endpoints require authentication. Unauthorized requests will receive a 401 status code.

### 1. User Management

#### Get Current User
```http
GET /api/user
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    id: string,
    name: string,
    email: string,
    image: string,
    role: "candidate" | "employer"
  }
}
```

#### Get User by ID
```http
GET /api/user/{id}
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    id: string,
    name: string,
    email: string,
    image: string,
    role: "candidate" | "employer"
  }
}
```

### 2. Profile Management

#### Update Candidate Profile (Candidate Only)
```http
PUT /api/candidate/profile
```
**Payload:**
```typescript
{
  skills?: string[],
  experience?: {
    companyName: string,
    companyWebsite?: string,
    jobType: "full-time" | "part-time" | "contract" | "freelance" | "internship",
    jobTitle: string,
    startDate: string,
    endDate: string,
    description: string,
    location: string,
    technologies: string[],
    isCurrent: boolean
  }[],
  projects?: {
    title: string,
    link: string,
    description: string,
    technologies: string[]
  }[],
  socialLinks?: {
    linkedin?: string,
    github?: string,
    x?: string,
    portfolio?: string
  },
  summary?: string
}
```

#### Update Company Details (Employer Only)
```http
PUT /api/employer/company-details
```
**Payload:**
```typescript
{
  userId: string,
  companyDetails: {
    name: string,
    about: string,
    website?: string,
    linkedin?: string,
    x?: string,
    logo: string,
    numberOfEmployees: number,
    companyType: string,
    industryType: string,
    tagline: string
  }
}
```

### 3. Job Management

#### Get All Jobs
```http
GET /api/job
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    _id: string,
    title: string,
    about: string,
    employerId: {
      name: string,
      email: string,
      image: string,
      companyDetails: {
        name: string,
        about: string,
        website?: string,
        linkedin?: string,
        x?: string,
        logo: string,
        numberOfEmployees: number,
        companyType: string,
        industryType: string,
        tagline: string
      }
    },
    CTC: string,
    jobType: string,
    workExperience: string,
    techStack: string[],
    createdAt: string,
    updatedAt: string
  }[]
}
```

#### Get Job by ID
```http
GET /api/job/{jobId}
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    _id: string,
    title: string,
    about: string,
    employerId: {
      name: string,
      email: string,
      image: string,
      companyDetails: object
    },
    CTC: string,
    jobType: string,
    workExperience: string,
    techStack: string[]
  }
}
```

#### Create Job (Employer Only)
```http
POST /api/job
```
**Payload:**
```typescript
{
  title: string,
  about: string,
  CTC: string,
  jobType: string,
  workExperience: string,
  techStack: string[]
}
```

#### Update Job (Employer Only)
```http
PUT /api/job/{jobId}
```
**Payload:**
```typescript
{
  title?: string,
  about?: string,
  CTC?: string,
  jobType?: string,
  workExperience?: string,
  techStack?: string[]
}
```

#### Delete Job (Employer Only)
```http
DELETE /api/job/{jobId}
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    message: string
  }
}
```

### 4. Applications

#### Apply for Job (Candidate Only)
```http
POST /api/candidate/apply/{jobId}
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    applicationId: string,
    status: "PENDING" | "REVIEWED" | "INTERVIEW_SCHEDULED" | "REJECTED" | "HIRED"
  }
}
```

#### Get Job Applications (Employer Only)
```http
GET /api/applications/{jobId}
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    _id: string,
    jobId: {
      title: string,
      about: string,
      CTC: string
    },
    candidateId: {
      name: string,
      email: string,
      image: string
    },
    status: string,
    createdAt: string,
    updatedAt: string
  }[]
}
```

#### Get User Applications
```http
GET /api/applications/user
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    _id: string,
    jobId: {
      title: string,
      about: string,
      CTC: string,
      employerId: {
        name: string,
        email: string,
        companyDetails: object
      }
    },
    status: string,
    createdAt: string,
    updatedAt: string
  }[]
}
```

#### Get Application Details
```http
GET /api/applications/candidate/{id}
```
**Response:**
```typescript
{
  error: null | string,
  data: {
    application: {
      jobId: {
        title: string,
        about: string,
        CTC: string,
        jobType: string,
        workExperience: string,
        techStack: string[],
        employerId: {
          name: string,
          email: string,
          image: string,
          companyDetails: object
        }
      },
      status: string
    },
    conversations: {
      _id: string,
      jobId: string,
      candidateId: string,
      interviewer: string,
      candidate: string,
      analysis: {
        status: "question-answered" | "question-skipped" | "question-not-answered",
        accuracy: number,
        confidence: number,
        difficulty: "easy" | "medium" | "hard"
      },
      createdAt: string,
      updatedAt: string
    }[]
  }
}
```

#### Update Application Status (Employer Only)
```http
PUT /api/applications/{jobId}
```
**Payload:**
```typescript
{
  applicationId: string,
  status: "PENDING" | "REVIEWED" | "INTERVIEW_SCHEDULED" | "REJECTED" | "HIRED"
}
```

### 5. Interview Process

#### Start Interview Conversation (Candidate Only)
```http
POST /api/candidate/conversation/{jobid}
```
**Payload:**
```typescript
{
  interviewer: string,
  candidate: string,
  analysis: {
    status: "question-answered" | "question-skipped" | "question-not-answered",
    accuracy: number,
    confidence: number,
    difficulty: "easy" | "medium" | "hard"
  }
}
```

### Common Response Format
All endpoints follow this response format:
```typescript
{
  error: null | string,
  data: T | null
}
```

### Status Codes
- 200: Success
- 400: Bad Request (Invalid input)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### Notes for Frontend Developers
1. All endpoints require authentication
2. Use proper error handling for all API calls
3. Validate input according to the schemas before sending requests
4. Handle loading and error states appropriately
5. All dates should be in ISO format
6. URLs (website, social links) must be valid and include proper domains
