# Mainstack APIs

## Features
- User management
- Product Management
- Inventory management

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
