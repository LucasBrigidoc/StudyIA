# SolveAI Educacional - Design Guidelines

## Design Approach

**Selected System**: Material Design with modern AI interface aesthetics
**Justification**: Educational productivity tool requiring clear information hierarchy, efficient workflows, and trustworthy AI interaction patterns. Blending Material's content organization with contemporary AI app sensibilities (Notion, ChatGPT, Linear).

**Key Principles**:
- Academic clarity over visual flair
- Efficient workflows with minimal friction
- Clear visual hierarchy for complex information
- Trust and reliability in AI responses

---

## Typography System

**Font Families** (Google Fonts):
- **Primary**: Inter (UI, buttons, labels, navigation) - weights 400, 500, 600
- **Content**: Source Sans Pro (questions, solutions, long-form text) - weights 400, 600
- **Code/Data**: JetBrains Mono (formulas, calculations, data) - weight 400

**Type Scale**:
- Headings: text-3xl (main screens), text-2xl (sections), text-xl (subsections)
- Body: text-base (standard content), text-sm (labels, metadata)
- Captions: text-xs (helper text, timestamps)
- Academic Content: text-lg (question text for readability)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (component padding, card spacing)
- Section spacing: p-6, py-8 (major sections)
- Screen margins: p-8, px-12 (desktop containers)

**Screen Structure**:

**Two-Screen Layout**:
- Sidebar navigation (fixed, w-64): Switch between "Resolver Questões" and "Gerenciar Pastas"
- Main content area (flex-1): Full-height scrollable workspace
- No traditional header - navigation is sidebar-based for maximum content space

**Main Screen (Resolver Questões)**:
- Two-column layout on desktop (lg:grid-cols-2):
  - Left: Upload zone + question preview (sticky top-8)
  - Right: AI response panel (scrollable)
- Single column on mobile (stack vertically)

**Folders Screen (Gerenciar Pastas)**:
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Folder cards with file previews
- Modal overlay for folder contents detail view

---

## Core Components

### Navigation Sidebar
- Vertical sidebar with logo at top
- Two main navigation items with icons (Heroicons):
  - "Resolver Questões" (DocumentTextIcon)
  - "Gerenciar Pastas" (FolderIcon)
- Active state: subtle background highlight
- Fixed position on desktop, drawer on mobile

### Upload Zone
- Large drag-and-drop area (min-h-48)
- Dashed border (border-dashed border-2) in neutral state
- Upload icon centered with instructional text
- File type indicators: "Foto, PDF ou Texto"
- Preview thumbnail grid after upload (grid-cols-3 gap-2)
- Clear "X" button on each thumbnail

### Context Folder Selector
- Dropdown above upload zone
- Shows folder name + file count
- Hover preview of folder contents
- "Criar Nova Pasta" quick action link

### Action Button
- Primary: "Resolver usando Contexto"
- Full-width on mobile, auto-width desktop
- Loading state with spinner when processing
- Disabled state when no question uploaded

### AI Response Panel
- Structured sections with clear visual separation:
  1. **Questão Completa**: Card with light background, full question text
  2. **Dados Extraídos**: Bulleted list or key-value pairs in code-style formatting
  3. **Itens da Questão**: Accordion or tabbed interface for A), B), C)
     - Each item shows: "O que pede:", "Solução:", "Passo a passo:"
  4. **Etapas do Fluxo**: Collapsible sections for 7-step process
  5. **Resposta Final**: Highlighted summary card

- Each section has: icon + heading + content
- Copy button for each major section
- Export/download full solution button

### Folder Cards
- Card design with shadow on hover
- Folder icon + name as header
- File count and total size as metadata
- Preview of first 3 files (thumbnail grid)
- Action buttons: "Abrir", "Editar", "Excluir"

### Folder Detail Modal
- Full-screen overlay with semi-transparent backdrop
- Centered content panel (max-w-4xl)
- Header: Folder name + close button
- File grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Each file: thumbnail, name, size, delete icon
- "Adicionar Arquivos" upload button
- Footer: Material count summary

### File Preview Items
- Thumbnail for images/PDFs (aspect-square)
- Document icon for text files
- Filename truncated with ellipsis
- File size in small text below
- Hover state shows full filename in tooltip

---

## Interaction Patterns

**Upload Flow**:
1. Click or drag to upload zone
2. Instant file validation feedback
3. OCR processing indicator (progress bar + "Extraindo texto...")
4. Preview appears with extracted text editable

**Question Resolution Flow**:
1. Select folder from dropdown
2. Upload question
3. Review extracted text (editable)
4. Click "Resolver" button
5. Loading state (animated dots)
6. Response streams in section by section
7. Each section animates in (slide-up, fade-in - keep subtle)

**Folder Management**:
1. Create folder: Inline form appears in grid
2. Add files: Click folder → modal opens → upload
3. Delete confirmation: Simple alert modal

---

## Visual Hierarchy

**Emphasis Levels**:
- **Critical actions**: Primary button style, larger size
- **Section headers**: Bold, larger text, icon prefix
- **Question text**: Distinctive background, larger font
- **AI response**: Organized cards with clear boundaries
- **Metadata**: Smaller, muted text

**Content Density**:
- Upload area: Generous whitespace, centered content
- Response panel: Dense but well-organized, clear separators
- Folder grid: Balanced spacing for scanability
- Mobile: Increased padding for touch targets

---

## Responsive Behavior

**Desktop (lg:)**: Two-column layouts, sidebar visible
**Tablet (md:)**: Adaptive columns (2 for folders, stacked for main)
**Mobile**: Single column, drawer navigation, full-width cards

**Touch Targets**: Minimum h-12 for all interactive elements on mobile

---

## Images

**Hero Section**: None - this is a utility app, immediate access to upload is priority

**Placeholder Images**:
- Empty state illustrations for "Nenhuma pasta criada"
- Empty state for "Nenhuma questão enviada"
- Generic document/folder icons in relevant sections

Use simple, flat illustration style for empty states (similar to Dropbox/Google Drive empty states).