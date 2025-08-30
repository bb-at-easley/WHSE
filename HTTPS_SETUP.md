# HTTPS Setup for RWSDK Projects

A quick guide to enable HTTPS in your RedwoodSDK development environment using `vite-plugin-mkcert`.

## Why Use HTTPS in Development?

- Test modern web features that require secure contexts (WebAuthn, Service Workers, etc.)
- Match production environment more closely
- Avoid mixed content warnings when integrating with HTTPS APIs
- Test PWA features and secure cookies

## Quick Setup

### 1. Install the Plugin

```bash
pnpm add -D vite-plugin-mkcert
```

### 2. Configure Vite

Add the plugin to your `vite.config.mts`:

```typescript
import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import mkcert from "vite-plugin-mkcert";
import path from "path";

export default defineConfig({
  plugins: [
    mkcert(),
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ],
  // ... rest of your config
});
```

### 3. Install mkcert Binary

The plugin requires the `mkcert` binary to be installed on your system.

**macOS (using Homebrew):**
```bash
brew install mkcert
mkcert -install
```

**Linux/WSL:**
```bash
# Download and install mkcert
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
mkdir -p ~/.local/bin
mv mkcert-v*-linux-amd64 ~/.local/bin/mkcert

# Add to PATH (add to ~/.bashrc for persistence)
export PATH="$HOME/.local/bin:$PATH"

# Install CA (will show sudo prompt)
mkcert -install
```

**Windows:**
```powershell
# Using Chocolatey
choco install mkcert
mkcert -install

# Or download from GitHub releases
```

### 4. Start Dev Server

```bash
pnpm run dev
```

Your app will now be available at `https://localhost:5173/`

## Handling Certificate Warnings

### Option 1: Trust the Certificate (Recommended)
After running `mkcert -install`, restart your browser. The certificate should be trusted automatically.

### Option 2: Accept the Warning (Quick & Easy)
In your browser:
1. Click "Advanced" or "Show Details"
2. Click "Proceed to localhost (unsafe)" or similar
3. The warning only appears once per session

## WSL-Specific Setup

If you're using WSL and want Windows browsers to trust the certificate:

1. **Install mkcert on Windows** (PowerShell as Admin):
   ```powershell
   choco install mkcert
   ```

2. **Copy CA files from WSL to Windows**:
   - Access `\\wsl$\Ubuntu\home\[username]\.local\share\mkcert\` in Windows Explorer
   - Copy `rootCA.pem` and `rootCA-key.pem`
   - Paste to `C:\Users\[username]\AppData\Local\mkcert\`

3. **Trust on Windows**:
   ```powershell
   mkcert -install
   ```

## Troubleshooting

**"mkcert: command not found"**
- Make sure the binary is installed and in your PATH
- Try running with full path: `~/.local/bin/mkcert -install`

**"fetch failed" errors**
- Ensure mkcert is installed before starting the dev server
- The plugin order in `vite.config.mts` matters - keep `mkcert()` first

**Certificate not trusted**
- Run `mkcert -install` to install the root CA
- Restart your browser after installation
- For WSL, follow the WSL-specific setup above

## Compatibility

- ✅ Works with RWSDK's Cloudflare Vite plugin
- ✅ Compatible with all major browsers
- ✅ Supports WSL/WSL2 environments
- ✅ Works on macOS, Linux, and Windows

## Additional Resources

- [vite-plugin-mkcert GitHub](https://github.com/liuweiGL/vite-plugin-mkcert)
- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [RWSDK Documentation](https://docs.redwoodjs.com/)

---

*This guide was tested with RWSDK and works seamlessly with the Cloudflare Vite plugin integration.*