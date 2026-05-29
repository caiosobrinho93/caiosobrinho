const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if(!user) return;
  await prisma.devComponent.create({
    data: {
      title: 'button-menu',
      category: 'UI',
      isFavorite: false,
      htmlCode: `<button class="button-menu">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
  <span>Menu</span>
</button>`,
      cssCode: `.button-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto;
  padding: 0 16px;
  height: 38px;
  border-radius: 12px;
  background-color: rgba(26, 27, 38, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.button-menu:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.button-menu.active {
  background-color: var(--primary-color, #c5fe00);
  color: #000;
  border-color: var(--primary-color, #c5fe00);
}`,
      jsCode: '',
      userId: user.id
    }
  });
  console.log('Created button-menu');
}

main().catch(console.error).finally(() => prisma.$disconnect());
