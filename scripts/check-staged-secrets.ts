import { spawnSync } from "node:child_process";

/**
 * Secret scanner for Git pre-commit hook.
 *
 * Enforces security hygiene before changes can be committed:
 * 1. Blocks any staged file matching .env* (except .env.example)
 * 2. Blocks staged additions containing private key headers
 * 3. Blocks staged additions containing hardcoded JWT_SECRET or PASSWORD assignments with non-placeholder values
 *
 * Strictly offline: zero network requests.
 */
function runGit(args: string[]): string {
  const result = spawnSync("git", args, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.error) {
    console.error(`Failed to execute git ${args.join(" ")}:`, result.error.message);
    process.exit(1);
  }
  return result.stdout ?? "";
}

function checkStagedFiles(): void {
  const stagedFilesOutput = runGit(["diff", "--cached", "--name-only", "--diff-filter=ACM"]);
  const stagedFiles = stagedFilesOutput
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  let hasErrors = false;

  // 1. Check for committed .env files
  for (const file of stagedFiles) {
    const normalized = file.replace(/\\/g, "/");
    const basename = normalized.split("/").pop() ?? "";

    if (basename.startsWith(".env") && basename !== ".env.example") {
      console.error(
        `[SECURITY ERROR] Prohibited environment file staged: ${file}\n` +
          `  Never commit real .env files to git. Use .env.example for placeholders.`
      );
      hasErrors = true;
    }
  }

  // 2. Check staged diffs for private keys or real secret values
  const diffOutput = runGit(["diff", "--cached", "-U0"]);
  const diffLines = diffOutput.split("\n");

  const privateKeyPattern = /-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY-----/;
  const secretKeyPattern = /^(?:export\s+)?(?:const|let|var\s+)?(JWT_SECRET|[A-Za-z0-9_]*PASSWORD)\s*[:=]\s*(.+)$/i;

  const placeholderValues = new Set([
    "",
    '""',
    "''",
    "placeholder",
    "replace_with_a_secure_random_base64_secret_key_at_least_32_bytes_long",
    "servicedesk_dev_password",
    "iitsm_dev_password",
    "default_jwt_secret_key_minimum_thirty_two_bytes_long",
    "default_dev_secret_key_change_in_production",
    "test_secret_key_minimum_thirty_two_characters_long_for_unit_tests",
  ]);

  let currentFile = "";
  for (const line of diffLines) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.substring(6).trim();
      continue;
    }

    // Ignore file diff headers and deletions
    if (line.startsWith("+++") || line.startsWith("---") || !line.startsWith("+")) {
      continue;
    }

    const addedContent = line.substring(1).trim();

    // Check private key headers
    if (privateKeyPattern.test(addedContent)) {
      console.error(
        `[SECURITY ERROR] Private key detected in staged diff: ${currentFile}\n` +
          `  Matched: ${addedContent.substring(0, 40)}...`
      );
      hasErrors = true;
    }

    // Check secret / password assignments
    const match = addedContent.match(secretKeyPattern);
    if (match && match[1] && match[2]) {
      const keyName = match[1];
      const rawValue = match[2].trim().replace(/^["';]|["';]$/g, "");

      const isPlaceholder =
        placeholderValues.has(rawValue) ||
        rawValue.startsWith("${") ||
        rawValue.startsWith("<") ||
        rawValue.toLowerCase().includes("placeholder") ||
        rawValue.toLowerCase().includes("change_in_production") ||
        rawValue.toLowerCase().includes("replace_with");

      // Don't flag documentation files, markdown, or scripts/examples
      const isDocOrExample =
        currentFile.endsWith(".md") ||
        currentFile.endsWith(".example") ||
        currentFile.includes("check-staged-secrets");

      if (!isPlaceholder && !isDocOrExample) {
        console.error(
          `[SECURITY ERROR] Potential hardcoded secret found in ${currentFile}:\n` +
            `  Line: ${keyName}=${rawValue.substring(0, 3)}***\n` +
            `  Use environment variables from .env instead of hardcoding credentials.`
        );
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error("\nCommit rejected by pre-commit security check.");
    process.exit(1);
  }
}

checkStagedFiles();
