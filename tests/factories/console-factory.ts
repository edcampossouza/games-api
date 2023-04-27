import prisma from "config/database";
import { faker } from "@faker-js/faker";
import { Console } from "@prisma/client";

export default async function createConsole(
  name: string = null
): Promise<Console> {
  if (!name) name = faker.name.fullName();
  return await prisma.console.create({ data: { name } });
}
