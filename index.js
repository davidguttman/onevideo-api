var request = require('request')
var AsyncCache = require('async-cache')
var jar = request.jar()

var loginCache = new AsyncCache({
  maxAge: 1000 * 60 * 60,
  load: function (key, cb) {
    var creds = JSON.parse(key)
    login(creds, cb)
  }
})

var urlBase = 'https://onevideo.aol.com/'

module.exports = function (creds, date, cb) {
  loginWithCache(creds, function (err, orgId) {
    if (err) return cb(err)

    getDateRevenue(orgId, date, cb)
  })
}

function loginWithCache (creds, cb) {
  var key = JSON.stringify(creds)
  loginCache.get(key, cb)
}

function login (creds, cb) {
  var urlLogin = urlBase + 'sessions/login'

  var opts = {
    url: urlLogin,
    method: 'GET',
    jar: jar,
    json: true,
    qs: {
      un: creds.username,
      pw: creds.password,
      s: 1
    }
  }

  request(opts, function (err, res, body) {
    if (err) return cb(err)
    if (res.statusCode >= 400) {
      return cb(new Error(['statusCode', res.statusCode, opts.url].join(' ')))
    }

    var orgId = (body || {}).org_id
    if (!orgId) return cb(new Error('Could not get org_id'))
    cb(null, orgId)
  })
}

function getDateRevenue (orgId, date, cb) {
  var urlRev = urlBase + 'reporting/run_report'

  var dateValue = Math.round(new Date(date).valueOf() / 1000)

  var opts = {
    method: 'GET',
    url: urlRev,
    jar: jar,
    json: true,
    qs: {
      org_id: orgId,
      keys: ['date', 'inventory_source'].join(','),
      metrics: getMetrics().join(','),
      start_date: dateValue,
      end_date: dateValue,
      timezone: 1,
      currency_id: 150
    }
  }

  request(opts, function (err, res, body) {
    if (err) return cb(err)
    if (res.statusCode >= 400) {
      return cb(new Error(['statusCode', res.statusCode, opts.url].join(' ')))
    }

    var columns = body.columns
    var data = body.data

    if (!columns || !data) return cb(new Error('Error running report'))

    var rows = []
    data.forEach(function (item) {
      var row = {}
      item.row.forEach(function (val, i) {
        var col = columns[i]
        row[col] = val
      })
      rows.push(row)
    })

    cb(null, rows)
  })
}

function getMetrics () {
  return ['100_completed_view_rate', '100_completed_views',
    '25_completed_views_rate', '25_completed_views', '50_completed_views_rate',
    '50_completed_views', '75_completed_views_rate', '75_completed_views',
    'ad_impressions', 'ad_revenue', 'ad_skips', 'ad_attempts', 'ad_errors',
    'ad_opportunities', 'cdn_cost', 'ctr', 'clicks',
    'companion_ad_ctr', 'companion_ad_clicks', 'companion_ad_impressions',
    'error_rate', 'fill_rate', 'iab_viewability_measured_rate',
    'iab_non_viewable_impressions',
    'iab_non_viewable_impressions_distribution',
    'iab_undetermined_impressions_distribution',
    'iab_viewability_failed_to_detect_impressions',
    'iab_viewability_measurable_impressions',
    'iab_viewability_undetermined_impressions',
    'iab_viewability_unknown_impressions', 'iab_viewable_impressions',
    'iab_viewable_impressions_distribution', 'iab_viewability_viewable_rate',
    'prefilled_ad_opportunities', 'success_rate', 'total_clicks', 'cpm']
}
