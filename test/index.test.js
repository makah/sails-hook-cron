const { assert } = require('chai');
const { Sails } = require('sails');

describe('sails-hook-cron', () => {
  let sails;

  before(function (done) {
    Sails().lift({
      cron: {
        firstJob: {
          schedule: '* * * * * 1',
          onTick: console.log
        },
        secondJob: {
          schedule: '* * * * * 1',
          onTick: console.log,
          onComplete: console.log,
          start: false,
          timezone: 'Europe/Kiev',
          context: undefined
        },
        contextJob: {
          schedule: '* * * * * *',
          runOnInit: true,
          onTick: function () { assert.equal(this.config.environment, 'development'); },
          onComplete: function () { assert.equal(this.config.environment, 'development'); }
        }
      },
      hooks: {
        cron: require('../src/index'),
        csrf: false,
        grunt: false,
        i18n: false,
        pubsub: false,
        session: false,
        views: false
      }
    }, (error, _sails) => {
      if (error) return done(error);
      sails = _sails;
      return done();
    });
  });

  after(function (done) {
    sails.lower(function (error) {
      if (error) return done(error);
      done();
    });
  });

  it('Should properly load cron hook', () => {
    assert.isObject(sails.config.cron);
    assert.isObject(sails.hooks.cron);
  });

  it('Should properly load cron tasks', () => {
    const firstJob = sails.hooks.cron.jobs.firstJob;
    const secondJob = sails.hooks.cron.jobs.secondJob;
    const contextJob = sails.hooks.cron.jobs.contextJob;

    assert.isUndefined(firstJob.onComplete);
    assert.equal(firstJob.cronTime.source, '* * * * * 1');
    assert.isUndefined(firstJob.cronTime.zone);
    assert.ok(firstJob.running);

    assert.isFunction(secondJob.onComplete);
    assert.equal(secondJob.cronTime.source, '* * * * * 1');
    assert.equal(secondJob.cronTime.zone, 'Europe/Kiev');
    assert.notOk(secondJob.running);

    assert.equal(contextJob.cronTime.source, '* * * * * *');
  });
});
