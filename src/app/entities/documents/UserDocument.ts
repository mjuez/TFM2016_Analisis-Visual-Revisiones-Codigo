import * as mongoose from "mongoose";

/**
 * User mongoose document.
 * Maps an User.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface UserDocument extends mongoose.Document {
    login: string,
    id: number,
    html_url: string,
    type: string,
    name: string,
    public_repos: number,
    public_gists: number,
    followers: number,
    following: number,
    created_at: Date,
    updated_at: Date
}