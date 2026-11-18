
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline';
import { connectDatabase } from '../src/config/database.js';
import User from '../src/models/User.js';

const EMAIL = 'studypilot.test01@example.com';

async function main() {
  try {
    await connectDatabase();

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const ask = (question: string) =>
      new Promise<string>(resolve =>
        rl.question(question, resolve)
      );

    console.log('\nStudyPilot Password Reset');
    console.log('Target:', EMAIL);

    const user = await User.findOne({ email: EMAIL });

    if (!user) {
      rl.close();
      throw new Error('Account not found.');
    }

    if (!user.isActive) {
      rl.close();
      throw new Error('Account is inactive.');
    }

    const confirmation = await ask('Type RESET to continue: ');

    if (confirmation.trim() !== 'RESET') {
      rl.close();
      console.log('Cancelled. No changes made.');
      return;
    }

    const password = await ask('Enter new password (8+ characters): ');
    const confirm = await ask('Confirm new password: ');

    rl.close();

    if (password.length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }

    if (password !== confirm) {
      throw new Error('Passwords do not match.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount !== 1) {
      throw new Error('Password update failed.');
    }

    console.log('\nPassword reset successful!');
    console.log('Account:', EMAIL);
    console.log('Hashing: BCrypt (12 rounds)');
    console.log('Other user data was not changed.');

  } finally {
    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exitCode = 1;
});
