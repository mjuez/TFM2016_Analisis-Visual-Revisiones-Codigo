import * as mocha from "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as GitHubAPI from "@octokit/rest";
import * as sinon from "sinon";
import * as Promise from "bluebird";
import { IPullRequestService, PullRequestService } from "../../../src/app/services/PullRequestService";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { PullRequestDocument } from "../../../src/app/entities/documents/PullRequestDocument";
import { IPullRequestRepository, PullRequestRepository } from "../../../src/app/data/PullRequestRepository";

chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;
const should: Chai.Should = chai.should();

describe("Checking Pull Request services", () => {

    let stubRepo: any;
    let service: any;
    let findOneByPullIdStub: any;
    let fakePullRequestEntity1: IPullRequestEntity;
    let fakePullRequestEntity2: IPullRequestEntity;
    let fakePullRequestEntity3: IPullRequestEntity;

    beforeEach(() => {
        stubRepo = sinon.createStubInstance(PullRequestRepository);
        service = new PullRequestService(stubRepo);
        fakePullRequestEntity1 = new PullRequestEntity(<PullRequestDocument>{ id: 1 });
        fakePullRequestEntity2 = new PullRequestEntity(<PullRequestDocument>{ id: 2 });
        fakePullRequestEntity3 = new PullRequestEntity(<PullRequestDocument>{ id: 3 });
        let createPromise: any = Promise.resolve(fakePullRequestEntity1);
        stubRepo.create.returns(createPromise);
        let updatePromise: any = Promise.resolve(1);
        stubRepo.update.returns(updatePromise);
    });

    it("Should create pull request into database", (done) => {
        let notFoundPromise: any = Promise.resolve(null);
        stubRepo.findById.onCall(0).returns(notFoundPromise);
        expect(service.createOrUpdate(fakePullRequestEntity1))
            .to.eventually.be.instanceof(PullRequestEntity)
            .then(() => {
                expect(stubRepo.create.called).to.be.true;
                done();
            });
    });

    it("Should update pull request into database", (done) => {
        let foundPromise: any = Promise.resolve(fakePullRequestEntity1);
        stubRepo.findById.onCall(0).returns(foundPromise);
        service.createOrUpdate(fakePullRequestEntity1)
            .then(() => {
                expect(stubRepo.update.called).to.be.true;
                done();
            });
    });

    it("Should create or update many pull requests", (done) => {
        let foundPromise1: any = Promise.resolve(fakePullRequestEntity1);
        stubRepo.findById.onCall(0).returns(foundPromise1);
        let foundPromise2: any = Promise.resolve(fakePullRequestEntity2);
        stubRepo.findById.onCall(1).returns(foundPromise2);
        let foundPromise3: any = Promise.resolve(fakePullRequestEntity3);
        stubRepo.findById.onCall(2).returns(foundPromise3);
        let pullRequestsArray: IPullRequestEntity[]
            = [fakePullRequestEntity1, fakePullRequestEntity2, fakePullRequestEntity3];
        service.createOrUpdateMultiple(pullRequestsArray).then((result) => {
            expect(result.length).to.be.equal(pullRequestsArray.length);
            done();
        });
    });

});