export interface SinglePullRequestFilter {
    "base.repo.owner.login": string,
    "base.repo.name": string,
    number: number
}

export interface RepositoryPullRequestFilter {
    "base.repo.owner.login": string,
    "base.repo.name": string
}

export interface BetweenDatesPullRequestFilter {
    "base.repo.owner.login": string,
    "base.repo.name": string,
    $and: [
        { created_at: { $gte: Date } },
        { created_at: { $lte: Date } }
    ]
}

export class PullRequestFilterFactory {
    public static createSingle(filter: { owner: string, repository: string, number: number }): SinglePullRequestFilter {
        return {
            "base.repo.owner.login": filter.owner,
            "base.repo.name": filter.repository,
            number: filter.number
        }
    }

    public static createRepository(filter: { owner: string, repository: string }): RepositoryPullRequestFilter {
        return {
            "base.repo.owner.login": filter.owner,
            "base.repo.name": filter.repository
        }
    }

    public static createBetweenDates(filter: { owner: string, repository: string, startDate: Date, endDate: Date }): BetweenDatesPullRequestFilter {
        return {
            "base.repo.owner.login": filter.owner,
            "base.repo.name": filter.repository,
            $and: [
                { created_at: { $gte: filter.startDate } },
                { created_at: { $lte: filter.endDate } }
            ]
        }
    }
}