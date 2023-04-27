import supertest from "supertest";
import app from "app";
import httpStatus from "http-status";
import { cleanDb } from "./helpers";
import createConsole from "./factories/console-factory";
import createGame from "./factories/game-factory";
const server = supertest(app);

beforeAll(async () => {
  await cleanDb();
});
beforeEach(async () => {
  await cleanDb();
});

describe("POST /games", () => {
  it("should return 422 if schema is wrong ", async () => {
    const result = await server.post("/games").send({ wrongKey: "dmc" });
    expect(result.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });
  it("should return 409 for duplicated game name ", async () => {
    const ps5 = await createConsole("ps5");
    await createGame(ps5.id, "dmc");
    const result = await server
      .post("/games")
      .send({ title: "dmc", consoleId: ps5.id });
    expect(result.status).toBe(httpStatus.CONFLICT);
  });
  it("should return 201 for success ", async () => {
    const ps5 = await createConsole("ps5");
    const createResult = await server
      .post("/games")
      .send({ title: "dmc", consoleId: ps5.id });
    expect(createResult.status).toBe(httpStatus.CREATED);
  });
});

describe("GET /games", () => {
  it("should return 200 and empty array when there are no games ", async () => {
    const result = await server.get("/games");
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual([]);
  });
  it("should return 200 and array with created games ", async () => {
    const ps5 = await createConsole("ps5");
    await createGame(ps5.id, "dmc");
    await createGame(ps5.id, "gta");
    const result = await server.get("/games");
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toHaveLength(2);
    expect(result.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "dmc" }),
        expect.objectContaining({ title: "gta" }),
      ])
    );
  });
  it("should return 200 with created game ", async () => {
    const ps5 = await createConsole("ps5");
    const gta = await createGame(ps5.id, "gta");
    const result = await server.get(`/games/${gta.id}`);
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual(expect.objectContaining({ title: "gta" }));
  });
  it("should return 404 when id not found ", async () => {
    const ps5 = await createConsole("ps5");
    const gta = await createGame(ps5.id, "gta");
    const result = await server.get(`/games/${gta.id + 1}`);
    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });
});
