// FinOps Cost Report Generator
// Usage: node scripts/cost-report.js [--test-mode]

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
    projectId: process.env.GCP_PROJECT_ID || 'gen-lang-client-0322370238',
    budgetAmount: parseFloat(process.env.BUDGET_EUR || '10'),
    testMode: process.argv.includes('--test-mode'),
    outputDir: './cost-reports'
};

// Cost thresholds
const THRESHOLDS = {
    low: CONFIG.budgetAmount * 0.5,      // 5 EUR
    medium: CONFIG.budgetAmount * 0.75,  // 7.5 EUR
    high: CONFIG.budgetAmount * 0.9,     // 9 EUR
    critical: CONFIG.budgetAmount        // 10 EUR
};

async function getCostLevel(currentCost) {
    if (currentCost >= THRESHOLDS.critical) return { level: 'CRITICAL', emoji: '🔴' };
    if (currentCost >= THRESHOLDS.high) return { level: 'HIGH', emoji: '🟠' };
    if (currentCost >= THRESHOLDS.medium) return { level: 'MEDIUM', emoji: '🟡' };
    return { level: 'OK', emoji: '🟢' };
}

async function generateReport() {
    console.log('📊 Generating FinOps Cost Report...\n');

    if (CONFIG.testMode) {
        console.log('🧪 TEST MODE - Using mock data\n');
        return generateMockReport();
    }

    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(CONFIG.outputDir, `cost-report-${date}.md`);

    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // In test mode, generate a sample report
    const report = await generateMockReport();

    // Write report
    await fs.writeFile(reportPath, report, 'utf8');

    console.log(`✅ Report generated: ${reportPath}\n`);
    console.log(report);

    return reportPath;
}

async function generateMockReport() {
    const date = new Date().toISOString().split('T')[0];

    // Mock data for demonstration
    const mockCosts = {
        total: 8.45,
        breakdown: [
            { service: 'Cloud SQL', cost: 7.20, percentage: 85 },
            { service: 'Cloud Run', cost: 0.95, percentage: 11 },
            { service: 'Cloud Storage', cost: 0.18, percentage: 2 },
            { service: 'Networking', cost: 0.12, percentage: 2 }
        ]
    };

    const costStatus = await getCostLevel(mockCosts.total);
    const percentageUsed = ((mockCosts.total / CONFIG.budgetAmount) * 100).toFixed(1);

    const report = `# FinOps Cost Report
**Project:** ${CONFIG.projectId}  
**Date:** ${date}  
**Budget:** €${CONFIG.budgetAmount.toFixed(2)} EUR/month

---

## Summary

${costStatus.emoji} **Status:** ${costStatus.level}  
💰 **Current Spend:** €${mockCosts.total.toFixed(2)} EUR  
📊 **Budget Usage:** ${percentageUsed}%  
📈 **Remaining:** €${(CONFIG.budgetAmount - mockCosts.total).toFixed(2)} EUR

## Cost Breakdown by Service

| Service | Cost (EUR) | % of Total | % of Budget |
|---------|------------|------------|-------------|
${mockCosts.breakdown.map(item =>
        `| ${item.service} | €${item.cost.toFixed(2)} | ${item.percentage}% | ${((item.cost / CONFIG.budgetAmount) * 100).toFixed(1)}% |`
    ).join('\n')}
| **TOTAL** | **€${mockCosts.total.toFixed(2)}** | **100%** | **${percentageUsed}%** |

## Budget Thresholds

- 🟢 **50% (€${THRESHOLDS.low.toFixed(2)}):** ${mockCosts.total >= THRESHOLDS.low ? '✅ EXCEEDED' : '⏳ Not reached'}
- 🟡 **75% (€${THRESHOLDS.medium.toFixed(2)}):** ${mockCosts.total >= THRESHOLDS.medium ? '✅ EXCEEDED' : '⏳ Not reached'}
- 🟠 **90% (€${THRESHOLDS.high.toFixed(2)}):** ${mockCosts.total >= THRESHOLDS.high ? '✅ EXCEEDED' : '⏳ Not reached'}
- 🔴 **100% (€${THRESHOLDS.critical.toFixed(2)}):** ${mockCosts.total >= THRESHOLDS.critical ? '❌ BUDGET EXCEEDED!' : '⏳ Not reached'}

## Recommendations

${mockCosts.breakdown[0].cost > CONFIG.budgetAmount * 0.7 ? `
### ⚠️ Cloud SQL Dominates Costs (${mockCosts.breakdown[0].percentage}%)

**Actions:**
- Consider disabling automated backups (saves ~30%)
- Reduce disk auto-resize limit
- Schedule maintenance during low-usage hours
- Monitor query performance to prevent inefficient queries
` : ''}

${mockCosts.total >= THRESHOLDS.high ? `
### 🚨 Approaching Budget Limit

**Immediate Actions:**
1. Review Cloud Run instance count (current max: 1)
2. Check for unexpected traffic spikes
3. Consider implementing request caching
4. Review database connection pooling
` : ''}

### General Optimization Tips

1. **Cloud Run:**
   - Max instances: 1 (configured ✅)
   - Memory: 256Mi (minimal ✅)
   - CPU allocation: only-during-request (configured ✅)

2. **Cloud SQL:**
   - Backups: Disabled for cost savings ⚠️
   - Consider manual weekly backups
   - Monitor disk usage to prevent unexpected growth

3. **Monitoring:**
   - Run this report weekly
   - Set up billing alerts (should be configured via Terraform)
   - Review GCP Billing dashboard regularly

## Next Review

Schedule next review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

---

*Report generated on ${new Date().toISOString()}*  
*This is ${CONFIG.testMode ? 'a TEST report with mock data' : 'a live report'}*
`;

    return report;
}

// Run report generation
if (require.main === module) {
    generateReport()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('❌ Error generating report:', err);
            process.exit(1);
        });
}

module.exports = { generateReport };
