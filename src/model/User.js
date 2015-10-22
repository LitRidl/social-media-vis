export class User {
    constructor(values) {
        this.id = user_id;
        this.name = user_name;
        this.screen_name = user_screen_name;
        this.image_url = user_profile_url;
        this.location = user_location;

        this.description = user_description;
        this.profile_image_url = user_profile_image_url;
        this.avl_original_dt = user_avl_original_dt[0]; //todo fixme
        this.friends_count = user_friends_count;
        this.followers_count = user_followers_count;
        this.statuses_count = user_statuses_count;
        this.avl_friends_ids = user_avl_friends_ids[0]; //todo fixme
    }
}
