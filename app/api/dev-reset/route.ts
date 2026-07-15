import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    console.log("Wiping database schema...");
    // 1. Drop and recreate public schema to clean PostgreSQL completely
    await db.$executeRawUnsafe(`DROP SCHEMA public CASCADE;`);
    await db.$executeRawUnsafe(`CREATE SCHEMA public;`);
    await db.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO public;`);

    console.log("Database wiped. Running prisma db push...");
    // 2. Run prisma db push to create new tables
    const { stdout: pushStdout, stderr: pushStderr } = await execPromise("npx prisma db push --accept-data-loss");
    console.log("Prisma push output:", pushStdout, pushStderr);

    console.log("Running prisma db seed...");
    // 3. Run prisma db seed to seed initial admin and demo data
    const { stdout: seedStdout, stderr: seedStderr } = await execPromise("npx prisma db seed");
    console.log("Prisma seed output:", seedStdout, seedStderr);

    return NextResponse.json({
      success: true,
      message: "Base de datos reseteada y cargada con datos demo del Hotel exitosamente.",
      push: { stdout: pushStdout, stderr: pushStderr },
      seed: { stdout: seedStdout, stderr: seedStderr }
    });
  } catch (error: any) {
    console.error("Error during dev-reset:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
