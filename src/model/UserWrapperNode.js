import {ObjectWrapperNode} from "./ObjectWrapperNode";
import {User} from "./User";

export class UserWrapperNode extends ObjectWrapperNode {
    constructor(user, userId, name, imageUrl, links, info) {
        super(user, userId, name, imageUrl, links, info);
    }

    setPlaceholder(placeholder) {
        this.placeholder = true;
    }

    isPlaceholder() {
        return this.placeholder;
    }

    static createFromJson(json) {
        const user = User.createFromJson(json);
        return new UserWrapperNode(user, user.id, user.screen_name, user.image_url, user.avl_friends_ids, user.createHtml());
    }

    static createUserPlaceholder(id) {
        const user = new User(id);
        return new UserWrapperNode(user, user.id, user.id, 'images/no_image.png', [], 'Не загружен.');
    }
}
