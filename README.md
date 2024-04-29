# ShrinkURL Server

## Index

1. [Description](#description)
2. [Installation](#installation)
3. [Running the app](#running-the-app)
4. [Test](#test)
5. [Husky and Commitlint Configuration](#husky-and-commitlint-configuration)
6. [Endpoints](#endpoints)
   - [Users Controller Endpoints](#users-controller-endpoints)
   - [Authentication Controller Endpoints](#authentication-controller-endpoints)
   - [URLs Controller Endpoints](#urls-controller-endpoints)
   - [Analytics Controller Endpoints](#analytics-controller-endpoints)
7. [Credits](#credits)

## Description

ShrinkURL is a sleek, user-friendly URL shortener project designed to simplify link sharing and management. With its intuitive interface and robust backend, ShrinkURL allows users to generate concise, custom short links for long URLs effortlessly.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Husky and Commitlint Configuration

ShrinkURL utilizes Husky and Commitlint for ensuring consistent commit messages and running pre-commit hooks. To set up Husky and Commitlint, follow these steps:

1. Install Husky and Commitlint as dev dependencies:

```bash
pnpm install --save-dev husky @commitlint/{config-conventional,cli}
```

- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `chore`: Regular code maintenance.
- `ci`: Changes to your CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `docs`: Documentation only changes
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A code change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `revert`: If the commit reverts a previous commit, it should begin with `revert:` , followed by the header of the reverted commit. In the body, it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `test`: Adding missing tests or correcting existing tests

Now, whenever you make a commit, Husky will ensure that your commit message conforms to the conventional commit format specified by Commitlint.

## Endpoints

### Users Controller Endpoints

#### Get User by Email

- **URL:** `/users/email`
- **Method:** `POST`
- **Description:** Retrieves user details by email.
- **Request Body:**
  - `email`: Email of the user to retrieve.
  - `select`: Array specifying which fields of the user entity to select.
- **Response:** Returns the user entity with specified fields.

#### Send Support Email

- **URL:** `/users/support`
- **Method:** `POST`
- **Description:** Sends a support email.
- **Request Body:**
  - `name`: Name of the sender.
  - `email`: Email of the sender.
  - `reason`: Reason for contacting support.
  - `message`: Message content.
- **Response:** Returns the result of the email sending operation.

#### Update User Details

- **URL:** `/users/update/:id`
- **Method:** `PATCH`
- **Description:** Updates details of a user by ID.
- **URL Parameters:**
  - `id`: ID of the user to update.
- **Request Body:**
  - `updateUserDto`: Object containing data to update the user.
- **Response:** Returns the updated user entity.
- **Authentication:** Requires authentication (AuthGuard).

#### Delete User

- **URL:** `/users/delete/:id`
- **Method:** `DELETE`
- **Description:** Deletes a user by ID.
- **URL Parameters:**
  - `id`: ID of the user to delete.
- **Response:** Returns the result of the deletion operation.
- **Authentication:** Requires authentication (AuthGuard).

### Note:

- All endpoints in UsersController except "Get User by Email" and "Send Support Email" require authentication using the AuthGuard.
- "Send Support Email" endpoint sends an email to the configured support email address with the provided details.
- Password reset functionality is not explicitly defined in the UsersController. It's handled within the UsersService.

### Authentication Controller Endpoints

#### Check Authorization

- **URL:** `/auth/authorization`
- **Method:** `GET`
- **Description:** Checks if the user is authorized.
- **Response:** Returns the user if authenticated.
- **Authentication:** Requires authentication (AuthGuard).

#### User Login

- **URL:** `/auth/login`
- **Method:** `POST`
- **Description:** Logs in a user.
- **Request Body:**
  - `email`: Email of the user.
  - `password`: Password of the user.
- **Response:** Returns an access token and email if successful.

#### User Registration

- **URL:** `/auth/register`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**
  - `email`: Email of the user.
  - `password`: Password of the user.
- **Response:** Returns an access token and email if successful.

#### Reset Password

- **URL:** `/auth/reset`
- **Method:** `POST`
- **Description:** Resets user password.
- **Request Body:**
  - `email`: Email of the user.
  - `newPassword`: New password to set.
- **Response:** Returns the result of the password reset operation.

#### Send Recovery Password Email

- **URL:** `/auth/recovery`
- **Method:** `POST`
- **Description:** Sends a recovery password email.
- **Request Body:**
  - `email`: Email of the user.
- **Response:** Returns the result of the email sending operation.

#### Verify Account

- **URL:** `/auth/verify-account/:id`
- **Method:** `POST`
- **Description:** Verifies a user account.
- **URL Parameters:**
  - `id`: ID of the user to verify.
- **Response:** Returns the result of the account verification operation.

#### Google OAuth Authentication

- **URL:** `/auth/google`
- **Method:** `GET`
- **Description:** Initiates Google OAuth authentication.

#### Google OAuth Callback

- **URL:** `/auth/google/callback`
- **Method:** `GET`
- **Description:** Callback endpoint for Google OAuth authentication.

#### Facebook OAuth Authentication

- **URL:** `/auth/facebook`
- **Method:** `GET`
- **Description:** Initiates Facebook OAuth authentication.

#### Facebook OAuth Callback

- **URL:** `/auth/facebook/callback`
- **Method:** `GET`
- **Description:** Callback endpoint for Facebook OAuth authentication.

### Note:

- Endpoints `/auth/google` and `/auth/facebook` initiate OAuth authentication with Google and Facebook respectively.
- Endpoints `/auth/google/callback` and `/auth/facebook/callback` are callback endpoints for OAuth authentication.
- The endpoints `/auth/login`, `/auth/register`, and `/auth/reset` handle email/password authentication.
- The endpoints `/auth/recovery` and `/auth/verify-account/:id` handle account recovery and verification respectively.
- Authentication is required for the "Check Authorization" endpoint, and some other endpoints might require authentication depending on the implementation (e.g., using AuthGuard).

### URLs Controller Endpoints

#### Create a Shortened URL

- **URL:** `/urls/create`
- **Method:** `POST`
- **Description:** Creates a shortened URL.
- **Request Body:**
  - `createURLDto`: Object containing data for creating a shortened URL.
    - `user_id`: ID of the user creating the URL (required).
    - `original_url`: Original URL to be shortened (required).
    - `custom_alias`: Custom alias for the shortened URL (optional).
    - `expiration_date`: Expiration date for the shortened URL (optional).
- **Response:** Returns the created URL entity.
- **Authentication:** Requires authentication (AuthGuard).

#### Retrieve URL Details by Short URL

- **URL:** `/urls/:url`
- **Method:** `GET`
- **Description:** Retrieves details of a URL by its short URL.
- **URL Parameters:**
  - `url`: Short URL of the target URL.
- **Response:** Returns the URL entity with specified fields.
- **Authentication:** Requires authentication (AuthGuard).

#### Retrieve Original URL by Short URL

- **URL:** `/urls/get-url/:url`
- **Method:** `GET`
- **Description:** Retrieves the original URL by its short URL.
- **URL Parameters:**
  - `url`: Short URL of the target URL.
- **Response:** Returns the original URL.
- **Authentication:** Requires authentication (AuthGuard).

#### Retrieve All URLs by User ID

- **URL:** `/urls/get-all/:id`
- **Method:** `GET`
- **Description:** Retrieves all URLs associated with a user by their ID.
- **URL Parameters:**
  - `id`: ID of the user.
- **Response:** Returns an array of URL entities associated with the user.
- **Authentication:** Requires authentication (AuthGuard).

#### Record Visit to Shortened URL

- **URL:** `/urls/short-url/:url`
- **Method:** `POST`
- **Description:** Records a visit to the shortened URL.
- **URL Parameters:**
  - `url`: Short URL of the target URL.
- **Request Body:**
  - `body`: Data related to the visit.
- **Response:** Returns the URL entity.
- **Note:** This endpoint triggers IP address lookup and analytics.
- **Authentication:** No authentication required.

#### Update URL Details

- **URL:** `/urls/update/:id`
- **Method:** `PATCH`
- **Description:** Updates details of a URL by its ID.
- **URL Parameters:**
  - `id`: ID of the URL to update.
- **Request Body:**
  - `updateURLDto`: Object containing data to update the URL.
- **Response:** Returns the updated URL entity.
- **Authentication:** Requires authentication (AuthGuard).

#### Delete URL

- **URL:** `/urls/delete/:id`
- **Method:** `DELETE`
- **Description:** Deletes a URL by its ID.
- **URL Parameters:**
  - `id`: ID of the URL to delete.
- **Response:** Returns the result of the deletion operation.
- **Authentication:** Requires authentication (AuthGuard).

### Note:

- All endpoints except "Record Visit to Shortened URL" require authentication using the AuthGuard.
- Custom aliases for shortened URLs are subject to availability and certain restrictions.
- Expiration dates can be set for shortened URLs, after which they become inactive.
- Analytics data including visit counts and IP addresses are recorded for each shortened URL visit.

### Analytics Controller Endpoints

#### Retrieve Main Statistics

- **URL:** `/analytics/main-stats/:id`
- **Method:** `GET`
- **Description:** Retrieves main statistics for analytics data of the user identified by the provided `id`.
- **URL Parameters:**
  - `id`: The ID of the user for whom the analytics data is being retrieved.
- **Response:**
  - `uniqueVisitors`: The number of unique visitors in the last thirty days.
  - `visits`: The total number of visits in the last thirty days.
  - `topCountry`: The top country of visitors in the last thirty days.
  - `topReferrer`: The top referrer of visitors in the last thirty days.

#### Retrieve Top Devices

- **URL:** `/analytics/top-devices/:id`
- **Method:** `GET`
- **Description:** Retrieves the top devices used by visitors in the last thirty days for the user identified by the provided `id`.
- **URL Parameters:**
  - `id`: The ID of the user for whom the analytics data is being retrieved.
- **Response:** An array of objects containing the name of the device and the number of times it was used.

#### Retrieve Top Platforms

- **URL:** `/analytics/top-platforms/:id`
- **Method:** `GET`
- **Description:** Retrieves the top platforms used by visitors in the last thirty days for the user identified by the provided `id`.
- **URL Parameters:**
  - `id`: The ID of the user for whom the analytics data is being retrieved.
- **Response:** An array of objects containing the name of the platform and the number of times it was used.

#### Retrieve Top Referrers

- **URL:** `/analytics/top-referrers/:id`
- **Method:** `GET`
- **Description:** Retrieves the top referrers of visitors in the last thirty days for the user identified by the provided `id`.
- **URL Parameters:**
  - `id`: The ID of the user for whom the analytics data is being retrieved.
- **Response:** An array of objects containing the name of the referrer and the number of times it referred visitors.

#### Retrieve Top Countries

- **URL:** `/analytics/top-countries/:id`
- **Method:** `GET`
- **Description:** Retrieves the top countries of visitors in the last thirty days for the user identified by the provided `id`.
- **URL Parameters:**
  - `id`: The ID of the user for whom the analytics data is being retrieved.
- **Response:** An array of objects containing the name of the country and the number of visitors from that country.

#### Retrieve URL Analytics

- **URL:** `/analytics/url-analytics/:url`
- **Method:** `GET`
- **Description:** Retrieves analytics data for a given short URL.
- **URL Parameters:**
  - `url`: The short URL for which analytics data is requested.
- **Response:** An object containing various analytics data such as total visits, unique visitors, device usage, platform usage, referrer sources, browser usage, visits by country, more active days, and performance data for the last 7 days.

## Credits

Developed by [Alejandro Sandí](https://alejandrosandi.dev).
