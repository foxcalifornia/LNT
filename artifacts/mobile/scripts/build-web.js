const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");

function runCommand(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(" ")}`);
    
    const proc = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        ...env,
      },
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log("Building web app for Netlify deployment...");

  const domain = process.env.EXPO_PUBLIC_DOMAIN || "lntparis.netlify.app";
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "/.netlify/functions/api";

  console.log(`Domain: ${domain}`);
  console.log(`API URL: ${apiUrl}`);

  // Clean previous build
  const distDir = path.join(projectRoot, "dist");
  if (fs.existsSync(distDir)) {
    console.log("Cleaning previous build...");
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  // Run Expo web export
  try {
    await runCommand("pnpm", ["exec", "expo", "export", "--platform", "web", "--output-dir", "dist"], {
      EXPO_PUBLIC_DOMAIN: domain,
      EXPO_PUBLIC_API_URL: apiUrl,
    });

    console.log("\n✓ Build completed successfully!");
    console.log(`Output directory: ${distDir}`);
  } catch (error) {
    console.error("\n✗ Build failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Build script error:", error);
  process.exit(1);
});
