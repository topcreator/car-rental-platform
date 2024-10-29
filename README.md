
## Car Rental Platform

A car rental platform, supplier-oriented, with a backend for managing car fleets and bookings, as well as a frontend and a mobile app for renting cars.

Car Rental Platform is designed to work with multiple suppliers. Each supplier can manage his car fleet and bookings from the backend. Car Rental Platform can also work with only one supplier and can be used as a car rental aggregator.

From the backend, admins can create and manage suppliers, cars, locations, customers and bookings.

When new suppliers are created, they receive an email prompting them to create an account in order to access the backend and manage their car fleet and bookings.

Customers can sign up from the frontend or the mobile app, search for available cars based on pickup and drop-off points and time, choose a car and complete the checkout process.

A key design decision was made to use TypeScript instead of JavaScript due to its numerous advantages. TypeScript offers strong typing, tooling, and integration, resulting in high-quality, scalable, more readable and maintainable code that is easy to debug and test.

I invested significant time and effort into building this open-source project to make it freely available to the community. If this open-source project has been helpful in your work, consider supporting its continued development and maintenance.

## Features

* Supplier management
* Ready for one or multiple suppliers
* Car fleet management
* Location, country, parking spots and map features
* Booking management
* Payment management
* Customer management
* Multiple payment methods (Credit Card, PayPal, Google Pay, Apple Pay, Link, Pay Later)
* Operational Stripe Payment Gateway
* Multiple language support (English, French, Spanish)
* Multiple pagination options (Classic pagination with next and previous buttons, infinite scroll)
* Responsive backend and frontend
* Native Mobile app for Android and iOS with single codebase
* Push notifications
* Secure against XSS, XST, CSRF and MITM
* Supported Platforms: iOS, Android, Web, Docker