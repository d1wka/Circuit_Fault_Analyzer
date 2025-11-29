# Circuit Fault Analyzer

An AI-powered tool for diagnosing faults in electrical circuits. Describe a circuit in plain English (or pick one from the built-in schematic library), and Google Gemini identifies its components, detects faults, explains why they are dangerous, suggests fixes, and gives an overall health rating.

## Features

- **Natural-language input** — describe components, topology and values; optionally add supply voltage, expected current and frequency.
- **Fault diagnosis** — detects short circuits, open circuits, overloads, wrong polarity and similar issues, each with a location, severity (HIGH / MEDIUM / LOW) and explanation.
- **Recommended fixes** — concrete actions, with component values where applicable.
- **Health rating** — `SAFE`, `WARNING` or `CRITICAL`, plus a plain-English summary.
- **Circuit library** — 8 templates with hand-drawn SVG schematics, which pre-fill the form:

  | Category      | Template                | Fault? |
  | ------------- | ----------------------- | :----: |
  | Common Faults | LED – No Resistor       |   ⚠    |
  | Common Faults | LED – With Resistor     |        |
  | Common Faults | H-Bridge Shoot-Through  |   ⚠    |
  | Filters       | RC Low-Pass Filter      |        |
  | Filters       | RC High-Pass Filter     |        |
  | AC Circuits   | Series RLC Circuit      |        |
  | DC Circuits   | Voltage Divider         |        |
  | DC Circuits   | Half-Wave Rectifier     |        |

## Tech Stack

| Layer    | Technology                                                  |
| -------- | ----------------------------------------------------------- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend  | Python, FastAPI, Uvicorn, Pydantic                          |
| AI       | Google Gemini (`gemini-3-flash-preview`) via `google-generativeai` |

## Project Structure

```
01-circuit-fault-analyzer/
├── backend/
│   ├── main.py                    # FastAPI app: /analyze and /examples endpoints
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── tailwind.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx           # Main UI: sidebar library, input form, results
        │   └── globals.css
        └── components/
            └── CircuitDiagrams.tsx  # SVG schematic primitives + template registry
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

export GEMINI_API_KEY="your-api-key"   # Windows: set GEMINI_API_KEY=your-api-key
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

> The key is read from the `GEMINI_API_KEY` environment variable at startup; the server will fail to start if it is not set.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The frontend calls the backend at `http://localhost:8000`, and the backend's CORS policy allows `localhost:3000` and `localhost:3001`. Change these in `frontend/src/app/page.tsx` and `backend/main.py` if you use different ports.

## Usage

1. Pick a template from the **Circuit Library** sidebar (red ⚠ = circuit with a known fault), or write your own description.
2. Optionally fill in **Voltage (V)**, **Current (A)** and **Frequency (Hz)**.
3. Click **Analyze Circuit with Gemini**.
4. Review the health rating, summary, identified components, detected faults and recommended fixes.

## API Reference

### `POST /analyze`

Analyzes a circuit description.

**Request**

```json
{
  "description": "5V power supply connected directly to an LED with no current limiting resistor",
  "voltage": 5.0,
  "current": null,
  "frequency": null
}
```

Only `description` is required.

**Response**

```json
{
  "raw_analysis": "...",
  "components": ["5V power supply", "LED"],
  "faults": [
    {
      "type": "Overcurrent",
      "location": "LED",
      "severity": "HIGH",
      "explanation": "..."
    }
  ],
  "fixes": [
    {
      "fault_ref": "Overcurrent",
      "action": "Add a current-limiting resistor",
      "details": "..."
    }
  ],
  "health_rating": "CRITICAL",
  "summary": "..."
}
```

`health_rating` is one of `SAFE`, `WARNING`, `CRITICAL` (or `UNKNOWN` if the model omits it). Errors return HTTP 500 with the error message in `detail`.

### `GET /examples`

Returns a few sample circuit descriptions (LED without resistor, H-bridge shoot-through, RC filter) that can be sent to `/analyze`.

## Notes

- Results come from a large language model and may be incomplete or wrong. Treat them as a study aid, not a substitute for proper circuit analysis or safety review.
- The Gemini model name is set in `backend/main.py`; change it there if that model is unavailable to your API key.
