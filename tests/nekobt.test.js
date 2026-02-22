import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import nekobt from "../ext/nekobt";

test("single episode", async () => {
    const dataPath = new URL("../data.json", import.meta.url);
    const data = JSON.parse(readFileSync(dataPath, "utf8"))
    const first = data[0]

    expect(first).toBeDefined()

    const res = await nekobt.single(first)
    console.log(res)
    expect(res).toBeDefined()
})

test("movie", async () => {
    const dataPath = new URL("../data.json", import.meta.url);
    const data = JSON.parse(readFileSync(dataPath, "utf8"))
    const second = data[1]

    expect(second).toBeDefined()

    const res = await nekobt.single(second)
    console.log(res)
    expect(res).toBeDefined()
})
