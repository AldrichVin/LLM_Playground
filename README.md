# LLM Evaluation Playground

A design-forward interface for evaluating local LLMs with experiment tracking and comparison capabilities. Built with React, TypeScript, and Framer Motion.

## Features

- **Streaming Chat Interface** - Real-time token rendering with smooth Framer Motion animations
- **Model Switching** - Compare Llama 3.2, Phi-3, and Gemma 2 models side-by-side
- **Parameter Controls** - Fine-tune temperature, max tokens, top-p, top-k, and repeat penalty
- **Experiment Tracking** - Automatic logging of every run with full metrics (latency, tokens/sec, TTFT)
- **Side-by-Side Comparison** - Compare outputs from different models, select winners, and add notes
- **Comparison Logging** - Each comparison is logged as a single experiment with linked outputs
- **Pipeline Visualization** - Animated SVG diagram showing request → model → response flow
- **Prompt Templates** - Save and reuse prompts with variable placeholders ({{variable}})
- **Date Filtering** - Filter experiments by Today, Last 7 days, Last 30 days, or All time
- **Token Split Display** - See prompt tokens + completion tokens separately
- **Dual Export** - Export experiments as JSON or CSV for spreadsheet analysis
- **Annotation System** - Rate outputs with thumbs up/down, 5-star rating, and tags
- **Model Statistics** - View per-model stats (runs, avg latency, preference rate)
- **Local Persistence** - All experiments saved to localStorage

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 18+ (for local development without Docker)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd llm-evaluation-playground

# Start services
docker-compose up -d

# Pull models (first time only - this may take a few minutes)
docker exec ollama ollama pull llama3.2:1b
docker exec ollama ollama pull phi3:mini
docker exec ollama ollama pull gemma2:2b

# Open the playground
open http://localhost:5173
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Start Ollama separately (must be running on port 11434)
ollama serve

# Pull models
ollama pull llama3.2:1b
ollama pull phi3:mini

# Start the dev server
npm run dev

# Open http://localhost:5173
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────┬─────────────────────────┬────────────────────┤
│   Sidebar   │      Main Content       │  Controls Panel    │
│  - Chat     │  - Chat Interface       │  - Model Switcher  │
│  - Exps     │  - Experiment Log       │  - Parameters      │
│  - Compare  │  - Comparison View      │  - Presets         │
└─────────────┴───────────┬─────────────┴────────────────────┘
                          │
                    Streaming API
                          │
              ┌───────────▼───────────┐
              │   Ollama (localhost)   │
              │   - llama3.2:1b       │
              │   - phi3:mini         │
              │   - gemma2:2b         │
              └───────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| LLM Backend | Ollama |
| Containers | Docker Compose |

## Model Rationale

### Why These Two Models?

I selected **Llama 3.2 1B** and **Phi-3 Mini (3.8B)** to explore the speed vs. quality tradeoff at different parameter counts.

| Model | Params | Avg Latency | Tokens/sec | Strengths | Weaknesses |
|-------|--------|-------------|------------|-----------|------------|
| **Llama 3.2 1B** | 1B | ~9s | 30-66 t/s | Fast, concise, creative tasks, format adherence | Reasoning errors, factual gaps |
| **Phi-3 Mini** | 3.8B | ~12s | 15-29 t/s | Strong reasoning, factual accuracy | Slower, verbose, occasional code bugs |

### What We Observed

**The Reasoning Gap**: On a trick question ("A farmer has 17 sheep. All but 9 die. How many are left?"), **Llama incorrectly calculated 8** (17-9), while **Phi-3 correctly answered 9** and explained the linguistic trick. This validated Phi-3's stronger logical reasoning despite being 3.8x larger.

**Code Quality Surprise**: Llama generated **clean, complete Python code** with docstrings and edge case documentation (364 tokens). Phi-3's output was **broken** with syntax errors (`cleaned end of function`). For code generation at temp 0.3, Llama significantly outperformed despite its size disadvantage.

