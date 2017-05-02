import * as mocha from "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as GitHubAPI from "github";
import * as sinon from "sinon";
import * as Promise from "bluebird"
import { IPullRequestService, PullRequestService } from "../../../src/app/services/PullRequestService";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { PullRequestDocument } from "../../../src/app/entities/documents/PullRequestDocument";
import { IPullRequestRepository, PullRequestRepository } from "../../../src/app/data/PullRequestRepository";

chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;
const should: Chai.Should = chai.should();

describe("Checking Pull Request services", () => {

    let stubApi;
    let stubRepo;
    let service;
    let findOneByPullIdStub;
    let fakePullRequestEntity1: IPullRequestEntity;
    let fakePullRequestEntity2: IPullRequestEntity;
    let fakePullRequestEntity3: IPullRequestEntity;

    beforeEach(() => {
        stubApi = sinon.createStubInstance(GitHubAPI);
        stubRepo = sinon.createStubInstance(PullRequestRepository);
        service = new PullRequestService(stubRepo, stubApi);
        stubApi.pullRequests = sinon.stub();
        fakePullRequestEntity1 = new PullRequestEntity(<PullRequestDocument>{ id: 1 });
        fakePullRequestEntity2 = new PullRequestEntity(<PullRequestDocument>{ id: 2 });
        fakePullRequestEntity3 = new PullRequestEntity(<PullRequestDocument>{ id: 3 });
        let createPromise = Promise.resolve(fakePullRequestEntity1);
        stubRepo.create.returns(createPromise);
        let updatePromise = Promise.resolve(1);
        stubRepo.update.returns(updatePromise);
    });

    it("Should obtain a remote Pull Request entity", () => {
        let getPullRequestStub = sinon.stub(stubApi.pullRequests, "get");
        let id = 1;
        let autoresolvePromise = new Promise<Object>((resolve, reject) => {
            let fakeResult = {
                data: {
                    id: id
                }
            };
            resolve(fakeResult);
        });
        getPullRequestStub.returns(autoresolvePromise);
        return expect(service.getRemotePullRequest("owner", "repository", id))
            .to.eventually.be.instanceof(PullRequestEntity);
    });

    it("Should be rejected if no requests remaining to GitHub API", () => {
        let getPullRequestStub = sinon.stub(stubApi.pullRequests, "get");
        let autorejectPromise = Promise.reject();
        getPullRequestStub.returns(autorejectPromise);
        return expect(service.getRemotePullRequest("owner", "repository", 1))
            .to.eventually.be.rejected;
    });

    it("Should create pull request into database", (done) => {
        let notFoundPromise = Promise.resolve(null);
        stubRepo.findOneByPullId.onCall(0).returns(notFoundPromise);
        expect(service.createOrUpdate(fakePullRequestEntity1))
            .to.eventually.be.instanceof(PullRequestEntity)
            .then(() => {
                expect(stubRepo.create.called).to.be.true;
                done();
            });
    });

    it("Should update pull request into database", (done) => {
        let foundPromise = Promise.resolve(fakePullRequestEntity1);
        stubRepo.findOneByPullId.onCall(0).returns(foundPromise);
        service.createOrUpdate(fakePullRequestEntity1)
            .then(() => {
                expect(stubRepo.update.called).to.be.true;
                done();
            });
    });

    it("Should create or update many pull requests", (done) => {
        let foundPromise1 = Promise.resolve(fakePullRequestEntity1);
        stubRepo.findOneByPullId.onCall(0).returns(foundPromise1);
        let foundPromise2 = Promise.resolve(fakePullRequestEntity2);
        stubRepo.findOneByPullId.onCall(1).returns(foundPromise2);
        let foundPromise3 = Promise.resolve(fakePullRequestEntity3);
        stubRepo.findOneByPullId.onCall(2).returns(foundPromise3);
        let pullRequestsArray: IPullRequestEntity[]
            = [fakePullRequestEntity1, fakePullRequestEntity2, fakePullRequestEntity3];
        service.createOrUpdateMultiple(pullRequestsArray).then((result) => {
            expect(result.length).to.be.equal(pullRequestsArray.length);
            done();
        });
    });

});