const Datastore = require('@seald-io/nedb');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const db = {
  surveys:  new Datastore({ filename: path.join(dataDir, 'surveys.db'),   autoload: true }),
  responses: new Datastore({ filename: path.join(dataDir, 'responses.db'), autoload: true }),
  admins:   new Datastore({ filename: path.join(dataDir, 'admins.db'),    autoload: true }),
  ads:      new Datastore({ filename: path.join(dataDir, 'ads.db'),       autoload: true }),
};

// Create indexes
db.surveys.ensureIndexAsync({ fieldName: 'slug', unique: true }).catch(() => {});
db.admins.ensureIndexAsync({ fieldName: 'username', unique: true }).catch(() => {});
db.responses.ensureIndexAsync({ fieldName: 'surveyId' }).catch(() => {});

module.exports = db;
