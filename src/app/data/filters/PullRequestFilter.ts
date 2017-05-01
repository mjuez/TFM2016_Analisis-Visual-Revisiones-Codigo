export interface SinglePullRequestFilter {
    "base.repo.owner.login": string,
    "base.repo.name": string,
    number: number
}

export interface RepositoryPullRequestFilter {
    "base.repo.owner.login": string,
    "base.repo.name": string
}

export class PullRequestFilterFactory {
    public static createSingle(filter: { owner: string, repository: string, number: number }): SinglePullRequestFilter {
        return {
            "base.repo.owner.login": filter.owner,
            "base.repo.name": filter.repository,
            number: filter.number
        }
    }

    public static createRepository(filter: { owner: string, repository: string}): RepositoryPullRequestFilter {
        return {
            "base.repo.owner.login": filter.owner,
            "base.repo.name": filter.repository
        }
    }
}