import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import HelloWorldServer from '../src/HelloWorldServer';

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET HelloWorld', () => {

  let app = new HelloWorldServer();

  it('should be status 200', () => {
    return chai.request(app.getServer()).get('')
    .then(res => {
      expect(res.status).to.eql(200);
    });
  });

  it('should be json', () => {
    return chai.request(app.getServer()).get('')
    .then(res => {
      expect(res.type).to.eql('application/json');
    });
  });

  it('should be hello world message', () => {
    return chai.request(app.getServer()).get('')
    .then(res => {
      expect(res.body).to.eql({"message":"Hello World!"});
    });
  });

});