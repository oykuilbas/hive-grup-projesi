// Call inside M1's seed transaction after creating its users and child record.
// Clearing links first also handles preliminary links tables without foreign keys.
function seedLinks(db, { childId, userIds }) {
  if (!Number.isSafeInteger(Number(childId)) || Number(childId) <= 0 ||
      !Number.isSafeInteger(Number(userIds?.linkedSpecialist)) || Number(userIds.linkedSpecialist) <= 0) {
    throw new Error('M2 seed requires childId and userIds.linkedSpecialist');
  }

  db.prepare('DELETE FROM links').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'links'").run();
  db.prepare(`INSERT INTO links (child_id, specialist_id, specialist_type)
    VALUES (?, ?, ?)`).run(Number(childId), Number(userIds.linkedSpecialist), 'teacher');
}

module.exports = { seedLinks };
