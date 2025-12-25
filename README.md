# AeroNode_Inventory_Service
Inventory Service for booking flights
A great "Scientific" project like SkyLedger deserves a high-level README. This isn't just a "how-to" guide; for someone like you who wants to break out into a major development role, this is your Technical Manifesto.

When an interviewer at a company like TCS (or a top product firm) reads this, they should see a software engineer who thinks about scalability, concurrency, and data integrity—not just syntax.

Here is a professional README structure for the Inventory Microservice.

SkyLedger: Inventory Microservice
A High-Concurrency, Event-Driven Flight Inventory Engine.

The Inventory Microservice is the "Source of Truth" for flight seat availability within the SkyLedger ecosystem. It is designed using Serverless Architecture (AWS Lambda) and Relational Integrity (PostgreSQL) to prevent overbooking and ensure atomic seat allocation.

🚀 Key Engineering Principles
Atomic Transactions: Utilizing PostgreSQL constraints to ensure a seat can never be double-booked.

Optimistic Concurrency: Implementation of a version column to handle high-frequency booking requests without database deadlocks.

Temporal Decoupling: Fully integrated with AWS EventBridge to process booking requests asynchronously.

🛠 Tech Stack
Language: Python 3.x / Node.js

Database: PostgreSQL (AWS RDS / Aurora Serverless)

Compute: AWS Lambda (Serverless)

Orchestration: AWS EventBridge

Connectivity: AWS RDS Proxy (for efficient connection pooling)

📊 Database Schema (The Foundation)
The system is built on a highly normalized relational model to ensure data consistency.

1. Flights Table (flights)
flight_id (UUID): Unique internal identifier.

flight_code (VARCHAR): IATA Airline code + Number (e.g., AI101).

origin_iata / destination_iata: 3-letter airport codes.

departure_utc / arrival_utc: Standardized UTC timestamps.

2. Flight Seats Table (flight_seats)
seat_id (UUID): Unique seat identifier.

seat_number (VARCHAR): e.g., 12A.

status: [AVAILABLE, LOCKED, BOOKED].

version (INT): For Optimistic Locking.

📡 Event-Driven Workflow
The Inventory service communicates via AWS EventBridge to maintain a decoupled architecture.

Incoming Event: OrderCreated

Inventory service receives a request to hold a seat.

Logic:

The system checks availability and creates a row in inventory_locks.

The seat status is updated to LOCKED.

Outgoing Event: SeatReserved / SeatReservationFailed

Emits an event to notify the Payment Service to proceed.

🏗 Setup & Installation
Database Migration: Run the provided SQL scripts in /database/migrations to initialize types and tables.

Environment Variables:

DB_HOST: Your RDS endpoint.

EVENT_BUS_NAME: SkyLedger-Default-Bus.

Deploy: Deploy using AWS SAM or Serverless Framework.