**Creative Format Adherence**: Asked for a haiku, Llama produced a perfect 5-7-5 structure in 15 tokens. Phi-3 generated 54 tokens of prose that completely ignored the format constraint.

**The Latency-Quality Tradeoff is Real**: Llama averaged 9-10s with 30-66 t/s. Phi-3 averaged 12-38s with 15-29 t/s. For interactive evaluation, Llama's 3x speed advantage creates noticeably better UX, even when quality suffers.

**Why This Pairing Works for Evaluation**:
- Exposes clear tradeoffs (not just "better" vs "worse")
- Both run on consumer hardware (8GB RAM)
- Distinct strengths make comparison meaningful
- Fast enough for iterative testing (sub-40s responses)

## Observations & Surprises

### Performance Discoveries

**TTFT Dominates Perceived Speed**: Time-to-first-token (TTFT) matters more than total latency for UX. Llama's 200-1300ms TTFT feels instant compared to Phi-3's 5000-30000ms (30 seconds!). Even though Phi-3 generates at 15-29 t/s, that 30-second wait before *anything* appears creates a "broken" feeling.

**Token Throughput Varies Wildly by Task**:
- Code generation: Llama 27 t/s, Phi-3 17 t/s (both slow)
- Simple factual: Llama 60+ t/s, Phi-3 15 t/s (Llama 4x faster)
- Creative writing: Llama 1.8-66 t/s (extreme variance), Phi-3 7-14 t/s (consistent)

The variance suggests Llama's generation speed depends heavily on prompt complexity, while Phi-3 maintains steadier throughput.

### Model Behavior Patterns

**Llama's Conciseness is a Feature AND a Bug**:
- Haiku prompt → 15 tokens, perfect format ✓
- Code prompt → 364 tokens, complete with docs ✓
- Reasoning prompt → 80 tokens, wrong answer but fast ✗

Llama optimizes for brevity. When the task demands it (haiku, code), this is excellent. When it needs to "think through" a problem, it shortcuts to the wrong answer.

**Phi-3's Verbosity Hides Failures**:
```
Prompt: "Write a haiku about debugging code"
Output: "In lines and functions, Error whispers through arrays—
peel back layers; fix them all. Harmony returned as bugs
demure beneath resolved symphonies..." (54 tokens)
```
Not a haiku. But the prose *sounds* sophisticated, which makes the failure less obvious than Llama's terse errors.

**Code Generation Inverts Expectations**: Despite Phi-3's 3.8x size advantage, Llama produced clean, runnable code while Phi-3 had syntax errors. At temperature 0.3 (precise), this suggests Llama's training may have stronger code representation despite fewer parameters.

### Temperature Sensitivity

Tested "What is machine learning?" at 0.2, 0.7, and 1.2 on both models:

| Temp | Llama Behavior | Phi-3 Behavior |
|------|----------------|----------------|
| 0.2 | Dry but accurate (384 tokens, 13s) | Dry but accurate (126 tokens, 9.2s) |
| 0.7 | Best balance (556 tokens, 9.3s) | Structured, detailed (330 tokens, 11.3s) |
| 1.2 | Stays coherent (326 tokens, 4.9s) | Repetitive prose (140 tokens, 4.9s) |

**Finding**: **0.7 is the sweet spot for both models**, but Llama tolerates higher temperatures better. At 1.2, Llama remains readable while Phi-3 starts repeating concepts.

### Failure Modes

**Llama Fails at**:
- Trick questions / lateral thinking (answered 8 instead of 9)
- Tasks requiring "showing work" (shortcuts to wrong conclusions)

**Phi-3 Fails at**:
- Format constraints (ignores haiku structure, writes run-on sentences)
- Code correctness (syntax errors, incomplete implementations)
- Speed (30-second TTFT makes it feel unresponsive)

### UX Friction Discovered

**Streaming Creates False Progress Illusion**: When Phi-3's TTFT hits 30 seconds, users assume it's broken. The streaming animation continues but without tokens, creating anxiety. **Solution needed**: Show "model loading" or "thinking" state during high-TTFT periods.

