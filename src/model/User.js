export class User {
    constructor({id_str, name, screen_name, profile_image_url, description, location,
        avl_original_dt, avl_friends_ids, friends_count, followers_count, statuses_count}) {
        this.id = id_str;
        this.name = name;
        this.screen_name = screen_name;
        this.image_url = profile_image_url;
        this.description = description;

        this.location = location;

        this.avl_original_dt = avl_original_dt[0];
        this.avl_friends_ids = avl_friends_ids;

        this.friends_count = friends_count;
        this.followers_count = followers_count;
        this.statuses_count = statuses_count;
    }
}
