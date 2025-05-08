# Student Bazaar

A full-stack marketplace web application designed for university students to buy, sell, and exchange school-related items. Built using Node.js, MySQL, OpenSearch, and AWS infrastructure.

---

## Getting Started

### Prerequisites
- Node.js and npm
- MySQL Workbench (optional, for database schema viewing)
- `.env` file with required environment variables

### Installation

```bash
npm install         # Install dependencies
npm run dev         # Run in development mode
npm start           # Run in production mode
```

The server runs at: `http://localhost:5000`

---

## Features

- User Authentication – Email-based login (mocked for demo)
- Product Listings – Create, edit, and view items
- OpenSearch Integration – Fuzzy/partial search functionality
- AWS S3 Uploads – Profile and item images stored securely
- Filtering – Search results can be filtered by category, price, etc.
- Faculty Supervision – Listing moderation support
- Planned Features – Messaging system, rating/review system, analytics dashboard

---

## Technologies Used

| Layer         | Technology                  |
|--------------|-----------------------------|
| Frontend     | HTML, CSS, EJS Templates    |
| Backend      | Node.js, Express.js         |
| Database     | MySQL (hosted on AWS RDS)   |
| Search       | OpenSearch (AWS)            |
| Storage      | AWS S3                      |
| Hosting      | AWS EC2                     |
| Security     | IAM, SSH, Security Groups   |

---

## AWS Infrastructure Overview

- **EC2** – Hosts the backend Node.js application
- **RDS (MySQL)** – Private subnet, accessed via SSH tunneling
- **S3** – Cloud object storage for profile and listing images
- **OpenSearch** – Indexes and queries listing data with typo-tolerant matching
- **IAM** – Access roles and policies for scoped permissions
- **Security Groups** – Controlled traffic rules for services
- **SSH Tunneling** – Enables secure local access to cloud-hosted RDS

Architecture diagram can be found in `docs/aws_diagram.png` (to be added).

---

## OpenSearch Integration

- Custom edge_ngram analyzer supports partial/fuzzy matching
- Indexed fields:
  - `name`, `description`, `price`, `categoryName`, `imageUrl`, `tags[]`
- Reindex route: `POST /dev/reindex`
- Search routes:
  - `POST /search` (query)
  - `GET /search-results` (rendered view)

---

## Image Uploads (S3)

- Users upload:
  - Profile pictures (`profile-pictures/` folder)
  - Item images (`item-pictures/` folder)
- URLs are stored in the database (`imageUrl`) and indexed
- Images are rendered in listing cards via the S3 `imageUrl`

---

## ERD & Architecture Diagrams

- Entity-Relationship Diagram: `docs/ERD_student_bazaar.png`
- AWS Architecture Diagram: `docs/aws_diagram.png`

---

## Future Improvements

- Enable tag-based search and filters
- Add user dashboards with saved listings
- Implement integrated messaging system
- Add payment gateway support (Stripe, PayPal)
- Build faculty reporting dashboard
- Enhance accessibility features

---

## Environment Variables

Create a `.env` file with the following keys:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
S3_BUCKET_NAME=
AWS_REGION=
OPENSEARCH_HOST=
```

---

Project created by Pure Code Solutions | CSUN Capstone 2025