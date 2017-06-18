/**
 * Filter for obtaining one pull request given
 * repository owner, repository name and 
 * pull request number.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface SinglePullRequestFilter {
    
    /** Repository owner login. */
    "base.repo.owner.login": string,

    /** Repository name. */
    "base.repo.name": string,

    /** Pull Request number. */
    number: number

}

/**
 * Filter for obtaining all pull requests
 * of a specific repository given its owner
 * and its name.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface RepositoryPullRequestFilter {
    
    /** Repository owner login. */
    "base.repo.owner.login": string,

    /** Repository name. */
    "base.repo.name": string
}

/**
 * Filter factory.
 * Builds different types of filters for pull request
 * retrieving.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class PullRequestFilterFactory {

    /**
     * Creates a filter for obtaining a single pull request.
     * 
     * @param filter    The filter values:
     *                      - owner -> repository owner login.
     *                      - repository -> repository name.
     *                      - number -> pull request number.
     * @returns a single pull request filter.
     */
    public static createSingle(filter: { owner: string, repository: string, number: number }): SinglePullRequestFilter {
        return {
            "base.repo.owner.login": filter.owner,
            "base.repo.name": filter.repository,
            number: filter.number
        };
    }

    /**
     * Creates a filter for obtaining all pull requests
     * from a specific repository.
     * 
     * @param filter    The filter values:
     *                      - owner -> repository owner login.
     *                      - repository -> repository name.
     * @returns a repository pull request filter.
     */
    public static createRepository(filter: { owner: string, repository: string }): RepositoryPullRequestFilter {
        return {
            "base.repo.owner.login": filter.owner,
            "base.repo.name": filter.repository
        };
    }
}