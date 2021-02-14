const { default: Clone } = require("./Clone");
const getCloneObject = require("./Clone");

test("Returns a Clone object", () => {
    const clone = new Clone({ x: 30, y: 20 });
    expect(clone).toMatchObject({
        x: 30,
        y: 20,
        gunner: false,
        spy: false,
    });
});

test("moves a clone from (30, 20) to (30, 19)", () => {
    const clone = new Clone({ x: 30, y: 20 });
    clone.move(G, ctx, { x: 30, y: 19 });
    expect(clone).toMatchObject({
        x: 30,
        y: 19,
        gunner: false,
        spy: false,
    });
});