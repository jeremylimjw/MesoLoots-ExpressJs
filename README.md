# MesoLoots backend
Powered by ExpressJS and MongoDb.

## APIs
All routes are prefixed with `/api`. Example for page route would be `{domain-name}/api/page`.

## Page
### GET `/api/page?name=myloot`
Request
```
name: string (required)
```
Response
```
{
  id: string,
  name: string,
  private: boolean,
  createdAt: Date
}
OR
{}
```
### POST `/api/page`
Request
```
{
  name: string,
  private: boolean,
  password?: string
}
```
Response
```
{
  id: string,
  name: string,
  private: boolean,
  createdAt: Date
}
```


## Error Handling

### General error
```
{
  "statusCode": 500,
  "message": "column \"nam2e\" does not exist"
}
```

### Code 488 (Validation error)
```
{
  "statusCode": 488,
  "message": "Validation error(s)",
  "errors": [
    "name must be between 3 and 32 characters."
  ]
}
```