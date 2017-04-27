import * as mocha from "mocha";
import * as chai from "chai";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { PullRequestDocument } from "../../../src/app/entities/documents/PullRequestDocument";

const expect: Chai.ExpectStatic = chai.expect;

describe("Checking Pull Request entities", () => {

    it("Should get its id", () => {
        let document: PullRequestDocument = <PullRequestDocument>{id: 1}
        let entity: IPullRequestEntity = new PullRequestEntity(document);
        return expect(entity.id).to.be.equal(document.id);
    });

    it("Should get its entire document", () => {
        let document: PullRequestDocument = <PullRequestDocument>{id: 1}
        let entity: IPullRequestEntity = new PullRequestEntity(document);
        return expect(entity.document).to.be.equal(document);
    });

});