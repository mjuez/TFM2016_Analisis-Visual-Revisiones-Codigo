import * as mocha from "mocha";
import * as chai from "chai";
import { IPullRequestEntity, PullRequestEntity } from "../../../src/app/entities/PullRequestEntity";
import { PullRequestDocument } from "../../../src/app/entities/documents/PullRequestDocument";

const expect: Chai.ExpectStatic = chai.expect;

describe("Checking Pull Request entities", () => {

    it("Should transform an object to a IPullRequestEntity", () => {
        let data: Object = new Object();
        let entity: IPullRequestEntity = PullRequestEntity.toEntity(data);
        return expect(entity).to.be.instanceof(PullRequestEntity);
    });

    it("The IPullRequestEntity document should contain the data of the source object", () => {
        let id: number = 1;
        let data: Object = {
            id: id
        };
        let entity: IPullRequestEntity = PullRequestEntity.toEntity(data);
        return expect(entity.document.id).to.be.equal(id);
    });

    it("Should transform an array of objects to a IPullRequestEntity array", () => {
        let data: Object[] = [new Object(), new Object()];
        let entityArray: IPullRequestEntity[] = PullRequestEntity.toPullRequestEntityArray(data);
        return expect(entityArray.length).to.be.equal(2);
    });

    it("Should get its id", () => {
        let document: PullRequestDocument = <PullRequestDocument>{ id: 1 }
        let entity: IPullRequestEntity = new PullRequestEntity(document);
        return expect(entity.id).to.be.equal(document.id);
    });

    it("Should get its entire document", () => {
        let document: PullRequestDocument = <PullRequestDocument>{ id: 1 }
        let entity: IPullRequestEntity = new PullRequestEntity(document);
        return expect(entity.document).to.be.equal(document);
    });

});