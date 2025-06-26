1. Full Project Scope (Final Overview)

Student Bazaar is a full-stack e-commerce web application designed to allow university students to buy, sell, and manage secondhand goods. The backend was built in Node.js (ESModules) using Express.js and integrated with a cloud-native infrastructure powered by AWS.

The full intended scope of the backend and infrastructure work included:

- Authentication & Session Management (OAuth, fallback mock user logic)

- RESTful API Endpoints for users, listings, uploads, and search

- Secure Image Uploads to S3 for item listings and profile pictures

- Dynamic Image Rendering with Fallback Logic (default images)

- Search Functionality via AWS OpenSearch, supporting fuzzy and partial matching

- Data Storage in RDS (MySQL) for all core entities (users, listings, orders, etc.)

- SSH Tunneling for Secure Dev Access to RDS and OpenSearch

- Role-Based IAM Configuration for secure EC2, S3, and OpenSearch access

- Scalable, cost-efficient AWS Architecture within the Free Tier

- Final Documentation and Diagrams for system architecture, SDLC, and MVC flow

- Acceptance Testing and Showcase Readiness

 
2. Completed Work (Scope Coverage)

The following tasks were completed by project end:
Infrastructure and IAM:

- Launched and configured EC2 instance with correct IAM role

- SSH tunneling to access RDS and OpenSearch securely

- Functional integration of IAM roles and policies:

    - studentbazaar-ec2-opensearch-role

    - StudentBazaarOpenSearchPolicy, MyS3UploadPolicy

Core Backend Functionality:

- Stable Node.js + Express backend (ESM enabled)

- Clean Git branches with all merge conflicts resolved

- Upload routes:

    - /upload for item images

   -  /upload-pfp for profile pictures

- Fallback logic for missing images (e.g., default-listing.jpg, defaultAvatar.png)

OpenSearch Integration:

- Custom edge_ngram analyzer for partial search

- Fuzzy matching with misspellings ("calcolater" → "calculator")

- Working /search endpoint using JSON input

- Safe response parsing to avoid .hits crash

- Modularized client with support for both SigV4 and basic auth

S3 Integration:

- Functional upload logic using Multer and AWS SDK

- Fallback asset rendering logic implemented in views

- Profile and item images display dynamically (where EJS markup allows)

Frontend Support:

- Dynamic image URLs rendered in key templates (e.g., user-account-dashboard.ejs)

- Partial rendering of profile and item images in listings

- Fallback image logic confirmed working

Git and Dev Workflow:

- backup-sleep-push and backup-stable branches used for safe conflict resolution

- Consistent use of Postman and SSH for local development

Showcase Readiness:

- Architecture diagrams and infrastructure summaries drafted

- Explanations prepared for EC2, RDS, S3, OpenSearch, IAM, and cost strategy

- Postman tests prepared for upload and search

Completion: 100%

 
3. Tools, Dependencies, and Configurations
AWS Services:

- EC2 (Amazon Linux): Backend host

- RDS (MySQL): User, item, and order data

- S3: Stores item and profile images + fallback images

- OpenSearch: Full-text search and indexing

IAM Roles:

- studentbazaar-ec2-opensearch-role (EC2 access to S3 + OpenSearch)

- IAM user dev (for local Postman/API testing)

- Policies: StudentBazaarOpenSearchPolicy, MyS3UploadPolicy

Development Stack:

- Node.js v22.14.0

- Express.js

- ESModules (type: module)

- mysql2, dotenv, multer

- @aws-sdk/client-s3

- @opensearch-project/opensearch

Tunnels:

- localhost:3307 → RDS

- localhost:9200 → OpenSearch

Dev Tools:

- Postman for backend route testing

- MySQL Workbench + CLI

- Diagrams.net, dbdiagram.io (for ERD/system diagrams)

Environment:

- .env includes:

    - DB credentials

    - OpenSearch user/pass

    - S3 bucket name

    - Region info

 Our Infrastructure and Database:
 ![cloud-infastructure](https://github.com/Pure-Code-Solutions/Student_Bazaar/blob/main/uploads/student-bazaar-infastruture.png?raw=true)
 ![database-schema](https://github.com/Pure-Code-Solutions/Student_Bazaar/blob/main/uploads/student-bazaar-database.png?raw=true)
