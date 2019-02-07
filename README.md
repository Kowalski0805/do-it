# do-it
Test task: API implementation that uses GitHub and OpenWeatherMap API.

For convenience, a minimal UI with forms are provided.

## Installation
- `git clone https://github.com/Kowalski0805/do-it`;
- `cd do-it && npm i`;
- Setup PostgreSQL server;
- Edit `config.js` to match your settings;
- `npm start`.


## API routes
### `/api/sign-up`
Route to register a new user.

Parameters:
- `email`;
- `password`;
- `avatar`.

Note: "Sign up" form type has to be `multipart/form-data` to handle file upload correctly.

Response:
- `status`: HTTP status code.
- `error`: is `null` if `status: 200`, is `{ message: "Error message" }` otherwise;
- `data`: object containing the following response fields:
  - `token`: access token for `/api/email` route;
  - `avatar`: avatar URL;
  - `thumbnail`: thumbnail URL.



### `/api/sign-in`
Route to login by an existing user.
Parameters:
- `email`;
- `password`.

Response:
- `status`: HTTP status code.
- `error`: is `null` if `status: 200`, is `{ message: "Error message" }` otherwise;
- `data`: object containing the following response fields:
  - `session`: 
    - `token`: access token for `/api/email` route;
    - `expires`: token expiration time;
  - `user`:
    - `email`: user email;
    - `password`: encrypted password;
    - `avatar`: avatar URL;
    - `thumbnail`: thumbnail URL.



### `/api/email`
Route to send e-mails to GitHub users for a logged in user.
Parameters:
- `users`: comma-separated list of recipients;
- `text`: message to send;
- `token`: access token received from whether `/api/sign-up` or `/api/sign-in`.

Response:
- `status`: HTTP status code.
- `error`: is `null` if `status: 200`, is `{ message: "Error message" }` otherwise;
- `data`: array containing data about every sent email.
