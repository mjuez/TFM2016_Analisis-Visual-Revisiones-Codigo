import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/App';

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET api/gerrit/r/android-review.googlesource.com/c/342615/', () => {

  it('should be json', () => {
    return chai.request(app).get('/api/gerrit/r/android-review.googlesource.com/c/342615')
    .then(res => {
      expect(res.type).to.eql('application/json');
    });
  });

  it('should return change information', () => {
    return chai.request(app).get('/api/gerrit/r/android-review.googlesource.com/c/342615')
    .then(res => {
      expect(res.body.status).to.eql('MERGED');
      expect(res.body.insertions).to.eql(24);
      expect(res.body.deletions).to.eql(13);
    });
  });

});