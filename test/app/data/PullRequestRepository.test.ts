import * as mocha from "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import * as Promise from "bluebird"
import * as mongoose from "mongoose";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { PullRequestDocument } from "../../../src/app/entities/documents/PullRequestDocument";
import { IPullRequestRepository, PullRequestRepository } from "../../../src/app/data/PullRequestRepository";

chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;
const should: Chai.Should = chai.should();

describe("Checking Pull Request repository", () => {

    let stubModel: mongoose.Model<PullRequestDocument>
        = mongoose.model<PullRequestDocument>("fakeCollection", new mongoose.Schema);
    let pullRequestEntity: IPullRequestEntity
        = new PullRequestEntity(<PullRequestDocument>{ id: 1 });
    sinon.stub(stubModel, "create").returns(Promise.resolve(pullRequestEntity));
    sinon.stub(stubModel, "update").yields(null, 1);
    sinon.stub(stubModel, "find").yields(null, [pullRequestEntity]);
    let stubFindOne = sinon.stub(stubModel, "findOne");
    stubFindOne.withArgs({ id: 1 }).yields(null, pullRequestEntity);
    stubFindOne.withArgs({ id: 2 }).yields(null, null);
    let pullRequestRepository: IPullRequestRepository
        = new PullRequestRepository(<mongoose.Model<PullRequestDocument>>stubModel);

    it("Should return created (persisted) entity", () => {
        return expect(pullRequestRepository.create(pullRequestEntity))
            .to.eventually.be.equal(pullRequestEntity);
    });

    it("Should get the mongoose Model", () => {
        return expect(pullRequestRepository.model)
            .to.be.equal(stubModel);
    });

    it("Should return the number of updated entities", () => {
        return expect(pullRequestRepository.update(pullRequestEntity))
            .to.eventually.be.equal(1);
    });

    it("Should return an array with all entities", (done) => {
        pullRequestRepository.retrieve().then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0]).to.be.equal(pullRequestEntity);
            done();
        });
    });

    /*it("Should return one pull request (found one)", () => {
        return expect(pullRequestRepository.findOneByPullId(1))
            .to.eventually.be.equal(pullRequestEntity);
    });

    it("Should return null for a pull request id that not exits", () => {
        return expect(pullRequestRepository.findOneByPullId(2))
            .to.eventually.be.null;
    });*/

});