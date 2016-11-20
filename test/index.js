import {assert} from 'chai'
import request from 'request'
import route from '..'
import express from 'express'
import {MongoClient} from 'mongodb'
import co from 'co'
import 'babel-polyfill'

const api = (year, by, value, limit) => {
  const API = 'http://localhost:8080/performs'
  year = year ? `/${year}` : ''
  by = by ? `?by=${by}` : ''
  value = by && value ? `&value=${value}` : ''
  limit = limit
  ? (by ? `&limit=${limit}` : `?limit=${limit}`)
  : ''
  return `${API}${year}${by}${value}${limit}`
}

const sEqual = assert.strictEqual

describe('api builder', () => {
  it('api() => /performs', () => {
    sEqual(api(), 'http://localhost:8080/performs')
  })
  it('api(year) => /performs/[year]', () => {
    sEqual(api(2015), 'http://localhost:8080/performs/2015')
  })
  it('api(year, by) => /performs/[year]?by=[by]', () => {
    sEqual(api(2015, 'month'), 'http://localhost:8080/performs/2015?by=month')
  })
  it('api(year, by, value) => /performs/[year]?by=[by]&value=[value]', () => {
    sEqual(api(2015, 'month', 12), 'http://localhost:8080/performs/2015?by=month&value=12')
  })
  it('api(year, by, value, limit) => /performs/[year]?by=[by]&value=[value]&limit=[limit]', () => {
    sEqual(api(2015, 'month', 12, 2), 'http://localhost:8080/performs/2015?by=month&value=12&limit=2')
  })
})

describe('route options', () => {
  it('no options should throw', () => {
    assert.throws(() => {
      route({a: 1}, {c: 2})
    })
  })
})

describe('GET /performs', () => {
  const url = 'mongodb://localhost:27017/my'
  const collection = 'users'
  before((done) => {
    const options = {url}
    co(function * () {
      const db = yield MongoClient.connect(url)
      yield db.command({profile: 2})
      const users = db.collection(collection)
      const result = yield users.insertMany([{name: 1}, {name: 2}])
      assert.equal(result.ops.length, 2)
      const app = express()
      route(options, app)
      app.listen(8080, () => {
        done()
      })
      db.close()
    })
  })

  after((done) => {
    co(function * () {
      const db = yield MongoClient.connect(url)
      yield db.command({profile: 0})
      yield db.collection(collection).drop()
      db.close()
      done()
    })
  })
  it('default year', (done) => {
    request
      .get(api(), (error, response, body) => {
        assert.isNotTrue(!!error)
        assert.isTrue(response.statusCode === 200)
        const data = JSON.parse(body)
        assert.isArray(data)
        assert.isTrue(data.length > 0)
        done()
      })
      .on('error', (error) => {
        assert.isNotTrue(!!error, 'should NOT have error')
        done()
      })
  })
  it('GET /performs/[year]', (done) => {
    request
      .get(api(2016), (error, response, body) => {
        assert.isNotTrue(!!error)
        assert.isTrue(!!response)
        assert.isTrue(response.statusCode === 200)
        const data = JSON.parse(body)
        assert.isArray(data)
        assert.isTrue(data.length > 0)
        assert.property(data[0], '_id')
        assert.property(data[0], 'avgTime')
        sEqual(data[0]._id.year, 2016)
        done()
      })
      .on('error', (error) => {
        assert.isNotTrue(!!error, 'should NOT have error')
        done()
      })
  })
})
