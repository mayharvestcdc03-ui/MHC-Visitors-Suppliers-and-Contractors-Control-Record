const { createClient } = require('@libsql/client');

async function clean() {
  const dbs = ['file:./dev.db', 'file:./prisma/dev.db'];
  for (const url of dbs) {
    try {
      const client = createClient({ url });
      // Delete test gibberish
      await client.execute("DELETE FROM Visitor WHERE fullName LIKE '%asdf%' OR fullName = ''");
      
      // Find duplicates by fullName + visitDate and keep only the latest one
      const res = await client.execute("SELECT id, fullName, visitDate, registeredAt FROM Visitor ORDER BY registeredAt DESC");
      const seen = new Set();
      const toDelete = [];
      for (const row of res.rows) {
        const key = `${(row.fullName || '').trim().toLowerCase()}_${row.visitDate}`;
        if (seen.has(key)) {
          toDelete.push(row.id);
        } else {
          seen.add(key);
        }
      }

      for (const id of toDelete) {
        console.log(`Deleting duplicate record ${id} from ${url}`);
        await client.execute({ sql: "DELETE FROM Visitor WHERE id = ?", args: [id] });
      }
      console.log(`Cleaned duplicates from ${url}. Removed ${toDelete.length} duplicates.`);
    } catch (e) {
      console.warn(`Notice for ${url}:`, e.message || e);
    }
  }
}

clean().then(() => process.exit(0));
