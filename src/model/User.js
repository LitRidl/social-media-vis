export class User {
    constructor(id, name='', screen_name='', profile_image_url='', description='', location='',
        avl_original_dt='1970-01-01', avl_friends_ids=[], friends_count=0, followers_count=0, statuses_count=0) {
        this.id = id;
        this.name = name;
        this.screen_name = screen_name;
        this.image_url = profile_image_url;
        this.description = description;

        this.location = location;

        this.avl_original_dt = avl_original_dt;
        this.avl_friends_ids = avl_friends_ids;

        this.friends_count = friends_count;
        this.followers_count = followers_count;
        this.statuses_count = statuses_count;
    }

    createHtml() {
        let res = `
        <div class="jstwitter">
        <div class="item">
        <div class="tweet-wrapper">
        <img class="avatar-img" src="${this.image_url}" height="200px">
        <div class="user">Идентификатор: ${this.id}</div>
        <div class="user">Имя: ${this.name}</div>
        <div class="user">Ник: ${this.screen_name}</div>
        <div>Место: ${this.location}</div>
        <div>Описание: ${this.description}</div>
        <div>Создан: <span class="time">${this.avl_original_dt}</span></div>
        <div>Читателей: ${this.followers_count}</div>
        <div>Подписан: ${this.friends_count}</div>
        <div>Число постов: ${this.statuses_count}</div>

        </div>
        </div>
        </div>`;
        return res;
    }

    static createFromJson({id_str, name='', screen_name='', profile_image_url='', description='', location='',
        avl_original_dt=['1970-01-01'], avl_friends_ids=[], friends_count=0, followers_count=0, statuses_count=0}) {
        return new User(id_str, name, screen_name, profile_image_url, description, location,
            avl_original_dt[0], avl_friends_ids, friends_count, followers_count, statuses_count)
    }
}
