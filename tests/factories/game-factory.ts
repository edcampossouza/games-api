import prisma from "config/database";
import { faker } from "@faker-js/faker";
import { Game } from "@prisma/client";

export default async function createGame(
  consoleId: number,
  title: string = null
): Promise<Game> {
  if (!title) title = faker.name.fullName();
  return await prisma.game.create({ data: { title, consoleId } });
}
