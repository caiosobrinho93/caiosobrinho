const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany();
  if (users.length === 0) {
    console.log("No users found");
    return;
  }
  const userId = users[0].id;

  const dataStr = fs.readFileSync("particulas.json", "utf8");
  const dataObj = JSON.parse(dataStr);

  await db.devComponent.create({
    data: {
      ...dataObj,
      userId: userId,
    }
  });

  console.log("Component inserted successfully");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await db.$disconnect());
