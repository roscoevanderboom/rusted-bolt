# Rusted Boltz

> **⚠️ Disclaimer: Use Binaries at Your Own Risk!**
>
> This project may provide pre-built binaries (e.g., Windows build at 7.7 MB). These are provided **AS IS** and **WITHOUT WARRANTY**. Unsigned and untested software can pose security and stability risks. It is **strongly recommended** that you build your own binaries from source for your system. Use any provided binaries at your own risk.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Alpha-orange" alt="Project Status">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/Built%20with-Tauri-24C8DB" alt="Built with Tauri">
  <img src="https://img.shields.io/badge/AI%20Powered-Yes-green" alt="AI Powered">
</p>

An AI-driven code automation and execution platform that brings modern development tools to your desktop. Built with Tauri and React, Rusted Boltz combines intelligent code assistance with real-time browser-based execution to streamline your development workflow.

## ✨ Key Features


https://github.com/user-attachments/assets/15a1a65b-cc8c-4949-bb61-e24963adb22a


🤖 **AI-Powered Development** - Intelligent code generation, refactoring, and assistance using multiple AI providers  
⚡ **WebContainer Runtime** - Execute Node.js applications directly in your browser with full npm ecosystem support  
📁 **Integrated File Management** - Full-featured file explorer with Monaco Editor for seamless code editing  
💻 **Interactive Terminal** - Built-in terminal with command history and process management  
👁️ **Live Preview** - Instant preview of your applications in a secure, sandboxed environment  
🎨 **Modern UI** - Clean, responsive interface with dark/light mode support  

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Rust (for Tauri development)

### Installation

```bash
# Clone the repository
git clone https://github.com/roscoevanderboom/rusted-boltz.git
cd rusted-boltz

# Install dependencies
deno | npm | pnpm install

# Start the development server
deno task | npm run | pnpm tauri dev

# Build installable package 
deno task | npm run | pnpm tauri build
```

### Configuration

Create a `.env` file in the project root for AI provider API keys:

```env
# AI Providers (choose one or more)
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here
GOOGLE_API_KEY=your_google_key_here

# Web Search (optional)
RAPIDAPI_KEY=your_rapidapi_key_here
```

## 🔧 AI Providers

| Provider | Status | Setup Required |
|----------|--------|----------------|
| **OpenAI** | ✅ Stable | API Key |
| **Groq** | ✅ Stable | API Key |
| **Google** | ✅ Stable | API Key |
| **Local (LM Studio)** | ⚠️ Development only | Local setup |

## 🛠️ Core Capabilities

### WebContainer Integration
- **Project Import**: Import folders, ZIP files, or clone GitHub repositories
- **Template Support**: Quick-start with Vite, TypeScript, and other modern frameworks
- **Dependency Management**: Install and manage npm packages with AI assistance
- **Development Server**: Run and preview applications with hot-reload support

### AI Tools
- **Code Generation**: Create components, functions, and entire applications
- **Smart Refactoring**: Improve code quality and structure
- **Web Search**: Research and integrate external information (experimental)
- **File Operations**: AI can read, write, and organize your project files

### Development Environment
- **Monaco Editor**: VS Code-like editing experience with syntax highlighting
- **Terminal Integration**: Full shell access with @xterm terminal emulation
- **File Explorer**: Intuitive file and folder management
- **Live Preview**: Secure, sandboxed application preview

## 🏗️ Technical Architecture

### Frontend Stack
- **React** + **TypeScript** - Modern component-based architecture
- **Tailwind CSS** + **Shadcn UI** - Responsive, accessible design system
- **Monaco Editor** - Professional code editing experience
- **Vercel AI SDK** - Streamlined AI integration
- **WebContainer** - Browser-based Node.js runtime

### Backend (Tauri)
- **Rust** - High-performance, memory-safe backend
- **PDF Processing** - Extract text content from PDF files
- **File System APIs** - Secure file operations and clipboard access
- **HTTP Client** - Safe external API communication

## 📋 Development Status

> **Note**: This is an alpha-stage project inspired by [stackblitz-labs/bolt.diy](https://github.com/stackblitz-labs/bolt.diy). While functional, some features are experimental and may have limitations in production environments.

### Current Limitations
- Local AI provider support is development-only
- Web search functionality may be unreliable in production
- Some starter templates are untested (Vite/TypeScript recommended)
- Terminal operations can be buggy in certain scenarios

## 🤝 Contributing

Contributions are welcome! This project aims to explore the intersection of AI and development tools. Areas for improvement include:

- Expanding AI tool capabilities
- Improving WebContainer stability
- Adding more project templates
- Enhancing the terminal experience

## 📝 TODO Roadmap

- Improve RapidApi integration
- Implement Tauri Stronghold plugin for API key storage
- Optimize build dependencies
- Optimize React Router/Monaco/@term/Vercel AI integration
- Add custom components for toolcalls
- Add form toolcalls to improve user input
- Integrate MCP
- Push to GitHub
- Update UI to glass-like UI (robust UI switcher)
- Possibly create 2 separate environments: user with deep system integration, and WebContainer for AI for evolve
- Message, WebContainer session persistence
- More provider integrations
- Custom header to replace default Tauri app window controls
- Tray menu for quick action

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by [StackBlitz Bolt](https://github.com/stackblitz-labs/bolt.diy) (not affiliated or derived)
- Built with [Tauri](https://tauri.app/) and [WebContainer](https://webcontainers.io/)
- AI integration powered by [Vercel AI SDK](https://sdk.vercel.ai/)

---

<p align="center">
  <strong>Ready to supercharge your development workflow?</strong><br>
  Star ⭐ this repo if you find it useful!
</p>
