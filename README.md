# Mainstack Product Store Manager
## Overview

Product Store Manager is an event-driven inventory management system designed for handling product lifecycle processes efficiently. The application follows an event-based architecture similar to microservices, where different domains communicate through an event bus.

## Key Features & Technical Accomplishments

->  Event-Driven Architecture:

- When a user signs up in the User Management Domain, an event is triggered to notify the user via the Notification System.

- When product stock is low in the Product Management Domain, an event is fired to alert the warehouse or inventory manager.

->  Domain Separation: The application is structured around different domains such as User Management, Product Management, and Notification Services.

-> Scalable & Modular Design: Loosely coupled services with dependency injection for maintainability.

-> MongoDB as Database: NoSQL document storage for handling flexible data structures.

=>  RESTful API with Express.js: Secure and well-structured API endpoints.

->  Dockerized Deployment: Containerized application for easy deployment and scaling.

-> Comprehensive Testing: 80% Unit and integration test suites coverage that ensure application stability.

## API Design

The following table outlines the API design for product management domain:

| **HTTP Method** | **Endpoint**                    | **Description**                                     | **Request Body**        | **Response**            |
|-----------------|---------------------------------|-----------------------------------------------------|-------------------------|-------------------------|
| `POST`          | `/products/`                    | Create a new product                                | `CreateProductDTO`      | `Product`               |
| `GET`           | `/products/:id`                 | Fetch a product by its ID                           | N/A                     | `Product`               |
| `PATCH`         | `/products/:id`                 | Update a product's information                      | `UpdateProductDTO`      | `Product`               |
| `DELETE`        | `/products/:id`                 | Delete a product                                    | N/A                     | `Product`               |
| `GET`           | `/products/`                    | Fetch all products with query parameters for filtering | `QueryParams`           | `PaginationResult`      |



## and Domains
- User management
- Product Management
- Notification System

## Tech Stack
- **Backend:** Node.js, Express.js, EventEmmitter2
- **Database:** MongoDB. Query fields are indexed for query efficiency
- **Authentication:** JSON Web Tokens (JWT), Argon2 for password hashing
- **Validation:** Class-validator for input validation and sanitation
- **Security:** Helmet for HTTP header security, CORS for cross-origin resource sharing
- **Test:** Jest and supertest
- **Containerization:** Docker


## Design Pattern
- Services layer pattern
- Repositories layer pattern
- SOLID and DRY principles
- Test Driven Development

## Getting Started
1. **Clone the repository:**
git clone 

2. **Install dependencies:**
`npm install or yarn install`

3. **Set up environment variables:**
- Create a `.env` file in the root directory.
- Define the following variables in the `.env` file:
  ```
  NODE_ENV=development
  PORT=2024
  DATABASE_URI=your_database_connection_string
  JWT_SECRET=your_jwt_secret_key
  ```
4. **Run test:**
`npm run test or yarn test`
5. **Start the development server:**
`npm run dev or yarn dev`

6. **Access the application:**
- Open a web browser and navigate to `http://localhost:5500` to access the application.

## License
This project is licensed under the [MIT License](LICENSE).

## Contributions
Contributions are welcome! If you'd like to contribute to this project, please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature`)
6. Create a new Pull Request
