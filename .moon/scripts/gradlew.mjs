import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const isWindows = process.platform === "win32";
const command = isWindows ? "cmd.exe" : "sh";
const commandArgs = isWindows
  ? ["/d", "/s", "/c", "gradlew.bat", ...args]
  : ["./gradlew", ...args];

const child = spawn(command, commandArgs, {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
