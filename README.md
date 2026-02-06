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

### Why These Three Models?

| Model | Size | Reasoning |
|-------|------|-----------|
| **Llama 3.2 1B** | 1B params | Meta's smallest model - excellent baseline for speed comparisons. Shows what's achievable with minimal compute. Fast TTFT, good for rapid prototyping. |
| **Phi-3 Mini** | 3.8B params | Microsoft's "punching above its weight" model - strong reasoning despite small size. Good benchmark for quality vs. size tradeoff. |
| **Gemma 2 2B** | 2B params | Google's quality-optimized small model. Sits between Llama and Phi-3, providing a middle ground for comparison. |

**Key insight:** These models were chosen to demonstrate the **speed vs. quality tradeoff** at different parameter counts:
- 1B for speed (Llama)
- 2B for balance (Gemma)
- 3.8B for quality (Phi-3)

All three run comfortably on consumer hardware (8GB RAM) and have sub-second TTFT, making them ideal for interactive evaluation workflows.

## Observations & Surprises

During development and testing, several interesting patterns emerged:

### Performance Observations
- **TTFT is more perceptually important than total latency** - Users notice the first token arriving more than total generation time
- **Token throughput varies significantly by prompt type** - Code generation is slower than conversational responses
- **Phi-3's reasoning really does shine** - Despite being only 3.8B, it handles logical puzzles better than the smaller models

### Model Behavior Differences
- **Llama 3.2 1B** tends to be more concise, sometimes too terse
- **Phi-3 Mini** produces more structured outputs (bullet points, numbered lists)
- **Gemma 2** balances verbosity well but occasionally hallucinates on factual questions

### Unexpected Findings
- Temperature has a **non-linear effect** on output quality - 0.7-0.8 was consistently the sweet spot across all three models
- Streaming makes slower models feel faster - the psychological impact of seeing tokens appear is significant
- The "evaluation surface" (rating outputs) fundamentally changes how users interact with the tool - they become more critical and systematic

## Design Decisions

### Why localStorage over SQLite?

For a demo/evaluation tool, localStorage provides sufficient persistence without the complexity of setting up a database. All experiments are stored as JSON and can be exported at any time.

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
1. **Alternative interaction modes** - Image input for multimodal models, voice input
2. **System prompt configuration** - UI for setting system prompts per model
3. **Model parameter presets per model** - Different defaults for different model types
4. **Batch evaluation** - Run same prompt across all models simultaneously
5. **A/B comparison with blind rating** - Hide model names during evaluation to reduce bias
6. **Session/conversation history** - Group related experiments into sessions

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
