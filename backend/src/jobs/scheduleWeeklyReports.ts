import "dotenv/config";
import { connectDB } from "../config/db.js";
import { User } from "../modules/users/user.model.js";
import { reportQueue } from "./reportQueue.js";

const scheduleForAllUsers = async () => {
  await connectDB();

  const users = await User.find().select("_id");
  console.log(`Scheduling weekly reports for ${users.length} users`);

  for (const user of users) {
    await reportQueue.upsertJobScheduler(
      `weekly-report-${user._id}`, // stable scheduler ID — re-running this updates, not duplicates
      { pattern: "0 0 * * 0"  }, // every Sunday at midnight
      {
        name: "generate-report",
        data: { userId: user._id.toString() },
      }
    );
  }

  console.log("Weekly report schedule registered for all users");
  process.exit(0);
};

scheduleForAllUsers();