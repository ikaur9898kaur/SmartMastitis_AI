from typing import Dict, Any, List
from app.models.all_models import IndividualBaseline, Animal, MilkReading, CollarReading

def calculate_metric_deviation(current: float, baseline: float, metric_name: str) -> Dict[str, Any]:
    if baseline == 0:
        pct_change = 0.0
    else:
        pct_change = round(((current - baseline) / baseline) * 100.0, 1)
    
    abs_change = round(current - baseline, 2)
    
    status = "Normal"
    # Clinical/sensor risk thresholds for individual deviations
    if metric_name.lower() == "conductivity":
        if pct_change >= 15.0:
            status = "Critical"
        elif pct_change >= 8.0:
            status = "Elevated"
        elif pct_change <= -10.0:
            status = "Abnormal"
    elif metric_name.lower() in ["yield", "milkyield", "milk_yield"]:
        if pct_change <= -20.0:
            status = "Critical Drop"
        elif pct_change <= -10.0:
            status = "Decreased"
    elif metric_name.lower() == "activity":
        if pct_change <= -30.0:
            status = "Significant Drop"
        elif pct_change <= -15.0:
            status = "Decreased"
        elif pct_change >= 40.0:
            status = "Restless / Agitated"
    elif metric_name.lower() == "rumination":
        if pct_change <= -20.0:
            status = "Significant Drop"
        elif pct_change <= -10.0:
            status = "Decreased"
    elif metric_name.lower() == "ph":
        if current > 6.75 or current < 6.45:
            status = "Abnormal"
        elif pct_change >= 2.0:
            status = "Elevated"
    elif metric_name.lower() == "surface_temperature":
        if abs_change >= 1.0:
            status = "Elevated"
    
    return {
        "metric": metric_name,
        "current": round(current, 2),
        "baseline": round(baseline, 2),
        "absolute_change": abs_change,
        "percentage_change": pct_change,
        "status": status
    }

def get_animal_baseline_deviations(animal: Animal, baseline: IndividualBaseline, current_telemetry: Dict[str, float]) -> List[Dict[str, Any]]:
    results = []
    
    # 1. Milk Conductivity
    cond_curr = current_telemetry.get("conductivity", baseline.baseline_conductivity)
    d_cond = calculate_metric_deviation(cond_curr, baseline.baseline_conductivity, "Milk Conductivity")
    d_cond["source"] = "Milk Sensor"
    d_cond["unit"] = "mS/cm"
    results.append(d_cond)
    
    # 2. Milk Yield
    yield_curr = current_telemetry.get("milk_yield", baseline.baseline_milk_yield)
    d_yield = calculate_metric_deviation(yield_curr, baseline.baseline_milk_yield, "Milk Yield")
    d_yield["source"] = "Milk Sensor"
    d_yield["unit"] = "kg/session"
    results.append(d_yield)
    
    # 3. Activity
    act_curr = current_telemetry.get("activity", baseline.baseline_activity)
    d_act = calculate_metric_deviation(act_curr, baseline.baseline_activity, "Activity Level")
    d_act["source"] = "Smart Collar"
    d_act["unit"] = "/100"
    results.append(d_act)
    
    # 4. Rumination / Behaviour Proxy
    rum_curr = current_telemetry.get("rumination", baseline.baseline_rumination)
    d_rum = calculate_metric_deviation(rum_curr, baseline.baseline_rumination, "Rumination Duration")
    d_rum["source"] = "Estimated Rumination / Behaviour Proxy"
    d_rum["unit"] = "min/day"
    results.append(d_rum)
    
    # 5. Milk pH
    ph_curr = current_telemetry.get("ph", baseline.baseline_ph)
    d_ph = calculate_metric_deviation(ph_curr, baseline.baseline_ph, "Milk pH")
    d_ph["source"] = "Milk Sensor"
    d_ph["unit"] = "pH"
    results.append(d_ph)
    
    # 6. Surface Temperature
    temp_curr = current_telemetry.get("surface_temperature", baseline.baseline_surface_temp)
    d_temp = calculate_metric_deviation(temp_curr, baseline.baseline_surface_temp, "Surface Temperature")
    d_temp["source"] = "Smart Collar"
    d_temp["unit"] = "°C"
    results.append(d_temp)
    
    return results
