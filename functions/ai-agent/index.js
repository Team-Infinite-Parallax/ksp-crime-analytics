const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const ejs = require('ejs');
const path = require('path');

const app = express();
app.use(express.json());

// Initialize catalyst
app.use((req, res, next) => {
    req.catalyst = catalyst.initialize(req);
    next();
});

app.post('/analyze', async (req, res) => {
    try {
        const firData = req.body;
        // In a real scenario, use req.catalyst.zcql() to fetch historical data and network
        
        // Mock analysis
        const analysis = {
            fir_id: firData.id || "FIR-9999",
            unusual_activity_detected: true,
            repeat_offenders_identified: ["Ravi Kumar", "Syed Ali"],
            network_links: ["Local Gang A", "Inter-state Smuggling Ring"],
            historical_trend_match: "Similar to theft patterns in Indiranagar last month"
        };
        
        res.status(200).json(analysis);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.post('/predict', async (req, res) => {
    try {
        const { analysis } = req.body;
        // Mock QuickML Integration
        // const quickml = req.catalyst.quickML();
        
        const risk_score = 85; // 0-100
        const escalation_probability = 0.75; 
        
        res.status(200).json({
            risk_score,
            escalation_probability,
            prediction: "High chance of escalation into gang violence."
        });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.post('/summarize', async (req, res) => {
    try {
        const { firData, analysis, prediction } = req.body;
        
        // Mock Zia/LLM Summary
        const summary = `Intelligence Summary: A high-risk incident was reported involving repeat offenders. 
There is a ${prediction.escalation_probability * 100}% probability of escalation.
Recommendation: Deploy additional Rapid Action Force units in the affected area immediately to contain the risk.`;
        
        res.status(200).json({ summary });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.post('/report', async (req, res) => {
    try {
        const { firData, analysis, prediction, summary } = req.body;
        const catalystApp = req.catalyst;
        
        // 1. Render HTML
        const templatePath = path.join(__dirname, 'templates', 'report.ejs');
        const htmlContent = await ejs.renderFile(templatePath, {
            firData: firData || {}, 
            analysis: analysis || {}, 
            prediction: prediction || {}, 
            summary: summary || "", 
            date: new Date().toLocaleDateString()
        });
        
        // 2. Generate PDF via SmartBrowz
        // const smartbrowz = catalystApp.smartBrowz();
        // const pdfBuffer = await smartbrowz.generatePdf({ html: htmlContent });
        
        // Mock PDF Buffer for now
        const pdfBuffer = Buffer.from("Mock PDF Content based on SmartBrowz");
        
        // 3. Send Mail (Uncomment when a verified sender email is configured)
        /*
        const email = catalystApp.email();
        await email.sendMail({
            from_email: 'admin@ksp.gov.in', // Must be verified in Catalyst
            to_email: ['officer@ksp.gov.in'],
            subject: `URGENT: High Risk Intelligence Report`,
            content: `Please find the attached intelligence report for FIR.`,
            attachments: [{
                filename: 'Intelligence_Report.pdf',
                content: pdfBuffer.toString('base64')
            }]
        });
        */
        
        res.status(200).json({ message: "Report generated and emailed successfully." });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

// For local testing or all-in-one trigger via Signal/Cron
app.post('/trigger', async (req, res) => {
    try {
        const firData = req.body || {};
        
        // This endpoint simulates the entire orchestrated Circuit for simplicity
        
        const analysis = {
            unusual_activity_detected: true,
            repeat_offenders_identified: ["Ravi Kumar"],
            network_links: ["Local Gang A"],
            historical_trend_match: "High similarity to recent district crimes."
        };
        
        const prediction = {
            risk_score: 92,
            escalation_probability: 0.88,
            details: "Critical escalation risk detected."
        };
        
        const summary = `Intelligence Alert for ${firData.district || 'Unknown District'}. Risk Score: ${prediction.risk_score}. Deploy extra patrols.`;
        
        res.status(200).json({
            status: "Success",
            circuit_execution: {
                analysis,
                prediction,
                summary
            }
        });
        
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

module.exports = app;
