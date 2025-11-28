from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
# Note: pydp must be installed. 
# If pydp is not available, we might need to mock it or use a different approach.
# Assuming pydp is installed as per requirements.txt
try:
    from pydp.algorithms.laplacian import BoundedSum, BoundedMean, Count
except ImportError:
    # Mocking for now if pydp is not installed in the environment where this runs
    # In a real scenario, we would ensure dependencies are installed.
    class MockAlgo:
        def __init__(self, epsilon, lower_bound=0, upper_bound=0):
            pass
        def quick_result(self, data):
            return 0
    BoundedSum = MockAlgo
    BoundedMean = MockAlgo
    Count = MockAlgo

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DPRequest(BaseModel):
    data: List[float]
    epsilon: float
    lower_bound: float
    upper_bound: float

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/calculate")
def calculate_dp(request: DPRequest):
    """Calculate differentially private statistics.
    Uses Laplace mechanism for sum and mean, and adds noise to count.
    """
    import numpy as np
    # Validate bounds
    if request.lower_bound >= request.upper_bound:
        raise HTTPException(status_code=400, detail="lower_bound must be less than upper_bound")
    # Sensitivity calculations
    range_val = request.upper_bound - request.lower_bound
    # Laplace scale = sensitivity / epsilon
    scale = range_val / request.epsilon if request.epsilon != 0 else float('inf')
    # Count (sensitivity 1)
    dp_count = len(request.data) + np.random.laplace(0, 1 / request.epsilon) if request.epsilon != 0 else len(request.data)
    # Sum
    actual_sum = sum(request.data)
    dp_sum = actual_sum + np.random.laplace(0, scale)
    # Mean
    actual_mean = actual_sum / len(request.data) if request.data else 0
    dp_mean = actual_mean + np.random.laplace(0, scale / len(request.data)) if request.data else 0
    return {
        "count": dp_count,
        "sum": dp_sum,
        "mean": dp_mean,
        "actual_count": len(request.data),
        "actual_sum": actual_sum,
        "actual_mean": actual_mean,
    }
