import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Backend formatting / lint check runner.
 *
 * Runs `spotless:check` (Google Java Format) in `./backend` via `mvn` or `mvnw`.
 * If neither is available locally, gracefully prints a warning and delegates
 * enforcement to GitHub Actions CI.
 */
function findMavenCommand(backendDir: string): string | null {
  try {
    const check = spawnSync("mvn", ["-version"], {
      shell: true,
      stdio: "ignore",
    });
    if (check.status === 0) {
      return "mvn";
    }
  } catch {}

  const isWindows = process.platform === "win32";
  const wrapperScript = isWindows
    ? path.join(backendDir, "mvnw.cmd")
    : path.join(backendDir, "mvnw");
  const wrapperCommand = isWindows ? ".\\mvnw.cmd" : "./mvnw";

  if (fs.existsSync(wrapperScript)) {
    try {
      const check = spawnSync(wrapperCommand, ["-version"], {
        cwd: backendDir,
        shell: true,
        stdio: "ignore",
      });
      if (check.status === 0) {
        return wrapperCommand;
      }
    } catch {}
  }

  return null;
}

function runBackendLint(): void {
  const backendDir = path.resolve(process.cwd(), "backend");
  const mvnCmd = findMavenCommand(backendDir);

  if (!mvnCmd) {
    console.warn(
      "\n[WARNING] Neither Apache Maven ('mvn') nor a runnable Maven Wrapper was found in PATH.\n" +
        "  Skipping local backend Spotless formatting check. GitHub Actions CI will enforce it.\n"
    );
    process.exit(0);
  }

  console.log("\n[pre-commit] Running backend Spotless code formatting check...");

  const result = spawnSync(mvnCmd, ["-B", "-q", "spotless:check"], {
    cwd: backendDir,
    shell: true,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(
      "\n[ERROR] Backend code formatting check failed!\n" +
        "  Run 'mvn spotless:apply' (or './mvnw spotless:apply') to automatically format Java files with Google Java Format.\n"
    );
    process.exit(result.status ?? 1);
  }

  console.log("[pre-commit] Backend formatting check passed.\n");
}

runBackendLint();
