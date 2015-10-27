import {ObjectWrapperNode} from "./ObjectWrapperNode";
import {User} from "./User";

export class UserWrapperNode extends ObjectWrapperNode {
    constructor(user, userId, name, imageUrl, links, info) {
        super(user, userId, name, imageUrl, links, info);
    }

    static create(json) {
        const user = new User(json);
        return new UserWrapperNode(user, user.id, user.screen_name, user.image_url, user.avl_friends_ids, user.createHtml());
    }
}
