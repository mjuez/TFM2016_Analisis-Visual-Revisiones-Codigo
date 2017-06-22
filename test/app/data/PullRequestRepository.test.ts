import * as mocha from "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import * as mongoose from "mongoose";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { PullRequestDocument } from "../../../src/app/entities/documents/PullRequestDocument";
import { IPullRequestRepository, PullRequestRepository } from "../../../src/app/data/PullRequestRepository";
require("sinon-mongoose");

chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;
const should: Chai.Should = chai.should();

describe("Checking Pull Request repository", () => {

    let stubModel: mongoose.Model<PullRequestDocument>
        = mongoose.model<PullRequestDocument>("fakeCollection", new mongoose.Schema);
    let pullRequestEntity: IPullRequestEntity
        = new PullRequestEntity(<PullRequestDocument>{ id: 1 });
    sinon.mock(stubModel).expects('create').resolves(pullRequestEntity.document);
    sinon.mock(stubModel).expects('update').resolves({ nModified: 1 });
    sinon.mock(stubModel).expects('find')
        .chain('where')
        .chain('gt')
        .chain('sort')
        .chain('select')
        .resolves([pullRequestEntity.document]);
    let mock = sinon.mock(stubModel);
    mock.expects('findOne')
        .withArgs({ id: 1 })
        .resolves(pullRequestEntity.document);
    mock.expects('findOne')
        .withArgs({ id: 2 })
        .resolves(null);
    let pullRequestRepository: IPullRequestRepository
        = new PullRequestRepository(stubModel);

    it("Should return created (persisted) entity", async () => {
        const persisted: IPullRequestEntity = await pullRequestRepository.create(pullRequestEntity);
        return expect(persisted.id)
            .to.be.equal(pullRequestEntity.id);
    });

    it("Should get the mongoose Model", () => {
        return expect(pullRequestRepository.model)
            .to.be.equal(stubModel);
    });

    it("Should return the number of updated entities", () => {
        return expect(pullRequestRepository.update(pullRequestEntity))
            .to.eventually.be.equal(1);
    });


    it("Should return an array with all entities", async () => {
        let result: IPullRequestEntity[] = await pullRequestRepository.retrieve({});
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(pullRequestEntity.id);
    });


    it("Should return one pull request (found one)", async () => {
        const found: IPullRequestEntity = await pullRequestRepository.findById(1);
        return expect(found.id)
            .to.be.equal(pullRequestEntity.id);
    });

    it("Should return null for a pull request id that not exits", async () => {
        return expect(pullRequestRepository.findById(2))
            .to.eventually.be.null;
    });

});