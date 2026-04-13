from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BriefRequest(BaseModel):
    brief: str


def build_layout(screen):
    if screen == "mobile_ui":
        return {
            "width": 390,
            "height": 844
        }, [
            {
                "type": "search_bar",
                "x": 20,
                "y": 20,
                "width": 350,
                "height": 50
            },
            {
                "type": "categories",
                "x": 20,
                "y": 90,
                "width": 350,
                "height": 100
            },
            {
                "type": "restaurant_cards",
                "x": 20,
                "y": 210,
                "width": 350,
                "height": 500
            },
            {
                "type": "bottom_navigation",
                "x": 0,
                "y": 780,
                "width": 390,
                "height": 64
            }
        ]

    elif screen == "dashboard":
        return {
            "width": 1200,
            "height": 800
        }, [
            {
                "type": "sidebar",
                "x": 0,
                "y": 0,
                "width": 220,
                "height": 800
            },
            {
                "type": "header",
                "x": 240,
                "y": 0,
                "width": 940,
                "height": 80
            },
            {
                "type": "chart",
                "x": 260,
                "y": 120,
                "width": 400,
                "height": 250
            },
            {
                "type": "table",
                "x": 700,
                "y": 120,
                "width": 450,
                "height": 250
            }
        ]

    return {
        "width": 1200,
        "height": 900
    }, [
        {
            "type": "navbar",
            "x": 0,
            "y": 0,
            "width": 1200,
            "height": 80
        },
        {
            "type": "hero",
            "x": 0,
            "y": 100,
            "width": 1200,
            "height": 300
        },
        {
            "type": "features",
            "x": 0,
            "y": 430,
            "width": 1200,
            "height": 250
        },
        {
            "type": "cta",
            "x": 0,
            "y": 720,
            "width": 1200,
            "height": 120
        }
    ]


@app.get("/")
def home():
    return {"message": "Backend is running successfully"}


@app.post("/generate")
def generate_wireframe(data: BriefRequest):
    try:
        prompt = f"""
        Classify this request into one:
        mobile_ui
        dashboard
        landing_page

        Request:
        {data.brief}

        Return ONLY valid JSON:
        {{
            "screen": "mobile_ui"
        }}
        """

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5:7b",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        result = response.json()

        raw_output = result.get("response", "").strip()

        print("RAW OLLAMA OUTPUT:", raw_output)

        screen = "landing_page"

        if "mobile_ui" in raw_output:
            screen = "mobile_ui"
        elif "dashboard" in raw_output:
            screen = "dashboard"

        canvas, components = build_layout(screen)

        variants = [
            {
                "name": "Variant A",
                "screen": screen,
                "canvas": canvas,
                "components": components
            },
            {
                "name": "Variant B",
                "screen": screen,
                "canvas": canvas,
                "components": components
            },
            {
                "name": "Variant C",
                "screen": screen,
                "canvas": canvas,
                "components": components
            }
        ]

        return {
            "status": "success",
            "wireframe": {
                "variants": variants
            }
        }

    except Exception as e:
        print("BACKEND ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))