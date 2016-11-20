import {MongoClient} from 'mongodb'
const debug = require('debug')('restmongo')

function getPerforms (options, callback) {
  MongoClient.connect(options.url, (error, db) => {
    if (error) callback(error)
    const aggreCond = filter(options)
    debug(`aggregate condition: ${JSON.stringify(aggreCond, null, 2)}`)
    const profile = db.collection('system.profile')
    profile.aggregate(
      [
        {
          $project: {
            year: {$year: '$ts'},
            month: {$month: '$ts'},
            day: {$dayOfMonth: '$ts'},
            week: {$week: '$ts'},
            ts: '$ts',
            millis: '$millis'
          }
        },
        {
          $match: aggreCond.filter
        },
        {
          $group: {_id: aggreCond.group, avgTime: {$avg: '$millis'}}
        }
      ]).toArray((error, result) => {
        callback(error, result)
        db.close()
      })
  })
}
function filter (options) {
  const year = parseInt(options.year, 10)
  const value = parseInt(options.value, 10)

  function byDay () {
    const d = value.split(/[-, ]/).map((item, index) => parseInt(item, 10))
    return {year, month: d[0], day: d[1]}
  }
  switch (options.by) {
    case 'month':
      return {
        filter: {year, month: value},
        group: {year: {$year: '$ts'}, month: {$month: '$ts'}}
      }
    case 'week':
      return {
        filter: {year, week: value},
        group: {year: {$year: '$ts'}, week: {$week: '$ts'}}
      }
    case 'day':
      return {
        filter: byDay(),
        group: {year: {$year: '$ts'}, month: {$month: '$ts'}, day: {$dayOfMonth: '$ts'}}
      }
    default:
      return {
        filter: {year},
        group: {year: {$year: '$ts'}}
      }
  }
}

export default function route (options, app) {
  if (!options || !options.url) {
    throw new Error('options.url must be set')
  }
  app.get('/performs/:year?', (req, res, next) => {
    const opt = Object.assign({}, {
      year: req.params.year || new Date().getFullYear(),
      by: req.query.by,
      value: req.query.value,
      limit: req.query.limit
    }, options)
    debug(`passed options: ${JSON.stringify(opt, null, 2)}`)
    getPerforms(opt, (error, data) => {
      if (error) {
        res.status(500).json(error)
      }
      debug(`returned data: length: ${data.length}; data: ${JSON.stringify(data, null, 2)}`)
      res.status(200).json(data)
    })
  })
}
