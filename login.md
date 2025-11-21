post /auth/login
request body:
{
  "email": "dat@gmail.com",
  "password": "123"
}
response:
 "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJncm91cDMuY29tIiwicm9sZU5hbWUiOiJOaMOibiB2acOqbiBj4butYSBow6BuZyIsInN1YiI6ImRhdEBnbWFpbC5jb20iLCJleHAiOjE3NjM3MTI4NTIsImlhdCI6MTc2MzcxMTA1MiwianRpIjoiZmIyNGNkNGUtNWJkMi00ZjkzLWI3NmEtNTI3ODk0NmYxNzFhIn0.pwi3X1OssQmc_08YfHxgE3CQwmktIIJzm7NcM0J6PWgq5g9Tin9lUtqMgeSKJLZ0P6wavRLAhjuRHEFZbRT7lQ",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJncm91cDMuY29tIiwiZXhwIjoxNzY0MzE1ODUyLCJpYXQiOjE3NjM3MTEwNTIsInVzZXJJZCI6MywianRpIjoiN2Y4NDY5NmUtNDQyNS00ZGIyLTg4YjAtOTk1NGEwZjFhNDcyIn0.pYA9x7yYPX5AVEZtse2m-I4nF9qWk8rH_oDQaqj0h5yOKXNmclQ6ddxf3gx6R2so81TUtBWtnS72EMOlEDg3JA",
    "accessTokenExpiry": 1763712852728,
    "refreshTokenExpiry": 1764315852740,
    "requirePasswordChange": false,
    "status": "ACTIVE"
  }
 post /auth/refresh
 request body:
{
  "refreshToken": "streyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJncm91cDMuY29tIiwiZXhwIjoxNzY0MzE1ODUyLCJpYXQiOjE3NjM3MTEwNTIsInVzZXJJZCI6MywianRpIjoiN2Y4NDY5NmUtNDQyNS00ZGIyLTg4YjAtOTk1NGEwZjFhNDcyIn0.pYA9x7yYPX5AVEZtse2m-I4nF9qWk8rH_oDQaqj0h5yOKXNmclQ6ddxf3gx6R2so81TUtBWtnS72EMOlEDg3JAng"
}
response:
"data": {
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJncm91cDMuY29tIiwicm9sZU5hbWUiOiJOaMOibiB2acOqbiBj4butYSBow6BuZyIsInN1YiI6ImRhdEBnbWFpbC5jb20iLCJleHAiOjE3NjM3MTQ1MzQsImlhdCI6MTc2MzcxMjczNCwianRpIjoiYjAzMmFhMGEtMmRjMi00MmU5LTkyOTUtNDc0ZmE1ZmMyY2VmIn0.3hhe2e1INzz_LRwVlC3eWh-p3YFjGi5V2ZB26a0qXpn2nbXNvRxmfTy6tu7bztTSBD09syvzfHAVdoyJmDtiZw",
    "expiryDate": "2025-11-21 15:42:14"
  }