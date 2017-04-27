import * as mocha from "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as GitHubAPI from "github";
import * as sinon from "sinon";
import * as Promise from "bluebird"
import * as mongoose from "mongoose";
import { IPullRequestService, PullRequestService } from "../../../src/app/services/PullRequestService";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { PullRequestDocument } from "../../../src/app/entities/documents/PullRequestDocument";
import { IPullRequestRepository, PullRequestRepository } from "../../../src/app/data/PullRequestRepository";

chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;
const should: Chai.Should = chai.should();

describe("Checking Pull Request repository", () => {

    let stubModel: any = <any>sinon.stub();
    let pullRequestEntity: IPullRequestEntity = new PullRequestEntity(<PullRequestDocument>{ id: 1 });
    sinon.stub(stubModel, "create").returns(Promise.resolve(pullRequestEntity));
    let pullRequestRepository: IPullRequestRepository =
        new PullRequestRepository(<mongoose.Model<PullRequestDocument>>stubModel);

    it("Should return created (persisted) entity", () => {
        return expect(pullRequestRepository.create(pullRequestEntity))
            .to.eventually.be.equal(pullRequestEntity);
    });

});