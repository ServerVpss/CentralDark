import { createApp } from "./app.js";
import { config } from "./config.js";
import { log } from "./logger.js";
import { codeReviewerToolDefinition } from "./tools/code-reviewer.js";

const app = createApp();

app.listen(config.port, "127.0.0.1", () => {
    log.info("mcp_listening", {
        port: config.port,
        publicUrl: config.publicUrl,
        githubOwner: config.github.owner,
        githubRepo: config.github.repo,
    });
});
export { codeReviewerToolDefinition } from "./tools/code-reviewer.js";