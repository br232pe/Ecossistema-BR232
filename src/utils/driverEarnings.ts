export interface EarningsBreakdown {
  grossRevenue: number;
  maintenanceFund: number;
  reserveFund: number;
  fuelCost: number;
  netProfit: number;
}

/**
 * Calculates the driver earnings breakdown with automatic financial allocation
 * and exact cents discrepancy correction applied to the largest portion.
 */
export function calculateEarningsBreakdown(totalFare: number): EarningsBreakdown {
  const grossRevenue = Math.round(totalFare * 100) / 100;
  
  // Portions allocations
  let maintenanceFund = Math.round(grossRevenue * 0.10 * 100) / 100; // 10%
  let reserveFund = Math.round(grossRevenue * 0.05 * 100) / 100;     // 5%
  let fuelCost = Math.round(grossRevenue * 0.15 * 100) / 100;        // 15%
  let netProfit = Math.round(grossRevenue * 0.70 * 100) / 100;       // Remaining (~70%)

  // Check sum discrepancies
  const totalAllocated = Math.round((maintenanceFund + reserveFund + fuelCost + netProfit) * 100) / 100;
  const difference = Math.round((grossRevenue - totalAllocated) * 100) / 100;

  if (difference !== 0) {
    // Dynamic choice of the largest portion to apply residual cents
    const portions = [
      { key: 'maintenanceFund', value: maintenanceFund },
      { key: 'reserveFund', value: reserveFund },
      { key: 'fuelCost', value: fuelCost },
      { key: 'netProfit', value: netProfit }
    ];
    
    let maxIndex = 0;
    for (let i = 1; i < portions.length; i++) {
      if (portions[i].value > portions[maxIndex].value) {
        maxIndex = i;
      }
    }
    
    const targetKey = portions[maxIndex].key;
    if (targetKey === 'maintenanceFund') {
      maintenanceFund = Math.round((maintenanceFund + difference) * 100) / 100;
    } else if (targetKey === 'reserveFund') {
      reserveFund = Math.round((reserveFund + difference) * 100) / 100;
    } else if (targetKey === 'fuelCost') {
      fuelCost = Math.round((fuelCost + difference) * 100) / 100;
    } else {
      netProfit = Math.round((netProfit + difference) * 100) / 100;
    }
  }

  return {
    grossRevenue,
    maintenanceFund,
    reserveFund,
    fuelCost,
    netProfit
  };
}
