# GitTree: GitHub Repository Virtual File Explorer & Organizer

GitTree reimagines GitHub repository management by replacing chaotic, endless lists with an interactive virtual file system. Developers can create custom nested directories (e.g., `UNI/Algorithms`, `UNI/Web-Dev`, `Side Projects`, `Archive`), drag-and-drop both public and private repositories into folders, assign custom color codes, and switch between an IDE-style file explorer and a visual color-coded bento grid overview.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been aligned based on user preferences in Phase 1:

- **Authentication & Private Repositories**: Direct GitHub Personal Access Token (classic or fine-grained `repo` scope) integration stored securely in client storage. Also supports a fast public-only explorer mode for zero-friction browsing without a token.
- **Dual Visual Modes**:
  1. *Virtual File Explorer Tree*: Collapsible folders, drag-and-drop repo placement, nested subdirectories, breadcrumb navigation, and quick-filter toolbar.
  2. *Color-Coded Bento Grid Overview*: Visual card cluster where each folder is a distinct color-themed container displaying repositories, languages, stars, fork counts, visibility badges, and commit activity.
- **Persistence & Portability**: State (folders, repo mappings, custom colors, notes) persisted in browser `localStorage` with full JSON Export and Import capabilities to backup and restore configurations across devices.

---

### 1. Overview & Core Concept

- **What It Does**: Fetches all repositories (public and private) owned or starred by the user via GitHub REST API, and overlays a fully customizable virtual directory tree where repositories can be categorized into folders, tagged with custom colors, annotated with notes, and filtered effortlessly.
- **Target Audience / Persona**: Students, indie hackers, and professional developers with dozens or hundreds of repositories who struggle to distinguish university coursework, active personal projects, client deliverables, and legacy code.
- **Key Value**: Eliminates the cognitive fatigue of standard GitHub repo lists by delivering desktop-grade organizational power (drag-and-drop, folder hierarchies, instant search, and visual grouping).

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Connect & Load**: User enters their GitHub Personal Access Token (with helper modal explaining how to generate one in 2 clicks) or enters a public GitHub username. GitTree fetches all repositories with pagination and rate-limit tracking.
2. **Organize & Structure**:
   - Create custom folders (e.g., `UNI`, `Open Source`, `Client Work`, `Sandbox`).
   - Assign custom folder accent colors (e.g., Emerald for Uni, Indigo for Projects, Amber for Archive).
   - Drag and drop repositories directly into folders or use a quick "Move to..." contextual menu.
   - Support nested folders (e.g., `UNI / Year 3 / Computer Vision`).
   - Leave repos in "Root / Unfiled" until sorted.
3. **Toggle Visual Modes**:
   - **Tree Explorer View**: IDE-style left sidebar tree with chevron collapse/expand, file counters, drag indicators, and right-hand active repository inspector (README preview, commit stats, topics, direct GitHub links).
   - **Bento Grid View**: Spacious, color-accented grid layout where each folder occupies a card group displaying its repositories with language pills, privacy lock icons, and last updated timestamps.
