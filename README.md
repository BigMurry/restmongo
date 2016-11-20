# restmongo
RESTful API to get mongodb profile

## Usage
```javascript
import mongoRoute from 'restmongo'
import express from 'express'
const app = express()
mongoRoute(
  {
    url: 'mongodb://localhost:20717/test'
  }, app)
app.listen(8080)
```
## The route interface
`mongoRoute(options, app)`
- `options.url`  **required**, url used to connect the mongodb
- `app` **required**, passing an express app

## The REST API
- GET /performs/:year?**by**=month&**value**=12&**limit**=2
- returns

```javascript
response = [
  {
    _id: {
      year: 2016,
      month: 11,
      day: 12,
      week: 14
    },
    avgTime: 28.99998  
  }
] 
```

## LICENSE
MIT
