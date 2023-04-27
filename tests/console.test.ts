import supertest from "supertest";
import app from "app";
import httpStatus from "http-status";
import { cleanDb } from "./helpers";
import { Console } from "@prisma/client";
import createConsole from "./factories/console-factory";

const server = supertest(app);

beforeEach(async () => {
  await cleanDb();
});

describe("POST /consoles", () => {
  it("should return 422 if schema is wrong ", async () => {
    const result = await server.post("/consoles").send({ wrongKey: "ps5" });
    expect(result.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });
  it("should return 409 if for duplicated console name ", async () => {
    await createConsole("ps5");
    const result = await server.post("/consoles").send({ name: "ps5" });
    expect(result.status).toBe(httpStatus.CONFLICT);
  });
  it("should return 201 for success ", async () => {
    const createResult = await server.post("/consoles").send({ name: "ps5" });
    expect(createResult.status).toBe(httpStatus.CREATED);
  });
});

describe("GET /consoles", () => {
  it("should return 200 and empty array when there are no consoles ", async () => {
    const result = await server.get("/consoles");
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual([]);
  });
  it("should return 200 and array with created consoles ", async () => {
    await createConsole("ps5");
    await createConsole("xbox");
    const result = await server.get("/consoles");
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toHaveLength(2);
    expect(result.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "ps5" }),
        expect.objectContaining({ name: "xbox" }),
      ])
    );
  });
  it("should return 200 with created console ", async () => {
    const ps5 = await createConsole("ps5");
    const result = await server.get(`/consoles/${ps5.id}`);
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual(expect.objectContaining({ name: "ps5" }));
  });
  it("should return 404 when id not found ", async () => {
    const ps5 = await createConsole("ps5");
    const result = await server.get(`/consoles/${ps5.id + 1}`);
    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });
});