**The Annotation System Changes Evaluation Behavior**: Once you add ratings/tags, you start treating experiments as data points instead of conversations. Users become more systematic—running variations, comparing outputs side-by-side, exporting CSV for analysis. The tool shifts from "chat" to "laboratory" once annotations are enabled.

**Model Switching Mid-Evaluation is Critical**: Being able to re-run the same prompt on both models without retyping is essential. The comparison view enables this, but it requires post-hoc selection. A "Run on Both" button would streamline the workflow.

## Design Decisions

### Why localStorage over SQLite?

For a demo/evaluation tool, localStorage provides sufficient persistence without the complexity of setting up a database. All experiments are stored as JSON and can be exported at any time.

**Real-world validation**: After running 30+ experiments, localStorage handled ~2MB of data without performance issues. The JSON export feature provides an escape hatch if users need SQL-based analysis later.

### Streaming Implementation

The chat uses Ollama's NDJSON streaming API with an async generator pattern, yielding tokens as they arrive for smooth, character-by-character rendering with Framer Motion animations.

### Animation Philosophy

Animations enhance UX by:
- Providing feedback (hover states, loading indicators)
- Creating visual hierarchy (staggered entrances)
- Making the streaming experience feel natural (token fade-in, cursor blink)

### Zustand for State Management

Zustand was chosen over Redux or Context for several reasons:
- Minimal boilerplate for a tool of this size
- Built-in persistence middleware (localStorage)
- No provider wrapping required
- TypeScript-first design

### Annotation System Design

The evaluation surface uses a dual-rating system (thumbs + stars) because:
- **Thumbs (binary)**: Quick, low-friction feedback for batch evaluation
- **Stars (5-point)**: Detailed assessment when comparing similar outputs
- **Tags**: Enable filtering and pattern recognition across experiments

## Pipeline Flow Visualization

