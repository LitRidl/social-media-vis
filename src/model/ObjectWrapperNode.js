export class ObjectWrapperNode {
    constructor(originalObject, id, name, imageUrl, links, info) {
        this.originalObject = originalObject;
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.links = links;
        this.info = info;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getImageUrl() {
        return this.imageUrl;
    }

    getLinks() {
        return this.links;
    }

    getSizeMeasure() {
        return this.originalObject.followers_count;
    }

    getInfo() {
        return this.info;
    }
}




