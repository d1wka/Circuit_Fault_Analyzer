from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import google.generativeai as genai
import os

app = FastAPI(title="Circuit Fault Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3-flash-preview")

SYSTEM_PROMPT = """You are an expert electrical engineer specializing in circuit analysis and fault diagnosis.
When given a circuit description, you must:
1. Identify all components and their connections
2. Detect potential faults (short circuits, open circuits, overloads, wrong polarity, etc.)
3. Explain why each fault is dangerous or problematic
4. Suggest specific fixes with component values where applicable
5. Rate overall circuit health: SAFE / WARNING / CRITICAL

Respond in structured JSON with fields:
- components: list of identified components
- faults: list of {type, location, severity, explanation}
- fixes: list of {fault_ref, action, details}
- health_rating: "SAFE" | "WARNING" | "CRITICAL"
- summary: one-paragraph plain-English summary
"""


class CircuitRequest(BaseModel):
    description: str
    voltage: Optional[float] = None
    current: Optional[float] = None
    frequency: Optional[float] = None


class AnalysisResponse(BaseModel):
    raw_analysis: str
    components: List[str]
    faults: List[Dict[str, Any]]
    fixes: List[Dict[str, Any]]
    health_rating: str
    summary: str


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_circuit(req: CircuitRequest):
    context = f"Circuit Description: {req.description}"
    if req.voltage:
        context += f"\nSupply Voltage: {req.voltage}V"
    if req.current:
        context += f"\nExpected Current: {req.current}A"
    if req.frequency:
        context += f"\nFrequency: {req.frequency}Hz"

    prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\nProvide analysis as valid JSON only."

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        import json
        data = json.loads(raw)

        # Normalize components: Gemini sometimes returns objects instead of strings
        raw_components = data.get("components", [])
        components = [
            c.get("name", str(c)) if isinstance(c, dict) else str(c)
            for c in raw_components
        ]

        return AnalysisResponse(
            raw_analysis=response.text,
            components=components,
            faults=data.get("faults", []),
            fixes=data.get("fixes", []),
            health_rating=data.get("health_rating", "UNKNOWN"),
            summary=data.get("summary", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/examples")
async def get_examples():
    return {
        "examples": [
            {
                "title": "LED circuit with missing resistor",
                "description": "5V power supply connected directly to an LED with no current limiting resistor",
                "voltage": 5.0,
            },
            {
                "title": "Motor driver with reversed polarity",
                "description": "DC motor connected to H-bridge driver. Both high-side MOSFETs are ON simultaneously on the same half-bridge",
                "voltage": 12.0,
                "current": 2.0,
            },
            {
                "title": "RC filter design check",
                "description": "Low-pass RC filter: R=10kΩ, C=100nF, input signal 5Vpp at 1kHz. Output measured across capacitor.",
                "voltage": 5.0,
                "frequency": 1000.0,
            },
        ]
    }