The chat interface features an animated SVG pipeline diagram that visualizes the request flow:

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  Input  │ →  │  Model  │ →  │ Output  │
│   ✓     │    │   ◉     │    │   ...   │
└─────────┘    └─────────┘    └─────────┘
```

**States:**
- **Idle** - Gray, ready for input
- **Pending** - Animated dashed arrows, request sent
- **Streaming** - Model node pulsing, tokens flowing to output
- **Complete** - All green with checkmarks
- **Error** - Red highlighting with error message

The pipeline can be collapsed to a compact status badge or expanded for full visibility. This provides immediate visual feedback about where the request is in the inference process.

## Unfinished Work

Prioritized list of features not yet implemented:

### ~~High Priority (Should Have)~~ ✅ DONE
- ~~Comparison logged as single experiment~~ ✅ Implemented
- ~~Date range filter~~ ✅ Implemented (Today, 7 days, 30 days, All time)
- ~~Input/output token split~~ ✅ Implemented (prompt + completion display)

### ~~Medium Priority (Nice to Have)~~ ✅ MOSTLY DONE
- ~~Prompt template system~~ ✅ Implemented with {{variable}} placeholders
- ~~CSV export~~ ✅ Implemented alongside JSON export
- ~~Pipeline visibility~~ ✅ Implemented as animated SVG diagram

### Remaining Work

Prioritized based on real usage patterns:

1. **"Run on Both Models" Button** - Biggest UX friction is manually switching models and retyping prompts. A single button to execute on both would streamline comparative evaluation.

2. **TTFT State Indicator** - When Phi-3's TTFT exceeds 10 seconds, show "Model Loading..." or thinking animation. Current empty streaming state feels broken.

3. **Batch Evaluation** - Run same prompt across all models simultaneously, auto-log comparison results. Critical for systematic testing.

4. **System Prompt Configuration** - Per-model system prompts would enable testing how different models respond to role instructions.

5. **Blind Rating Mode** - Hide model names during evaluation to reduce bias. Only reveal after ratings are submitted.

6. **Export Includes Comparison Runs** - CSV export currently only includes individual experiments, not comparison metadata (winner selection, notes).

7. **Temperature Profiles Per Task** - Save "presets" like "Code Generation (0.3)" or "Creative Writing (1.2)" that bundle task-specific temperatures with model selection.

## Project Structure

```
src/
├── components/
│   ├── chat/          # Chat interface components
│   │   ├── ChatInterface.tsx    # Main chat container
│   │   ├── MessageBubble.tsx    # Individual message display
│   │   ├── StreamingText.tsx    # Token-by-token text animation
│   │   ├── InputArea.tsx        # Message input with templates
│   │   └── PipelineFlow.tsx     # Animated pipeline visualization
│   ├── controls/      # Model & parameter controls
│   │   ├── ModelSwitcher.tsx    # Model selection with stats
│   │   ├── ParameterPanel.tsx   # Sliders for LLM params
│   │   └── PromptTemplates.tsx  # Template save/load UI
│   ├── experiments/   # Experiment tracking & comparison
│   │   ├── ExperimentLog.tsx    # Filterable experiment list
│   │   ├── ExperimentCard.tsx   # Single experiment display
│   │   ├── ComparisonView.tsx   # Side-by-side with winner select
│   │   ├── MetricsDisplay.tsx   # Token split & metrics
│   │   └── AnnotationPanel.tsx  # Thumbs, stars, tags, notes
│   ├── layout/        # App layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/            # Reusable UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Select.tsx
│       ├── Slider.tsx
│       └── Badge.tsx
├── hooks/
│   ├── useOllama.ts          # Ollama API integration
│   ├── useExperiments.ts     # Experiments + comparisons store
│   └── usePromptTemplates.ts # Template storage
├── lib/
│   ├── ollama-client.ts      # Streaming API client
│   ├── model-registry.ts     # Model definitions
│   └── utils.ts              # Utility functions
├── types/
│   └── index.ts              # TypeScript interfaces
└── App.tsx                   # Main application component
```

## Prompt Templates

The template system supports reusable prompts with variable placeholders:

```
Explain {{concept}} in simple terms that a beginner could understand.
```

**Default templates:**
- **Explain Concept** - `{{concept}}`
- **Compare Two Things** - `{{thing1}}` vs `{{thing2}}`
- **Code Task** - `{{language}}` function that `{{task}}`

**Usage:**
1. Click "Templates" in the input area
2. Select a template
3. Fill in the variables
4. Click "Apply Template"

**Saving custom templates:**
1. Type your prompt with `{{variable}}` placeholders
2. Click "Save current as template"
3. Enter a name and save

## Metrics Tracked

Each experiment records:

| Metric | Description |
|--------|-------------|
| **Latency** | Total time from request to completion (ms) |
| **Prompt Tokens** | Number of tokens in the input prompt |
| **Completion Tokens** | Number of tokens in the generated response |
| **Total Tokens** | Sum of prompt + completion tokens |
| **Tokens/Second** | Generation speed |
| **Time to First Token** | Latency before first token arrives (ms) |
| **Parameters** | Temperature, max tokens, top-p, top-k, repeat penalty |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line | `Shift + Enter` |
| Stop generation | Click stop button |

## Troubleshooting

### Ollama not connecting

1. Ensure Ollama is running: `docker ps` should show the ollama container
2. Check the logs: `docker logs ollama`
3. Verify the API: `curl http://localhost:11434/api/tags`

### Model not responding

1. Check if the model is pulled: `docker exec ollama ollama list`
2. Pull the model: `docker exec ollama ollama pull llama3.2:1b`
3. Try a smaller model if running low on memory

### Slow responses

1. Smaller models (1B-3B) are faster but less capable
2. Reduce `max_tokens` in parameters
3. Check system resources - LLMs are memory-intensive

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT

---

Built with React, TypeScript, Tailwind CSS, and Framer Motion.
