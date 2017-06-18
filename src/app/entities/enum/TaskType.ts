/**
 * Task type enumeration.
 * Enumerates all tasks types.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export enum TaskType {
    
    /** The main task. For obtaining everything. */
    ALL,

    /** For obtaining full pull requests. */
    PULL_REQUESTS,

    /** For obtaining reviews. */
    REVIEWS,

    /** For obtaining review comments. */
    REVIEW_COMMENTS,

    /** For obtaining users from pull requests. */
    USERS_PULLS,

    /** For obtaining users from reviews. */
    USERS_REVIEWS,

    /** For obtaining users from review comments. */
    USERS_REVIEW_COMMENTS,

    /** For obtaining a repository. */
    REPOSITORY
}