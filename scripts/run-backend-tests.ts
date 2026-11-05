import { spawnSync } from "node:child_process";
import * as path from "node:path";

/**
 * Pre-push backend test runner.
 *
 * Runs `mvn -B -q test` in `./backend` if Maven is installed.
 * If Maven is not installed locally, gracefully prints a warning and delegates
 * enforcement to GitHub Actions CI.
 */
function isMavenAvailable(): boolean {
  try {
    const check = spawnSync("mvn", ["-version"], {
      shell: true,
      stdio: "ignore",
    });
    return check.status === 0;
  } catch {
    return false;
  }
}

function runBackendTests(): void {
  if (!isMavenAvailable()) {
    console.warn(
      "\n[WARNING] Apache Maven ('mvn') was not found in PATH.\n" +
        "  Skipping local pre-push backend tests. GitHub Actions CI will run full verification.\n"
    );
    process.exit(0);
  }

  const backendDir = path.resolve(process.cwd(), "backend");
  console.log("\n[pre-push] Running backend test suite (mvn -B -q test)...");

  const result = spawnSync("mvn", ["-B", "-q", "test"], {
    cwd: backendDir,
    shell: true,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(
      "\n[ERROR] Backend tests failed!\n" +
        "  Please review the test failures above and fix them before pushing.\n"
    );
    process.exit(result.status ?? 1);
  }

  console.log("[pre-push] Backend tests passed successfully.\n");
}

runBackendTests();

