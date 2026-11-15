
const { test, expect } = require('@playwright/test');

test('HIVE-87 - Parent creates task, child completes it', async ({ browser }) => {
  const parentContext = await browser.newContext();
  const childContext = await browser.newContext();

  const parentPage = await parentContext.newPage();
  const childPage = await childContext.newPage();

  const taskTitle = `E2E Reading Task ${Date.now()}`;

  try {
    // 1. Parent logs in
    await parentPage.goto('/');

    await parentPage.getByLabel('Email').fill('parent@hive.test');
    await parentPage.getByLabel('Password').fill('Hive2026!');
    await parentPage.getByRole('button', { name: 'Log in' }).click();

    // 2. Parent creates a task
    await expect(
      parentPage.getByRole('heading', { name: 'Create Task' }).first()
    ).toBeVisible();

    const taskForm = parentPage.locator('form').filter({
      has: parentPage.getByRole('button', { name: 'Create Task' })
    }).first();

    await taskForm.getByLabel('Title *').fill(taskTitle);
    await taskForm.getByLabel('Description').fill('Read for 20 minutes');

    await taskForm.getByRole('button', { name: 'Create Task' }).click();

    await expect(
      parentPage.getByText('Task created successfully.').first()
    ).toBeVisible();

    // 3. Child logs in using a separate browser session
    await childPage.goto('/');

    await childPage.getByLabel('Email').fill('child@hive.test');
    await childPage.getByLabel('Password').fill('Hive2026!');
    await childPage.getByRole('button', { name: 'Log in' }).click();

    // 4. Child sees and completes the task
    const taskItem = childPage.locator('li').filter({
      hasText: taskTitle
    });

    await expect(taskItem).toBeVisible();
    await expect(taskItem.getByText('Status: Pending')).toBeVisible();

    await taskItem.getByRole('button', { name: 'Mark Complete' }).click();

    await expect(
      taskItem.getByText('Status: Completed')
    ).toBeVisible();

    // 5. Parent refreshes and sees the completed status
    await parentPage.reload();

    const parentTask = parentPage.locator('li').filter({
      hasText: taskTitle
    });

    await expect(parentTask.getByText('Completed')).toBeVisible();
  } finally {
    await parentContext.close();
    await childContext.close();
  }
});
