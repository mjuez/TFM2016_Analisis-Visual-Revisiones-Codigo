import * as mocha from "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as GitHubAPI from "github";
import * as sinon from "sinon";
import * as Promise from "bluebird"
import { IPullRequestService, PullRequestService } from "../../../src/app/services/PullRequestService";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { IPullRequestRepository, PullRequestRepository } from "../../../src/app/data/PullRequestRepository";

chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;
const should: Chai.Should = chai.should();

describe("Checking Pull Request services", () => {

    let stubApi: GitHubAPI = sinon.createStubInstance(GitHubAPI);
    let stubRepo: IPullRequestRepository = sinon.createStubInstance(PullRequestRepository);
    let service: IPullRequestService = new PullRequestService(stubRepo, stubApi);
    let sandbox = sinon.sandbox.create();

    beforeEach(() => {
        stubApi.pullRequests = sinon.stub();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Should transform an object to a IPullRequestEntity", () => {
        let data: Object = new Object();
        let entity: IPullRequestEntity = service.toEntity(data);
        expect(entity).to.be.instanceof(PullRequestEntity);
    });

    it("The IPullRequestEntity document should contain the data of the source object", () => {
        let id: number = 1;
        let data: Object = {
            id: id
        };
        let entity: IPullRequestEntity = service.toEntity(data);
        expect(entity.document.id).to.be.equal(id);
    });

    it("Should transform an array of objects to a IPullRequestEntity array", () => {
        let data: Object[] = [new Object(), new Object()];
        let entityArray: IPullRequestEntity[] = service.toEntityArray(data);
        expect(entityArray.length).to.be.equal(2);
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

});