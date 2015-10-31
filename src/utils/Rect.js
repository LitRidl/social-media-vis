export class Rect {
    constructor ({x1=Number.MAX_VALUE, y1=Number.MAX_VALUE, x2=Number.MIN_VALUE, y2=Number.MIN_VALUE}) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    update({x: newX, y: newY}) {
        if (newX < this.x1) { this.x1 = newX; }
        if (newX > this.x2) { this.x2 = newX; }
        if (newY < this.y1) { this.y1 = newY; }
        if (newY > this.y2) { this.y2 = newY; }
    }

    calculateCenter() {
        let centerX = this.x1 + (this.x2 - this.x1) /2;
        let centerY = this.y1 + (this.y2 - this.y1) /2;

        return {x: centerX, y: centerY};
    }
}
