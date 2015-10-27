import {ObjectWrapperNode} from "./ObjectWrapperNode";

export class UserWrapperNode extends ObjectWrapperNode {
    constructor(user, userId, name, imageUrl, links, info) {
        super(user, userId, name, imageUrl, links, info);
    }

    static create(user) {
        return new UserWrapperNode(user, user.id_str, user.screen_name, user.profile_image_url, user.avl_friends_ids, '');
    }
}
