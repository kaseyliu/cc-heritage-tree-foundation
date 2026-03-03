# Architecture

This document describes the project architecture using a lightweight C4 approach.

## 1) System Context

```mermaid
flowchart LR
  V[Volunteer User] --> UI[Heritage Tree Web App]
  A[Admin User] --> UI

  UI <--> Clerk[Clerk Auth + Organizations]
  UI --> API[Next.js Route Handlers]

  API <--> Mongo[(MongoDB)]
  API <--> S3Tree[(S3: tree-photo-bucket-2)]
  API <--> S3Profile[(S3: picture-profile-bucket-2)]
  API <--> S3Msg[(S3: messages-attachment-bucket-2)]
```

## 2) Containers and Major Components

```mermaid
flowchart TB
  subgraph Browser["Client - Next.js App Router Pages"]
    Login["/login"]
    Signup["/signup"]
    Dashboard["/adminDashboard and /volunteerDashboard"]
    Trees["/treeTable"]
    Volunteers["/volunteers"]
    Messages["/messages"]
    EditProfile["/editUserProfile"]
  end

  subgraph Server["Next.js Route Handlers"]
    UserAPI["/api/user and /api/user/:id and /api/user/by-name/:name"]
    TreeAPI["/api/tree and /api/tree/:treeID"]
    MsgAPI["/api/messages and /api/messages/:messageID"]
    ProfileAPI["/api/profile"]
    ClerkAPI["/api/clerk/*"]
  end

  Browser --> UserAPI
  Browser --> TreeAPI
  Browser --> MsgAPI
  Browser --> ProfileAPI
  Browser <--> ClerkAPI

  ClerkAPI <--> Clerk[Clerk]
  UserAPI <--> DB[(MongoDB)]
  TreeAPI <--> DB
  MsgAPI <--> DB

  TreeAPI <--> S3Tree[(S3 tree photos)]
  ProfileAPI <--> S3Profile[(S3 profile photos)]
  MsgAPI <--> S3Msg[(S3 message attachments)]
```

## 3) Key Runtime Flows

### 3.1 Auth + First Login Provisioning

```mermaid
sequenceDiagram
  participant U as User
  participant C as Clerk
  participant P as /signupredirect
  participant API as /api/user
  participant DB as MongoDB

  U->>C: Sign up / sign in
  C-->>U: Authenticated session
  U->>P: Redirect after sign-up
  P->>API: POST user profile basics
  API->>DB: Upsert user by email
  DB-->>API: Saved user
  API-->>P: Success
```

### 3.2 Profile Picture Update

```mermaid
sequenceDiagram
  participant U as User
  participant EP as /editUserProfile
  participant Prof as /api/profile
  participant S3 as S3 profile bucket
  participant UserAPI as /api/user/:id

  U->>EP: Upload image
  EP->>Prof: POST multipart/form-data
  Prof->>S3: Upload object
  S3-->>Prof: Public URL
  Prof-->>EP: { url }
  U->>EP: Press Save
  EP->>UserAPI: PUT updated profileURL (+ fields)
  UserAPI-->>EP: Success
```

### 3.3 Messages Read Path (Enriched Response)

```mermaid
sequenceDiagram
  participant UI as /messages page
  participant MsgAPI as /api/messages
  participant DB as MongoDB

  UI->>MsgAPI: GET messages
  MsgAPI->>DB: Find announcements
  MsgAPI->>DB: Find users for sender profile URLs
  MsgAPI-->>UI: messages + senderProfileURL
  UI->>UI: Filter inbox/sent and render
```

## 4) Data Ownership

- `MongoDB`
  - `users` collection: profile, role, contact data, profileURL
  - `trees` collection: tree records and metadata
  - `announcements` collection: messages, recipients, read state, attachmentUrl
- `S3 buckets`
  - Tree images
  - Profile images
  - Message attachments
- `Clerk`
  - Authentication/session
  - Organization memberships and roles (`org:admin`, `org:member`)

## 5) Notes and Constraints

- Authorization in UI depends primarily on Clerk organization role.
- Some pages still include client-side filtering/pagination after full list fetches.
- APIs have started moving to enriched responses to reduce N+1 profile lookups.