4. **Search & Filter**: Real-time fuzzy search across repo names, descriptions, languages, and folder paths, with filters for `Private`, `Public`, `Forks`, and `Archived`.
5. **Backup & Restore**: One-click JSON export to download the entire organizational layout, and JSON import to restore or transfer to other machines.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-utility Developer Console with modern Scandinavian minimalism. Clean surfaces, high-contrast typography, and deliberate geometric precision reminiscent of modern developer tooling (Linear, VS Code, Raycast).
- **Color Palette**:
  - Deep Canvas: Rich neutral slate (`#0B0F17`) in dark posture with crisp white (`#FFFFFF`) light mode toggle.
  - Surface Hierarchy: Subtle 1px borders (`#1E293B` dark, `#E2E8F0` light) with 0% elevation layering.
  - Folder Color Accents: A curated 8-swatch palette (Teal, Cobalt, Violet, Rose, Amber, Emerald, Slate, Cyan) for color-coding folders and tags.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` for clean, confident titles and navigation.
  - Body & UI: `Plus Jakarta Sans` (14px–15px) for high scannability.
  - Code & Metrics: Tabular monospace numerals (`JetBrains Mono` / `tabular-nums`) for commit counts, stars, fork metrics, and path breadcrumbs.
- **Zero-Pill Restraint**: Static metadata (dates, stars, language) rendered as clean unboxed text separated by subtle middots (`·`). Interactive filter controls and folder tabs use clean segmented buttons.

#### Interactive Feedback & Motion
- Smooth drag-and-drop ghost preview with dropzone highlight states and nesting indicators.
- Quick folder expansion animations ($150\text{ms}$) with zero layout shift.
- Toast notifications for backup export, token verification, and folder actions.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct GitHub REST API with Personal Access Token vs. OAuth App**
  - *Chosen Approach*: User enters their GitHub Personal Access Token (classic or fine-grained) directly into the app, validated via `/user` and `/user/repos`.
  - *Why*: GitHub OAuth Apps require registering external callback URLs with secret keys and backend redirect handshakes that can fail in sandboxed browser runtimes. PAT gives instant, 100% reliable read access to both private and public repositories without any third-party infrastructure.
  - *Alternatives Considered*: OAuth web flow was considered, but PAT provides zero-friction private repository access while preserving privacy (tokens never leave the user's browser).
- **Decision 2: Virtual Directory Overlay vs. Physical Repo Modification**
  - *Chosen Approach*: Maintain a virtual folder mapping in client state (`folderId -> [repoIds]`), leaving the actual GitHub accounts untouched.
  - *Why*: GitHub does not natively support repository folder hierarchies. An overlay gives complete freedom (nesting, custom colors, notes) without risking accidental git modifications.
- **Decision 3: Local Storage with JSON Backup vs. Remote Database**
  - *Chosen Approach*: Browser `localStorage` with automated migration and import/export JSON.
  - *Why*: Instant loading, zero database provisioning overhead, total user data privacy, and full portability across devices through exported JSON files.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          GitTree Application                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │   GitHub API Client   │             │    Storage & State Store   │  │
│  │  - PAT / Username Auth│◄───────────►│  - Repositories Cache      │  │
│  │  - Rate Limit Tracker │             │  - Virtual Folders Tree    │  │
│  │  - Repo Details/README│             │  - Color & Meta Tagging    │  │
│  └───────────┬───────────┘             │  - JSON Import / Export    │  │
│              │                         └─────────────┬──────────────┘  │
│              ▼                                       ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Top Bar & Global Controls                     │  │
│  │  - Search / Filter  ·  View Switcher (Tree / Bento)  ·  Settings │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│              │                                       │                 │
│              ▼                                       ▼                 │
│  ┌─────────────────────────────┐       ┌────────────────────────────┐  │
│  │     Explorer Tree View      │       │      Bento Grid View       │  │
│  │  - Drag & Drop Directory    │       │  - Color-Coded Folder Cards│  │
│  │  - Collapsible Subfolders   │       │  - Metric Badges & Stacks  │  │
│  │  - Right Inspector Pane     │       │  - Unfiled Repos Drawer    │  │
│  └─────────────────────────────┘       └────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Model & Entities
- **Repository**:
  - `id`: Unique GitHub ID
  - `name`, `full_name`, `owner`, `html_url`, `description`
  - `private`: Boolean indicating visibility
  - `language`: Primary programming language
  - `stargazers_count`, `forks_count`, `updated_at`, `pushed_at`
  - `topics`: String array
  - `default_branch`: String
- **Virtual Folder**:
  - `id`: UUID
  - `name`: Folder name (e.g. "UNI", "Algorithms", "Side Projects")
  - `parentId`: Optional parent folder ID for nested subfolders
  - `color`: Hex/theme color token
  - `repoIds`: Array of GitHub repository IDs assigned to this folder
  - `collapsed`: Boolean expansion state
- **Organization State**:
  - `folders`: Array of Virtual Folders
  - `customRepoNotes`: Record of repository ID to user notes
  - `activeFilter`: Search query, visibility filter, language filter
  - `activeView`: `'tree' | 'bento'`
  - `selectedRepoId`: Currently inspected repository

#### Interactive Handlers & State Mapping
- `handleCreateFolder(name, parentId, color)`: Creates folder and validates unique name within parent level.
- `handleMoveRepo(repoId, targetFolderId)`: Moves repository between folders with drag-and-drop or context menu.
- `handleDeleteFolder(folderId, deleteContents)`: Removes folder, safely moving contained repos to root or parent.
- `handleExportConfig()`: Generates downloadable `gittree-backup.json` containing folders and mappings.
- `handleImportConfig(jsonFile)`: Validates and loads folder hierarchies into active state.
- `handleFetchRepos(token, username)`: Calls GitHub API `/user/repos` (with `Authorization: Bearer <token>`) with automatic pagination up to 100 per page.
