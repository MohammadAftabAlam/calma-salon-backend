# Calma Salon Backend

**Calma** is an Android-based salon appointment booking app. This repository contains the complete backend codebase built with **Node.js**, **Express.js**, and **MongoDB**. It powers the Calma app's user authentication, salon management, service listings, payments, and appointment handling.



## Features

- 🔐 **User Authentication** – Register/login with secured credentials using JWT & bcrypt.
- 📍 **Location-Based Search** – Find salons within a 4 km radius based on current location.
- 🧖 **Service Listings** – View detailed salon services and prices.
- 💇‍♂️ **Expert Selection** – Book specific experts for your service.
- 📆 **Appointment Booking** – Schedule appointments directly in the app.
- 🔄 **Rescheduling** – Request new slots in emergencies.
- ❌ **Cancellations** – Cancel appointments with valid reasons.
- 💳 **Secure Payments** – Integrated Razorpay support (UPI, card, cash).


## Tech Stack

| Tool          | Purpose                      |
|---------------|------------------------------|
| Node.js       | Backend runtime              |
| Express.js    | Server framework             |
| MongoDB       | Database                     |
| Mongoose      | ODM for MongoDB              |
| JWT, bcrypt   | Authentication & Security    |
| Razorpay API  | Payment gateway integration  |

---

## Folder Structure
```txt
calma-salon-backend/
│
├── controllers/ # Route handlers
├── middleware/z # Auth & error middleware
├── db/ # Database connection & config
├── models/ # Mongoose schemas
├── routes/ # Express route definitions
├── utils/ # Helper utilities
├── .env.example # Environment variable template
├── README.md # Project info
```

## Installation

To run the backend locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/calma-backend.git
   cd calma-backend

2. **Install Dependencies**
   ```bash
   npm install

3. **Setup Environment Variables**
    - Create a .env file in the root directory and add your configuration
    - eg., 
        - PORT=5000
        - MONGO_URI=your_mongodb_connection_string

4. **Run the Development Server**
    ```bash
    npm run dev



##  Api Endpoints
| Method |          Endpoint         |         Description          |
| ------ | ----------------------    | -----------------------------|
| POST   | `/api/v1/users/register`  | Register new users           |
| POST   | `/api/v1/users/login`     | User login                   |
| POST   | `/api/v1/salon/register`  | Register new users           |
| GET    | `/api/v1/salons/nearby`   | Find nearby salons           |

    Full API documentation coming soon (via Swagger/Postman collection)


## Usage

1. Open the application on your Android device.
2. Sign up or log in to your account.
3. Allow the application to access your live location.
4. Browse the listed salons and their services.
5. Choose a service and select an expert.
6. Book an appointment by selecting a suitable time slot.
7. Complete the payment using UPI, card, or choose cash payment.
8. In case of an emergency, reschedule the appointment from the dashboard.
9. To cancel an appointment, provide an appropriate reason and proceed.


## Contribution

We welcome contributions to improve Calma Backend.
To contribute:

1. Fork the repository

2. Create your feature branch:
    ```bash
    git checkout -b feature-branch

3. Make your changes and commit them
    ```bash
    git commit -m 'Add some feature'

4. Push to the branch:
    ```bash
    git push origin feature-branch

5. Create a pull request

## Author
`Mohammad Aftab Alam (me)`


## License
This project is licensed under the `Apache License 2.0`.


## Contact

for any queries or support, please contact me at mohammadaftab1062@gmail.com.