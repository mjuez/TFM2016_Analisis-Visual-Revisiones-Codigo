import { GitHubTask } from "./GitHubTask";
import { IUserEntity, UserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import * as GitHubAPI from "github";

interface Repositories {
    task: ITaskRepository,
    user: IUserRepository
}

export abstract class AbstractUserTask extends GitHubTask {

    private readonly _repositories: Repositories;
    
    protected readonly _userService: IUserService;

    constructor(entity: ITaskEntity, repositories: Repositories, userService: IUserService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(entity, repositories.task, api, apiAuth);
        this._userService = userService;
        this._repositories = repositories;
    }

    protected async processUser(username: string): Promise<void> {
        try {
            let userRepo: IUserRepository = this._repositories.user;
            let foundUser: IUserEntity = await userRepo.findOne({
                login: username,
                updated_on_task: this.entity.parentTask.document._id
            });
            if (foundUser === null) {
                let user: IUserEntity = await this.makeApiCall(username);
                user.document.updated_on_task = this.entity.parentTask.document._id;
                this._userService.createOrUpdate(user);
            }
            await this.updateStats(username);
        } catch (error) {
            throw error;
        }
    }

    protected async makeApiCall(username: string): Promise<IUserEntity> {
        try {
            let userData: any = await this.API.users.getForUser(<GitHubAPI.Username>{ username });
            return UserEntity.toEntity(userData.data);
        } catch (error) {
            this.emit("api:error", error);
            throw error;
        }
    }

    protected abstract async updateStats(username: string): Promise<void>;

}